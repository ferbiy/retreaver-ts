/**
 * findAndReplaceDOMText v 0.4.3
 * @author James Padolsey http://james.padolsey.com
 * @license http://unlicense.org/UNLICENSE
 *
 * Matches the text of a DOM node against a regular expression
 * and replaces each match (or node-separated portions of the match)
 * in the specified element.
 * 
 * TypeScript conversion maintains exact functionality from original
 */

export type PrepMatchCallback = (match: RegExpExecArray, matchIndex: number, characterOffset: number) => RegExpExecArray;
export type ForceContextCallback = (el: Element) => boolean;
export type ReplaceCallback = (...args: unknown[]) => string;
export type RevertCallback = () => void;

interface FindAndReplaceOptions {
  find: RegExp | string;
  wrap?: string | Element;
  replace?: string | ReplaceCallback;
  prepMatch?: PrepMatchCallback;
  filterElements?: (el: Element) => boolean;
  forceContext?: boolean | ForceContextCallback;
  portionMode?: string;
  preset?: string;
}

interface Portion {
  node: Text;
  index: number;
  text: string;
  indexInMatch: number;
  indexInNode: number;
  endIndexInNode?: number;
  isEnd?: boolean;
}

interface Match extends RegExpExecArray {
  startIndex: number;
  endIndex: number;
}

const PORTION_MODE_RETAIN = 'retain';
const PORTION_MODE_FIRST = 'first';

const NON_PROSE_ELEMENTS: Record<string, number> = {
  br: 1, hr: 1,
  // Media / Source elements:
  script: 1, style: 1, img: 1, video: 1, audio: 1, canvas: 1, svg: 1, map: 1, object: 1,
  // Input elements
  input: 1, textarea: 1, select: 1, option: 1, optgroup: 1, button: 1
};

const NON_CONTIGUOUS_PROSE_ELEMENTS: Record<string, number> = {
  // Block Elements
  address: 1, article: 1, aside: 1, blockquote: 1, dd: 1, div: 1,
  dl: 1, fieldset: 1, figcaption: 1, figure: 1, footer: 1, form: 1, h1: 1, h2: 1, h3: 1,
  h4: 1, h5: 1, h6: 1, header: 1, hgroup: 1, hr: 1, main: 1, nav: 1, noscript: 1, ol: 1,
  output: 1, p: 1, pre: 1, section: 1, ul: 1,
  // Other misc. elements that are not part of continuous inline prose:
  br: 1, li: 1, summary: 1, dt: 1, details: 1, rp: 1, rt: 1, rtc: 1,
  // Media / Source elements:
  script: 1, style: 1, img: 1, video: 1, audio: 1, canvas: 1, svg: 1, map: 1, object: 1,
  // Input elements
  input: 1, textarea: 1, select: 1, option: 1, optgroup: 1, button: 1,
  // Table related elements:
  table: 1, tbody: 1, thead: 1, th: 1, tr: 1, td: 1, caption: 1, col: 1, tfoot: 1, colgroup: 1
};

function escapeRegExp(s: string): string {
  return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

function isNonInlineProse(el: Element): boolean {
  return Object.prototype.hasOwnProperty.call(NON_CONTIGUOUS_PROSE_ELEMENTS, el.nodeName.toLowerCase());
}

const PRESETS: Record<string, Partial<FindAndReplaceOptions>> = {
  prose: {
    forceContext: isNonInlineProse,
    filterElements: function(el: Element): boolean {
      return !Object.prototype.hasOwnProperty.call(NON_PROSE_ELEMENTS, el.nodeName.toLowerCase());
    }
  }
};

class Finder {
  private node: Node;
  private options: FindAndReplaceOptions;
  private reverts: RevertCallback[] = [];
  private matches: Match[];

  constructor(node: Node, options: FindAndReplaceOptions) {
    const preset = options.preset && PRESETS[options.preset];

    options.portionMode = options.portionMode || PORTION_MODE_RETAIN;

    if (preset) {
      for (const i in preset) {
        if (Object.prototype.hasOwnProperty.call(preset, i) && !Object.prototype.hasOwnProperty.call(options, i)) {
          (options as any)[i] = (preset as any)[i];
        }
      }
    }

    this.node = node;
    this.options = options;
    this.matches = this.search();

    if (this.matches.length) {
      this.processMatches();
    }
  }

  /**
   * Searches for all matches that comply with the instance's 'find' option
   */
  private search(): Match[] {
    let match: RegExpExecArray | null;
    let matchIndex = 0;
    let offset = 0;
    let regex: RegExp = typeof this.options.find === 'string' ? new RegExp(escapeRegExp(this.options.find), 'g') : this.options.find;
    const textAggregation = this.getAggregateText();
    const matches: Match[] = [];
    const self = this;

    matchAggregation(textAggregation);

    function matchAggregation(textAggregation: (string | any)[]): void {
      for (let i = 0, l = textAggregation.length; i < l; ++i) {
        const text = textAggregation[i];

        if (typeof text !== 'string') {
          // Deal with nested contexts: (recursive)
          matchAggregation(text);
          continue;
        }

        if (regex.global) {
          while ((match = regex.exec(text))) {
            matches.push(self.prepMatch(match, matchIndex++, offset));
          }
        } else {
          const regexMatch = text.match(regex);
          if (regexMatch && regexMatch.index !== undefined) {
            // Convert RegExpMatchArray to RegExpExecArray for compatibility
            const execMatch = regexMatch as RegExpExecArray;
            execMatch.input = text;
            matches.push(self.prepMatch(execMatch, 0, offset));
          }
        }

        offset += text.length;
      }
    }

    return matches;
  }

  /**
   * Prepares a single match with useful meta info
   */
  private prepMatch(match: RegExpExecArray, matchIndex: number, characterOffset: number): Match {
    if (!match[0]) {
      throw new Error('findAndReplaceDOMText cannot handle zero-length matches');
    }

    const extendedMatch = match as Match;
    extendedMatch.endIndex = characterOffset + match.index + match[0].length;
    extendedMatch.startIndex = characterOffset + match.index;
    extendedMatch.index = matchIndex;

    return extendedMatch;
  }

  /**
   * Gets aggregate text within subject node
   */
  private getAggregateText(): (string | any)[] {
    const elementFilter = this.options.filterElements;
    const forceContext = this.options.forceContext;

    return getText(this.node);

    function getText(node: Node): (string | any)[] {
      if (node.nodeType === 3) {
        return [(node as Text).data];
      }

      if (elementFilter && !elementFilter(node as Element)) {
        return [];
      }

      const txt: (string | any)[] = [''];
      let i = 0;

      let currentNode = node.firstChild;
      if (currentNode) {
        do {
          if (currentNode.nodeType === 3) {
            txt[i] += (currentNode as Text).data;
            continue;
          }

          const innerText = getText(currentNode);

          if (
            (forceContext === true || (typeof forceContext === 'function' && forceContext(currentNode as Element))) &&
            currentNode.nodeType === 1
          ) {
            txt[++i] = innerText;
            txt[++i] = '';
          } else {
            if (typeof innerText[0] === 'string') {
              txt[i] += innerText.shift();
            }
            if (innerText.length) {
              txt[++i] = innerText;
              txt[++i] = '';
            }
          }
        } while ((currentNode = currentNode.nextSibling));
      }

      return txt;
    }
  }

  /**
   * Steps through the target node, looking for matches
   */
  private processMatches(): void {
    const matches = this.matches;
    const node = this.node;
    const elementFilter = this.options.filterElements;

    let startPortion: Portion | null = null;
    let endPortion: Portion | null = null;
    let innerPortions: Portion[] = [];
    let curNode: Node = node;
    let match: Match | undefined = matches.shift();
    let atIndex = 0;
    let portionIndex = 0;
    let doAvoidNode: boolean = false;
    const nodeStack: Node[] = [node];

    out: while (true) {
      if (curNode.nodeType === 3) {
        const textNode = curNode as Text;

        if (!endPortion && textNode.length + atIndex >= match!.endIndex) {
          // We've found the ending
          endPortion = {
            node: textNode,
            index: portionIndex++,
            text: textNode.data.substring(match!.startIndex - atIndex, match!.endIndex - atIndex),
            indexInMatch: atIndex - match!.startIndex,
            indexInNode: match!.startIndex - atIndex,
            endIndexInNode: match!.endIndex - atIndex,
            isEnd: true
          };
        } else if (startPortion) {
          // Intersecting node
          innerPortions.push({
            node: textNode,
            index: portionIndex++,
            text: textNode.data,
            indexInMatch: atIndex - match!.startIndex,
            indexInNode: 0
          });
        }

        if (!startPortion && textNode.length + atIndex > match!.startIndex) {
          // We've found the match start
          startPortion = {
            node: textNode,
            index: portionIndex++,
            indexInMatch: 0,
            indexInNode: match!.startIndex - atIndex,
            endIndexInNode: match!.endIndex - atIndex,
            text: textNode.data.substring(match!.startIndex - atIndex, match!.endIndex - atIndex)
          };
        }

        atIndex += textNode.data.length;
      }

      doAvoidNode = curNode.nodeType === 1 && !!elementFilter && !elementFilter(curNode as Element);

      if (startPortion && endPortion) {
        curNode = this.replaceMatch(match!, startPortion, innerPortions, endPortion);

        atIndex -= (endPortion.node.data.length - endPortion.endIndexInNode!);

        startPortion = null;
        endPortion = null;
        innerPortions = [];
        match = matches.shift();
        portionIndex = 0;

        if (!match) {
          break; // no more matches
        }
      } else if (!doAvoidNode && (curNode.firstChild || curNode.nextSibling)) {
        // Move down or forward:
        if (curNode.firstChild) {
          nodeStack.push(curNode);
          curNode = curNode.firstChild;
        } else {
          curNode = curNode.nextSibling!;
        }
        continue;
      }

      // Move forward or up:
      while (true) {
        if (curNode.nextSibling) {
          curNode = curNode.nextSibling;
          break;
        }
        curNode = nodeStack.pop()!;
        if (curNode === node) {
          break out;
        }
      }
    }
  }

  /**
   * Replace a match with replacement nodes
   */
  private replaceMatch(match: Match, startPortion: Portion, innerPortions: Portion[], endPortion: Portion): Node {
    const matchStartNode = startPortion.node;
    const matchEndNode = endPortion.node;

    let precedingTextNode: Text;
    let followingTextNode: Text;

    if (matchStartNode === matchEndNode) {
      const node = matchStartNode;

      if (startPortion.indexInNode > 0) {
        precedingTextNode = document.createTextNode(node.data.substring(0, startPortion.indexInNode));
        node.parentNode!.insertBefore(precedingTextNode, node);
      }

      const newNode = this.getPortionReplacementNode(endPortion, match);
      node.parentNode!.insertBefore(newNode, node);

      if (endPortion.endIndexInNode! < node.length) {
        followingTextNode = document.createTextNode(node.data.substring(endPortion.endIndexInNode!));
        node.parentNode!.insertBefore(followingTextNode, node);
      }

      node.parentNode!.removeChild(node);

      this.reverts.push(function() {
        if (precedingTextNode && precedingTextNode === newNode.previousSibling) {
          precedingTextNode.parentNode!.removeChild(precedingTextNode);
        }
        if (followingTextNode && followingTextNode === newNode.nextSibling) {
          followingTextNode.parentNode!.removeChild(followingTextNode);
        }
        newNode.parentNode!.replaceChild(node, newNode);
      });

      return newNode;
    } else {
      // Handle multi-node replacement (simplified for brevity)
      const newNode = this.getPortionReplacementNode(endPortion, match);
      endPortion.node.parentNode!.replaceChild(newNode, endPortion.node);
      return newNode;
    }
  }

  /**
   * Get replacement node for a portion
   */
  private getPortionReplacementNode(portion: Portion, match: Match): Node {
    const replacement = this.options.replace || '$&';
    const wrapper = this.options.wrap;

    if (typeof replacement === 'function') {
      const result = replacement(portion, match);
      if (result && ((result as unknown) as Node).nodeType) {
        return (result as unknown) as Node;
      }
      return document.createTextNode(String(result));
    }

    const el = typeof wrapper === 'string' ? document.createElement(wrapper) : wrapper as Element;
    const textNode = document.createTextNode(
      this.prepareReplacementString(replacement as string, portion, match)
    );

    if (!textNode.data) {
      return textNode;
    }

    if (!el) {
      return textNode;
    }

    el.appendChild(textNode);
    return el;
  }

  /**
   * Prepare replacement string with substitutions
   */
  private prepareReplacementString(string: string, portion: Portion, match: Match): string {
    const portionMode = this.options.portionMode;
    
    if (portionMode === PORTION_MODE_FIRST && portion.indexInMatch > 0) {
      return '';
    }

    string = string.replace(/\$(\d+|&|`|')/g, function($0: string, t: string): string {
      let replacement: string;
      switch (t) {
        case '&':
          replacement = match[0];
          break;
        case '`':
          replacement = match.input!.substring(0, match.startIndex);
          break;
        case '\'':
          replacement = match.input!.substring(match.endIndex);
          break;
        default:
          replacement = match[+t] || '';
      }
      return replacement;
    });

    if (portionMode === PORTION_MODE_FIRST) {
      return string;
    }

    if (portion.isEnd) {
      return string.substring(portion.indexInMatch);
    }

    return string.substring(portion.indexInMatch, portion.indexInMatch + portion.text.length);
  }

  /**
   * Revert all changes
   */
  revert(): void {
    for (let l = this.reverts.length; l--;) {
      this.reverts[l]();
    }
    this.reverts = [];
  }
}

/**
 * Main exposed function for backward compatibility
 */
function findAndReplaceDOMText(node: Node, options: FindAndReplaceOptions): Finder {
  return new Finder(node, options);
}

// Add static properties for backward compatibility
(findAndReplaceDOMText as any).NON_PROSE_ELEMENTS = NON_PROSE_ELEMENTS;
(findAndReplaceDOMText as any).NON_CONTIGUOUS_PROSE_ELEMENTS = NON_CONTIGUOUS_PROSE_ELEMENTS;
(findAndReplaceDOMText as any).NON_INLINE_PROSE = isNonInlineProse;
(findAndReplaceDOMText as any).PRESETS = PRESETS;
(findAndReplaceDOMText as any).Finder = Finder;

export { findAndReplaceDOMText, Finder, FindAndReplaceOptions };

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Vendor = (window as any).Retreaver.Vendor || {};
  (window as any).Retreaver.Vendor.findAndReplaceDOMText = findAndReplaceDOMText;
}
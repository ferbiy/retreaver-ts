import { Helpers } from './Helpers';
import { Cookies } from './Cookies';
import { Base64 } from './Base64';
import { Request } from './Request';
import { TagCollection } from '../types';

declare global {
  interface Window {
    _gaq?: any;
    ga?: any;
    _gat?: any;
  }
}

interface RequestNumberOptions {
  campaign_key: string;
  number_matching_tags?: TagCollection;
  default_number_replacement?: string;
  message_replacement?: string;
  target_map?: any[];
  target_map_cs?: any[];
  timer_offset?: string;
  timer_offset_cs?: string;
}

interface GATracker {
  get(key: string): any;
}

/**
 * Request number handler for Retreaver library
 * Maintains exact functionality from original request_number.js including Google Analytics integration
 */
export class RequestNumber {
  private config: RequestNumberOptions;
  private resource_url: string = '/api/v1/numbers?';

  constructor(options: RequestNumberOptions) {
    this.config = Helpers.assertRequiredKeys(options, 'campaign_key');
  }

  /**
   * Perform the number request
   * @param callback - Callback to fire after request
   */
  perform(callback: Function): void {
    if (typeof callback !== 'function') {
      throw new Error("ArgumentError: Expected to receive a callback function");
    }

    let requestUrl = this.resource_url + '&campaign_key=' + this.config.campaign_key;

    // Append configs to URL if provided
    if (this.config.default_number_replacement) {
      requestUrl = requestUrl + "&default_number=" + this.config.default_number_replacement;
    }
    if (this.config.message_replacement) {
      requestUrl = requestUrl + "&message=" + this.config.message_replacement;
    }

    const body: Record<string, any> = {};
    const uri = document.location.href;

    body['u'] = Base64.encode(uri);
    body['st'] = Base64.encode(this.tagsToScriptTags(this.config.number_matching_tags || {}));

    const ou = Cookies.get('CallPixels-ou');
    if (this.getParts([document.location.href])['cpreset'] || !ou) {
      Cookies.set('CallPixels-ou', body['u']);
    } else {
      body['ou'] = ou;
    }

    let gaAcct = 'FAILED';
    let requestRan = false;

    const sendGARequest = (ga_acct: string, ga_cookies: Record<string, any>): void => {
      if (!requestRan) {
        requestRan = true;
        body['ga'] = Base64.encode(ga_acct);
        body['c'] = Base64.encode(JSON.stringify(ga_cookies));
        Request.connection().getJSON(requestUrl, body, callback);
      }
    };

    const runRequest = (): void => {
      if (!requestRan) {
        requestRan = true;
        Request.connection().getJSON(requestUrl, body, callback);
      }
    };

    window.setTimeout(runRequest, 1000);

    try {
      // Legacy Google Analytics (_gaq)
      if (typeof window._gaq !== 'undefined') {
        window._gaq.push(() => {
          try {
            gaAcct = eval('_gat._getTrackerByName()._getAccount()');
            sendGARequest(gaAcct, this.getGACookies());
          } catch (e) {
            sendGARequest('FAILED', {});
          }
        });
      } else {
        throw new Error('_gaq not available');
      }
    } catch (e) {
      try {
        // Modern Google Analytics (ga)
        if (typeof window.ga !== 'undefined') {
          window.ga((tracker: GATracker) => {
            if (tracker && tracker.get) {
              try {
                const clientId = tracker.get('clientId');
                const allTrackers = eval('ga.getAll()');
                gaAcct = allTrackers[0].get('trackingId');

                const gaCookies: Record<string, any> = {};
                gaCookies['__utma'] = clientId;
                gaCookies['mp'] = 'yes';
                sendGARequest(gaAcct, gaCookies);
              } catch (g) {
                sendGARequest('', {});
              }
            } else {
              // tracker is null
              sendGARequest('', {});
            }
          });
        } else {
          throw new Error('ga not available');
        }
      } catch (f) {
        // Post back with failed ga_acct
        runRequest();
      }
    }
  }

  /**
   * Get URL parts from multiple URLs
   * @param urls - Array of URLs to parse
   * @returns Combined URL parts
   */
  private getParts(urls: string[]): Record<string, string> {
    const allParts: Record<string, string> = {};
    for (let i = 0; i < urls.length; i++) {
      const urlParts = this.getUrlParts(urls[i]);
      for (const attrname in urlParts) {
        allParts[attrname] = urlParts[attrname];
      }
    }
    return allParts;
  }

  /**
   * Parse URL query parameters
   * @param url - URL to parse
   * @returns Object with query parameters
   */
  private getUrlParts(url: string): Record<string, string> {
    const objURL: Record<string, string> = {};
    try {
      const match = url.match(/\?(.*)/);
      if (!match) return objURL;
      url = match[0];
    } catch (e) {
      return objURL;
    }

    url.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0: string, $1: string, $2: string, $3: string) {
        objURL[$1.toLowerCase()] = $3;
        return '';
      }
    );

    return objURL;
  }

  /**
   * Get Google Analytics cookies
   * @returns Object with GA cookies
   */
  private getGACookies(): Record<string, string> {
    const gaCookies = ['__utma', '__utmb', '__utmc', '__utmz', '__utmv'];
    const cookies: Record<string, string> = {};
    
    for (let i = 0; i < gaCookies.length; i++) {
      const cookieVal = this.extractCookie(gaCookies[i]);

      if (cookieVal || i > 0) {
        if (cookieVal) {
          cookies[gaCookies[i]] = cookieVal;
        }
      } else {
        break;
      }
    }
    return cookies;
  }

  /**
   * Extract a specific cookie value
   * @param name - Cookie name
   * @returns Cookie value or false
   */
  private extractCookie(name: string): string | false {
    const regex = new RegExp(name + '=([^;]*)', 'g');
    try {
      const match = regex.exec(document.cookie);
      return match ? match[1] : false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Find one value from URL parts
   * @param allParts - All URL parts
   * @param varArr - Array of variables to look for
   * @returns Found value or false
   */
  private findOne(allParts: Record<string, string>, varArr: string[]): string | false {
    for (const lookFor of varArr) {
      for (const attrname in allParts) {
        if (attrname === lookFor) {
          return allParts[attrname];
        }
      }
    }
    return false;
  }

  /**
   * Convert tags to script tags format
   * @param tags - Tags object
   * @returns Script tags string
   */
  private tagsToScriptTags(tags: TagCollection): string {
    let scriptTags = '';
    for (const key in tags) {
      const value = tags[key];
      scriptTags = scriptTags + '&' + key + '=' + value;
    }
    return scriptTags;
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.RequestNumber = RequestNumber;
}
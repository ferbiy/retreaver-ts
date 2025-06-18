import { Model } from './base/Model';
import { Helpers } from './base/Helpers';
import { 
  NumberAttributes, 
  TagCollection, 
  CallCallback,
  TagCallback,
  Call 
} from './types';

/**
 * Number class for Retreaver library
 * Maintains exact functionality from original number.js
 */
export class RetreaverNumber extends Model {
  protected type = 'numbers';

  constructor(options: NumberAttributes) {
    super();
    this.initialize(options);
  }

  private initialize(data: NumberAttributes): void {
    this.store(data);
    this.set('is_active', 'true');
  }

  /**
   * Add tags to this number
   * @param tags - Tags to add as key-value pairs or query string
   * @param callback - Callback that will be fired after request
   * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool with per-visitor numbers enabled
   */
  addTags(tags: TagCollection | string, callback?: TagCallback): void {
    this.ensureIsPerVisitor();
    this.postData('numbers/tag', this.tagsPayload(tags), callback);
  }

  /**
   * Replace tags for this number
   * @param tags - Tags to replace as key-value pairs
   * @param callback - Callback that will be fired after request
   * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool with per-visitor numbers enabled
   */
  replaceTags(tags: TagCollection, callback?: TagCallback): void {
    this.ensureIsPerVisitor();
    this.postData('numbers/replace_tags', this.tagsPayload(tags), callback);
  }

  /**
   * Remove tags from this number
   * @param tags - Tags to remove as key-value pairs  
   * @param callback - Callback that will be fired after request
   * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool with per-visitor numbers enabled
   */
  removeTags(tags: TagCollection, callback?: TagCallback): void {
    this.ensureIsPerVisitor();
    this.postData('numbers/untag', this.tagsPayload(tags), callback);
  }

  /**
   * Remove tags by their keys
   * @param keys - Array of tag keys to remove
   * @param callback - Callback that will be fired after request
   */
  removeTagsByKeys(keys: string[] | string, callback?: TagCallback): void {
    this.ensureIsPerVisitor();
    let keyArray: string[] = typeof keys === 'string' ? [keys] : keys;
    const payload = {
      tag_keys: keyArray,
      ids: [this.get('id')],
      campaign_key: this.get('campaign_key')
    };
    this.postData('numbers/untag/keys', payload, callback);
  }

  /**
   * Clear all tags for this number
   * @param callback - Callback that will be fired after request
   * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool with per-visitor numbers enabled
   */
  clearTags(callback?: TagCallback): void {
    this.ensureIsPerVisitor();
    const payload = {
      ids: [this.get('id')],
      campaign_key: this.get('campaign_key'),
      all: 'true'
    };
    this.postData('numbers/untag', payload, callback);
  }

  /**
   * Release number back to pool
   */
  release(): void {
    this.set('is_active', 'false');
  }

  /**
   * Start a call immediately by having a campaign target dial the visitor
   * @param dial - The number to call
   * @param payload - A collection of tags as key-value pairs and optional secure override properties
   * @param callback - Callback that will be fired after request
   * @example
   * number.initiateCall('4166686980', {company_name: 'CallPixels'}, function (call) {
   *     alert('Call started with UUID ' + call.uuid)
   * });
   */
  initiateCall(dial: string, payload?: any, callback?: CallCallback): void {
    if (typeof payload === 'undefined') payload = {};
    
    // assign dial to payload
    payload.dial = dial;
    
    // merge payload into payload
    payload = Helpers.merge(this.get('id', 'campaign_key'), payload);
    
    // post the payload
    this.postData('numbers/initiate_call', payload, callback as any);
  }

  /**
   * Prepare tags payload for API requests
   * @param tags - Tags to process
   * @returns Payload object
   */
  private tagsPayload(tags: TagCollection | string): {
    tag_values: TagCollection;
    ids: number[];
    campaign_key: string;
  } {
    let processedTags: TagCollection;
    if (typeof tags === 'string') {
      processedTags = RetreaverNumber.extractTagsFromString(tags);
    } else {
      processedTags = tags;
    }
    
    return {
      tag_values: processedTags,
      ids: [this.get('id')],
      campaign_key: this.get('campaign_key')
    };
  }

  /**
   * Ensure the number is per-visitor
   * @throws Error if not per-visitor
   */
  private ensureIsPerVisitor(): void {
    if (this.get('is_per_visitor') === false) {
      throw new Error("Error: Tried to add tags to non per-visitor number.");
    }
  }

  /**
   * Extract tags from string format
   * @param tags - String in format "key1:value1,key2:value2"
   * @returns Tags object
   */
  static extractTagsFromString(tags: string): TagCollection {
    const output: TagCollection = {};
    const tagArray = tags.split(",");
    for (let i = 0; i < tagArray.length; i++) {
      const tag = tagArray[i].split(":");
      output[tag[0]] = tag[1];
    }
    return output;
  }
}

/**
 * Ping active numbers (static utility method)
 * @param callback - Callback function
 */
function pingActiveNumbers(callback?: TagCallback): void {
  const store = (RetreaverNumber as any).getStore ? (RetreaverNumber as any).getStore() : {};
  
  if (typeof store !== 'undefined') {
    // get numbers
    const numbers = store['numbers'];
    
    // for each number
    if (typeof numbers !== 'undefined') {
      // group number_ids by campaign_key
      const grouped: Record<string, { ids: any[]; hashes: any[] }> = {};
      
      for (const primary_key in numbers) {
        const number = numbers[primary_key];
        if (number.is_active === 'true') {
          if (typeof grouped[number.campaign_key] === 'undefined') {
            grouped[number.campaign_key] = { ids: [], hashes: [] };
          }
          grouped[number.campaign_key]['ids'].push(number.id);
          grouped[number.campaign_key]['hashes'].push(number.id_checksum);
        }
      }
      
      // ping each group of number_ids
      for (const campaign_key in grouped) {
        const payload = {
          ids: grouped[campaign_key].ids,
          hashes: grouped[campaign_key].hashes
        };
        
        if ((RetreaverNumber as any).connection) {
          (RetreaverNumber as any).connection().postJSON('/api/v1/numbers/ping', payload, [Model.update, callback]);
        }
      }
    }
  }
  
  // call recursively
  setTimeout(() => pingActiveNumbers(callback), 15000);
}

// Start the ping process
pingActiveNumbers();

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Number = RetreaverNumber;
}

export { RetreaverNumber as Number };
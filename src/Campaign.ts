import { Model } from './base/Model';
import { RequestNumber } from './base/RequestNumber';
import { RetreaverNumber } from './Number';
import { findAndReplaceDOMText } from './vendor/FindAndReplaceDOMText';
import { Data } from './base/Data';
import { 
  CampaignOptions, 
  TagCollection, 
  NumberCallback, 
  ErrorCallback, 
  IntegrationConfigs,
  GoogleAnalyticsConfig,
  TrueCallConfig,
  RedTrackConfig,
  ClickFlareConfig
} from './types';

/**
 * # Campaign Class
 * 
 * The Campaign class is the primary interface for requesting phone numbers from Retreaver.
 * It handles all aspects of number retrieval, including tag management, third-party integrations,
 * and automatic number replacement on web pages.
 * 
 * ## Features
 * - **Phone Number Requests**: Get tracked phone numbers for campaigns
 * - **Tag Management**: Associate custom data with number requests
 * - **Auto Number Replacement**: Automatically replace existing numbers on pages
 * - **Third-party Integrations**: Built-in support for Google Analytics, TrueCall, RedTrack, and ClickFlare
 * - **Error Handling**: Comprehensive error callbacks and validation
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const campaign = new Campaign({ 
 *   campaign_key: 'your-campaign-key' 
 * });
 * 
 * // Request a number with tags
 * campaign.requestNumber({ 
 *   visitor_type: 'premium',
 *   source: 'website'
 * }, (number) => {
 *   console.log('Phone:', number.get('formatted_number'));
 * });
 * ```
 * 
 * @category Core
 * @since 1.0.0
 */
export class Campaign extends Model {
  protected type = 'campaigns';

  /**
   * Creates a new Campaign instance.
   * 
   * @param options - Campaign configuration containing the campaign key
   * 
   * @example
   * ```typescript
   * const campaign = new Campaign({ 
   *   campaign_key: '67d9fb1917ae8f4eaff36831b41788c3' 
   * });
   * ```
   */
  constructor(options: CampaignOptions) {
    super();
    this.initialize(options);
  }

  /**
   * Initializes the campaign with the provided data.
   * 
   * @internal
   * @param data - Campaign options to store
   */
  private initialize(data: CampaignOptions): void {
    this.store(data);
  }

  /**
   * # Request Number
   * 
   * Requests a tracked phone number from the campaign. This is the primary method for 
   * getting phone numbers that track incoming calls and can be associated with custom tags.
   * 
   * ## Overloads
   * 
   * 1. **Simple Request**: `requestNumber(callback)` - Get a number without tags
   * 2. **Tagged Request**: `requestNumber(tags, callback)` - Get a number with tags
   * 3. **Full Request**: `requestNumber(tags, callback, errorCallback)` - Get a number with full error handling
   * 
   * ## Automatic Integrations
   * 
   * When a number is successfully retrieved, the following integrations are automatically attempted:
   * - **Google Analytics**: Session and client ID tracking
   * - **TrueCall**: Dynamic number assignment
   * - **RedTrack**: Click ID extraction
   * - **ClickFlare**: Event token tracking
   * 
   * @param callback - Callback fired when the request completes successfully
   * 
   * @example
   * ```typescript
   * // Simple request
   * campaign.requestNumber((number) => {
   *   document.getElementById('phone').textContent = number.get('formatted_number');
   * });
   * ```
   */
  requestNumber(callback: NumberCallback): void;
  /**
   * @param tags - A collection of tags as key-value pairs to associate with the number
   * @param callback - Callback fired when the request completes successfully
   * 
   * @example
   * ```typescript
   * // Request with tags
   * campaign.requestNumber({ 
   *   visitor_type: 'premium',
   *   source: 'homepage',
   *   utm_campaign: 'summer_sale'
   * }, (number) => {
   *   console.log('Tagged number:', number.get('formatted_number'));
   * });
   * ```
   */
  requestNumber(tags: TagCollection, callback: NumberCallback): void;
  /**
   * @param tags - A collection of tags as key-value pairs to associate with the number
   * @param callback - Callback fired when the request completes successfully
   * @param errorCallback - Callback fired if the request encounters an error
   * 
   * @example
   * ```typescript
   * // Full request with error handling
   * campaign.requestNumber({ 
   *   lead_score: '85',
   *   priority: 'high'
   * }, (number) => {
   *   console.log('Success:', number.get('formatted_number'));
   * }, (error) => {
   *   console.error('Failed to get number:', error);
   * });
   * ```
   */
  requestNumber(tags: TagCollection, callback: NumberCallback, errorCallback: ErrorCallback): void;
  requestNumber(
    tagsOrCallback: TagCollection | NumberCallback,
    callback?: NumberCallback,
    errorCallback?: ErrorCallback
  ): void {
    let tags: TagCollection = {};
    let actualCallback: NumberCallback;
    let actualErrorCallback: ErrorCallback | undefined;

    // Handle overloaded parameters
    if (typeof tagsOrCallback === 'function') {
      // First overload: requestNumber(callback)
      actualCallback = tagsOrCallback;
      actualErrorCallback = callback as ErrorCallback | undefined;
    } else {
      // Second/third overload: requestNumber(tags, callback, errorCallback?)
      tags = tagsOrCallback || {};
      actualCallback = callback!;
      actualErrorCallback = errorCallback;
    }

    if (typeof actualCallback === 'undefined') {
      actualCallback = function () {
        // Default empty callback
      };
    }

    // assign the tags (this is important since it runs it through setNumberMatchingTags)
    this.set('number_matching_tags', tags);
    
    // request the number
    new RequestNumber(this.get('campaign_key', 'number_matching_tags')).perform((data: any) => {
      // did retreaver return a valid number?
      if (typeof data !== 'undefined' && typeof data.number !== 'undefined' && data.number !== '') {
        // initialize number
        const number = new RetreaverNumber(data.number);

        try {
          this.handleTrueCallIntegration(number);
        } catch (e) {
          console.error("Could not integrate with truecall.com, ", e);
        }

        try {
          this.handleRedTrackIntegration(number);
        } catch (e) {
          console.error("Could not integrate with Red Track, ", e);
        }

        try {
          this.handleGoogleAnalyticsIntegration(number);
        } catch (e) {
          console.error("Could not integrate with google analytics, ", e);
        }

        try {
          this.handleClickFlareIntegration(number);
        } catch (e) {
          console.error("Could not integrate with click flare, ", e);
        }

        // if there is a replacement in the response, replace all occurrences
        // of that number on the page with the retreaver number
        if (typeof data.number.replacement_numbers !== 'undefined') {
          this.findAndReplaceNumber(data.number.replacement_numbers);
        }
        
        // call callback
        actualCallback.apply(this, [number]);
      }
      // otherwise fire the error callback
      else if (typeof actualErrorCallback === 'function') {
        actualErrorCallback.apply(this, [data]);
      }
    });
  }

  /**
   * # Auto Replace Numbers
   * 
   * Automatically replaces all phone numbers found on the current page with tracked 
   * Retreaver numbers according to campaign settings. This is useful for automatically 
   * converting static phone numbers into tracked numbers without manual intervention.
   * 
   * ## How it Works
   * 
   * 1. Requests a number from the campaign (same as `requestNumber`)
   * 2. If the response includes replacement rules, scans the page for matching numbers
   * 3. Replaces found numbers in both text content and `href` attributes
   * 4. Supports `tel:` links and various click-tracking formats
   * 
   * @param tags - Optional tags to associate with the number request
   * @param callback - Optional callback fired when replacement completes successfully
   * @param errorCallback - Optional callback fired if the request encounters an error
   * 
   * @example
   * ```typescript
   * // Basic auto-replacement
   * campaign.autoReplaceNumbers();
   * 
   * // With tags and callbacks
   * campaign.autoReplaceNumbers({ 
   *   page_type: 'landing',
   *   auto_replace: 'true'
   * }, (number) => {
   *   console.log('Page numbers replaced with:', number.get('formatted_number'));
   * }, (error) => {
   *   console.error('Auto-replace failed:', error);
   * });
   * ```
   */
  autoReplaceNumbers(
    tags?: TagCollection,
    callback?: NumberCallback,
    errorCallback?: ErrorCallback
  ): void {
    if (typeof callback === 'undefined') {
      callback = function() {};
    }

    if (typeof errorCallback === 'undefined') {
      errorCallback = function() {};
    }
    
    this.requestNumber(tags || {}, callback, errorCallback);
  }

  /**
   * # Get Campaign Numbers
   * 
   * Retrieves all numbers that have been requested for this campaign during the current session.
   * This is useful for tracking multiple numbers or implementing advanced number management.
   * 
   * @returns Array of RetreaverNumber instances for this campaign
   * 
   * @example
   * ```typescript
   * // Get all numbers for this campaign
   * const numbers = campaign.numbers();
   * numbers.forEach(number => {
   *   console.log('Number:', number.get('formatted_number'));
   *   console.log('Tags:', number.get('tag_values'));
   * });
   * 
   * // Check how many numbers have been requested
   * console.log(`${numbers.length} numbers requested for this campaign`);
   * ```
   */
  numbers(): RetreaverNumber[] {
    const output: RetreaverNumber[] = [];
    const store = Data.getStore();
    
    if (typeof store !== 'undefined') {
      // get numbers
      const numbers = store['numbers'];
      
      // present?
      if (typeof numbers !== 'undefined') {
        // collect numbers matching this campaign
        for (const primary_key in numbers) {
          const number = numbers[primary_key];
          if (this.get('campaign_key') === number.campaign_key) {
            output.push(new RetreaverNumber(number));
          }
        }
      }
    }
    return output;
  }

  /**
   * Sets and validates number matching tags.
   * 
   * @internal
   * @param tags - Tags to validate and set
   * @returns Validated tags object
   * @throws {Error} When tags are not in the expected format
   */
  setNumberMatchingTags(tags: TagCollection | string): TagCollection {
    if (typeof tags === 'string') {
      tags = RetreaverNumber.extractTagsFromString(tags);
    }
    if (tags && (typeof tags === "object") && !(tags instanceof Array)) {
      return tags;
    } else {
      throw new Error("ArgumentError: Expected number_matching_tags to be an object. eg: {tag: 'value'}");
    }
  }

  /**
   * Find and replace phone numbers in the DOM
   * @param replacementNumbers - Array of replacement number objects
   */
  private findAndReplaceNumber(replacementNumbers: any[]): void {
    for (let i = 0; i < replacementNumbers.length; i++) {
      const rn = replacementNumbers[i];

      findAndReplaceDOMText(document.getElementsByTagName('body')[0], {
        find: rn.find,
        replace: rn.replace_with
      });

      const links = document.getElementsByTagName('a');
      for (let j = 0; j < links.length; j++) {
        const link = links[j];
        const href = link.getAttribute('href');

        if (href !== null) {
          const match = href.match(/^(tel:|clk[a-z]\/tel\/)(.*)/);
          if (match && match[2] === rn.find) {
            link.setAttribute('href', match[1] + rn.replace_with);
          }
        }
      }
    }
  }

  /**
   * Get integration configuration for a specific integration
   * @param number - Number instance
   * @param integration - Integration name
   * @returns Integration configuration or undefined
   */
  private getIntegrationConfig(number: RetreaverNumber, integration: string): any {
    const integrations = number.get("integrations");

    if (typeof integrations !== 'object') {
      return;
    }

    const integrationConfig = integrations[integration];
    if (typeof integrationConfig === 'undefined') {
      return;
    }

    return integrationConfig;
  }

  /**
   * Handle Google Analytics integration
   * @param number - Number instance
   */
  private handleGoogleAnalyticsIntegration(number: RetreaverNumber): void {
    const googleAnalyticsConfig: GoogleAnalyticsConfig = this.getIntegrationConfig(number, "google_analytics");
    if (typeof googleAnalyticsConfig === "undefined") {
      return;
    }

    const obtainGoogleAnalyticsCookies = new Promise<{gaSessionId: string; gaClientId: string}>((resolve) => {
      const googleAnalyticsInterval = setInterval(() => {
        const gaSessionIdPattern = /_ga_[^=]+=([^;]*)/;
        const gaSessionMatch = document.cookie.match(gaSessionIdPattern);
        const gaSessionMatched = gaSessionMatch && gaSessionMatch[1];

        const gaClientIdPattern = /_ga=([^;]*)/;
        const gaClientMatch = document.cookie.match(gaClientIdPattern);
        const gaClientMatched = gaClientMatch && gaClientMatch[1];

        if (gaSessionMatched && gaClientMatched) {
          resolve({
            gaSessionId: gaSessionMatched,
            gaClientId: gaClientMatched,
          });

          clearInterval(googleAnalyticsInterval);
        }
      }, googleAnalyticsConfig.checkIntervalMs); // Try to get the Google Analytics session data every X milliseconds
    });

    obtainGoogleAnalyticsCookies.then((sessionData) => {
      number.replaceTags({
        ga_session_id: sessionData.gaSessionId,
        ga_client_id: sessionData.gaClientId,
      });
    });
  }

  /**
   * Handle TrueCall integration
   * @param number - Number instance
   */
  private handleTrueCallIntegration(number: RetreaverNumber): void {
    const trueCallConfig: TrueCallConfig = this.getIntegrationConfig(number, "truecall.com");

    if (typeof trueCallConfig === "undefined") {
      return;
    }

    // Load the trueCall script into the page if it's missing
    if (!document.getElementById("__tc_script") || !(window as any).TrueCall) {
      const trueCallScriptTag = document.createElement('script');
      trueCallScriptTag.type = 'text/javascript';
      trueCallScriptTag.async = true;
      trueCallScriptTag.defer = true;
      (trueCallScriptTag as any).dataset.campaign_uuid = trueCallConfig.tcCampaignUuid;
      (trueCallScriptTag as any).dataset.use_set_did = "1";
      trueCallScriptTag.id = "__tc_script";
      trueCallScriptTag.src = trueCallConfig.scriptSrc;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(trueCallScriptTag);
    }

    const trueCallInterval = setInterval(() => {
      if ((window as any).TrueCall) {
        (window as any).TrueCall.setDID(number.get("number")).then(() => {
          clearInterval(trueCallInterval);
          return (window as any).TrueCall.getIdAsync();
        }).then((trueCallId: string) => {
          const tags: TagCollection = {};
          tags[trueCallConfig.tagName] = trueCallId;
          number.replaceTags(tags);
        });
      }
    }, trueCallConfig.checkIntervalMs);
  }

  /**
   * Handle RedTrack integration
   * @param number - Number instance
   */
  private handleRedTrackIntegration(number: RetreaverNumber): void {
    const redTrackConfig: RedTrackConfig = this.getIntegrationConfig(number, "red_track");

    if (typeof redTrackConfig === "undefined") {
      return;
    }

    function getRedTrackClickID(name: string): string | undefined {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop()!.split(';').shift();
    }

    const obtainRedTrackClickID = new Promise<string>((resolve) => {
      const myInterval = setInterval(() => {
        const redTrackClickID = getRedTrackClickID('rtkclickid-store');
        if (redTrackClickID) {
          resolve(redTrackClickID);
          clearInterval(myInterval);
        }
      }, redTrackConfig.checkIntervalMs);
    });

    obtainRedTrackClickID.then((redTrackClickID) => {
      const tags: TagCollection = {};
      tags[redTrackConfig.tagName] = redTrackClickID;
      number.replaceTags(tags);
    });
  }

  /**
   * Handle ClickFlare integration
   * @param number - Number instance
   */
  private handleClickFlareIntegration(number: RetreaverNumber): void {
    const clickFlareConfig: ClickFlareConfig = this.getIntegrationConfig(number, "click_flare");

    if (typeof clickFlareConfig === "undefined") {
      return;
    }

    const getClickFlareClickID = (): string | undefined => {
      if ((window as any).clickflare && (window as any).clickflare.data && (window as any).clickflare.data.event_tokens) {
        // ClickFlare has this cv_click_id which is an id that when present tracks the user better and takes
        // precedent over cf_click_id.
        return ((window as any).clickflare.data.event_tokens.cv_click_id || (window as any).clickflare.data.event_tokens.cf_click_id);
      }
    };

    const obtainClickFlareClickID = new Promise<string>((resolve) => {
      const myInterval = setInterval(() => {
        const clickFlareClickID = getClickFlareClickID();
        if (clickFlareClickID) {
          resolve(clickFlareClickID);
          clearInterval(myInterval);
        }
      }, clickFlareConfig.checkIntervalMs);
    });

    obtainClickFlareClickID.then((clickFlareClickID) => {
      const tags: TagCollection = {};
      tags[clickFlareConfig.tagName] = clickFlareClickID;
      number.replaceTags(tags);
    });
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Campaign = Campaign;
}
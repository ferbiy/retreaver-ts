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
 * Campaign class for Retreaver library
 * Maintains exact functionality from original campaign.js including all integrations
 */
export class Campaign extends Model {
  protected type = 'campaigns';
  public numbers: RetreaverNumber[] = [];

  constructor(options: CampaignOptions) {
    super();
    this.initialize(options);
  }

  private initialize(data: CampaignOptions): void {
    this.store(data);
  }

  /**
   * Fetch a campaign number
   * @param callback - Callback fired if the request completes successfully
   */
  requestNumber(callback: NumberCallback): void;
  /**
   * Fetch a campaign number
   * @param tags - A collection of tags as key-value pairs
   * @param callback - Callback fired if the request completes successfully
   */
  requestNumber(tags: TagCollection, callback: NumberCallback): void;
  /**
   * Fetch a campaign number
   * @param tags - A collection of tags as key-value pairs
   * @param callback - Callback fired if the request completes successfully
   * @param errorCallback - Callback fired if the request raises an error
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
   * Auto replace all numbers on page according to campaign settings
   * Calls campaign.requestNumber
   * @param tags - A collection of tags as key-value pairs
   * @param callback - Callback fired if the request completes successfully
   * @param errorCallback - Callback fired if the request raises an error
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
   * Get all numbers for this campaign
   * @returns Array of numbers matching this campaign
   */
  getNumbers(): RetreaverNumber[] {
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
   * Set number matching tags (with validation)
   * @param tags - Tags to set
   * @returns Validated tags object
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
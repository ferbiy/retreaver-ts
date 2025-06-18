import { Helpers } from './Helpers';
import { Cookies } from './Cookies';
import { RequestConfig } from '../types';

/**
 * HTTP request handler for Retreaver library
 * Maintains exact functionality from original request.js including legacy IE support
 */
export class Request {
  private config: RequestConfig;
  private static _connection?: Request;

  constructor(options: RequestConfig) {
    this.config = Helpers.assertRequiredKeys(options, 'http_prefix', 'addr', 'urlregex');
  }

  /**
   * Request JSON data from the host
   * @param requestUrl - The request URI
   * @param payload - Post object
   * @param callbacks - Array or Function to be called after request
   * @param context - Context applied to callback
   */
  getJSON<T = any>(
    requestUrl: string,
    payload?: any,
    callbacks?: Function | Function[],
    context?: any
  ): void {
    // Ensure callbacks are an array
    let callbackArray: Function[] = [];
    if (typeof callbacks === "function") {
      callbackArray = [callbacks];
    } else if (Array.isArray(callbacks)) {
      callbackArray = callbacks;
    }
    
    if (typeof context === 'undefined') {
      context = this;
    }

    // Request function
    const request = (): void => {
      this.apiRequest(requestUrl, (data: string) => {
        // Parse JSON
        const response = JSON.parse(data);
        
        // Fire callbacks
        for (const callback of callbackArray) {
          if (typeof callback === "function") {
            callback.apply(context, [response]);
          }
        }
      }, payload);
    };

    if (Helpers.ieVersion() === 6 || Helpers.ieVersion() === 7) {
      this.withIeScripts(request);
    } else {
      request();
    }
  }

  /**
   * Post JSON data (alias for getJSON)
   */
  postJSON<T = any>(
    requestUrl: string,
    payload?: any,
    callbacks?: Function | Function[],
    context?: any
  ): void {
    return this.getJSON(requestUrl, payload, callbacks, context);
  }

  /**
   * Make API request with cross-browser support
   * @param requestUri - The request URI
   * @param callbackFunctions - Callback functions
   * @param payload - Post object
   */
  apiRequest(requestUri: string, callbackFunctions: Function | Function[], payload?: any): void {
    const httpPrefix = this.config.http_prefix;
    const addr = this.config.addr;
    const urlregex = eval(this.config.urlregex);
    const requestUrl = `${httpPrefix}://${addr}${requestUri}`;

    if (payload && typeof Cookies.get('CallPixels-vid') !== 'undefined' && Cookies.get('CallPixels-vid') !== 'null') {
      payload.visitor_id = Cookies.get('CallPixels-vid');
    }

    let callbacks: Function[] = [];
    if (typeof callbackFunctions === "function") {
      callbacks = [callbackFunctions];
    } else if (Array.isArray(callbackFunctions)) {
      callbacks = callbackFunctions;
    }

    const ignored = (): void => {
      // Empty function
    };

    const runCallbacks = (response: string): void => {
      for (const callback of callbacks) {
        if (typeof callback === "function") {
          callback(response);
        }
      }
    };

    const forwardResponse = (): void => {
      runCallbacks((window as any).xdr.responseText);
    };

    const sendXdm = (): void => {
      // Create the RPC request for IE6/7
      const remote = `${httpPrefix}://${addr}/ie_provider`;
      const swf = `${httpPrefix}://${addr}/easyxdm.swf`;
      const rpc = eval(`new window.easyXDM.Rpc({ remote: "${remote}", swf: "${swf}" },{remote: {request: {}}});`);

      const urlMatch = requestUrl.match(urlregex);
      const path = urlMatch ? urlMatch[1] : '';

      rpc.request({
        url: ('/' + path),
        method: "POST",
        data: payload
      }, (response: any) => {
        runCallbacks(response.data);
      });
    };

    if ((window as any).XDomainRequest) {
      // IE >= 8
      const xdr = new (window as any).XDomainRequest();

      xdr.onload = forwardResponse;
      xdr.onprogress = ignored;
      xdr.onerror = ignored;
      xdr.ontimeout = ignored;
      xdr.timeout = 30000;

      if (payload) {
        xdr.open("post", requestUrl);
        xdr.send(this.buildPost(payload));
      } else {
        xdr.open("get", requestUrl);
        xdr.send();
      }
    } else if (Helpers.ieVersion() === 6 || Helpers.ieVersion() === 7) {
      this.withIeScripts(sendXdm);
    } else {
      // Modern browsers
      const request = new XMLHttpRequest();

      request.onload = function() {
        runCallbacks(this.responseText);
      };

      if (payload) {
        request.open("POST", requestUrl);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(payload));
      } else {
        request.open("GET", requestUrl);
        request.send();
      }
    }
  }

  /**
   * Load scripts for IE6/7 support
   * @param callback - Callback to execute after scripts are loaded
   */
  private withIeScripts(callback: Function): void {
    const retreaver = (window as any).Retreaver;
    if (retreaver && retreaver.easyxdm_loaded) {
      callback();
    } else {
      const httpPrefix = this.config.http_prefix;
      this.loadScript(`${httpPrefix}://cdn.jsdelivr.net/easyxdm/2.4.17.1/easyXDM.min.js`, () => {
        this.loadScript(`${httpPrefix}://cdn.jsdelivr.net/easyxdm/2.4.17.1/json2.js`, () => {
          if (retreaver) {
            retreaver.easyxdm_loaded = true;
          }
          callback();
        });
      });
    }
  }

  /**
   * Build POST data string
   * @param obj - Object to convert to POST data
   * @returns POST data string
   */
  buildPost(obj: Record<string, any>): string {
    let postVars = '';
    for (const k in obj) {
      postVars += `${k}=${obj[k]}&`;
    }
    return postVars;
  }

  /**
   * Load a script dynamically
   * @param scriptUrl - URL of the script to load
   * @param afterCallback - Callback to execute after script loads
   */
  loadScript(scriptUrl: string, afterCallback?: Function): void {
    const firstScriptElement = document.getElementsByTagName('script')[0];
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.async = false;
    scriptElement.src = scriptUrl;

    const ieLoadBugFix = (element: HTMLScriptElement, callback: Function): void => {
      if ((element as any).readyState === 'loaded' || (element as any).readyState === 'complete') {
        callback();
      } else {
        setTimeout(() => {
          ieLoadBugFix(element, callback);
        }, 100);
      }
    };

    if (typeof afterCallback === "function") {
      if (typeof scriptElement.addEventListener !== "undefined") {
        scriptElement.addEventListener("load", afterCallback as EventListener, false);
      } else {
        (scriptElement as any).onreadystatechange = function() {
          (scriptElement as any).onreadystatechange = null;
          ieLoadBugFix(scriptElement, afterCallback);
        };
      }
    }
    
    firstScriptElement.parentNode!.insertBefore(scriptElement, firstScriptElement);
  }

  /**
   * Get the singleton connection instance
   * @returns Request connection instance
   */
  static connection(): Request {
    if (typeof Request._connection === 'undefined') {
      const protocol = window.location.protocol.replace(':', '') as 'http' | 'https';
      Request._connection = new Request({
        addr: 'api.rtvrapi.com',
        http_prefix: protocol,
        urlregex: "/\\/\\/[^\\/]*\\/(.*)/"
      });
    }
    return Request._connection;
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.Request = Request;
}
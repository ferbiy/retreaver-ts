/**
 * Cookie management utilities for Retreaver library
 * Based on cookiejs library - maintains exact functionality from original cookies.js
 */
export interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
}

export interface CookieDefaults {
  path: string;
  domain?: string;
  secure?: boolean;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export class Cookies {
  private static _document: Document = document;
  private static _navigator: Navigator = navigator;
  private static _cache: Record<string, string> = {};
  private static _cachedDocumentCookie: string = '';
  
  static defaults: CookieDefaults = { path: '/' };
  static enabled: boolean;

  /**
   * Get or set a cookie
   * @param name - Cookie name
   * @param value - Cookie value (if setting)
   * @param options - Cookie options (if setting)
   */
  static cookie(name: string): string | undefined;
  static cookie(name: string, value: string, options?: CookieOptions): typeof Cookies;
  static cookie(name: string, value?: string, options?: CookieOptions): string | undefined | typeof Cookies {
    return arguments.length === 1 ? Cookies.get(name) : Cookies.set(name, value!, options);
  }

  /**
   * Get a cookie value
   * @param name - Cookie name
   * @returns Cookie value or undefined
   */
  static get(name: string): string | undefined {
    if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
      Cookies._renewCache();
    }
    return Cookies._cache[name];
  }

  /**
   * Set a cookie
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   * @returns Cookies class for chaining
   */
  static set(name: string, value: string, options?: CookieOptions): typeof Cookies {
    const extendedOptions = Cookies._getExtendedOptions(options);
    Cookies._document.cookie = Cookies._generateCookieString(name, value, extendedOptions);
    return Cookies;
  }

  /**
   * Get extended options with defaults
   * @param options - User provided options
   * @returns Extended options with defaults applied
   */
  private static _getExtendedOptions(options?: CookieOptions): CookieOptions {
    return {
      path: (options && options.path) || Cookies.defaults.path,
      domain: (options && options.domain) || Cookies.defaults.domain,
      secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
    };
  }

  /**
   * Check if date is valid
   * @param date - Date to check
   * @returns True if valid date
   */
  private static _isValidDate(date: any): date is Date {
    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
  }

  /**
   * Generate cookie string
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   * @returns Cookie string
   */
  private static _generateCookieString(name: string, value: string, options: CookieOptions): string {
    const encodedName = encodeURIComponent(name);
    const encodedValue = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
    
    let cookieString = encodedName + '=' + encodedValue + (options.path ? ';path=' + options.path : '');
    cookieString += options.domain ? ';domain=' + options.domain : '';
    cookieString += options.secure ? ';secure' : '';
    
    return cookieString;
  }

  /**
   * Parse cookie string into object
   * @param cookieString - Raw cookie string
   * @returns Object with cookie key-value pairs
   */
  private static _getCookieObjectFromString(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = cookieString ? cookieString.split('; ') : [];
    
    for (let i = 0; i < cookieArray.length; i++) {
      const keyValuePair = Cookies._getKeyValuePairFromCookieString(cookieArray[i]);
      if (cookies[keyValuePair.key] === undefined) {
        cookies[keyValuePair.key] = keyValuePair.value;
      }
    }
    
    return cookies;
  }

  /**
   * Extract key-value pair from cookie string
   * @param cookieString - Single cookie string
   * @returns Key-value pair
   */
  private static _getKeyValuePairFromCookieString(cookieString: string): KeyValuePair {
    const separatorIndex = cookieString.indexOf('=');
    const keyEndIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
    
    return {
      key: decodeURIComponent(cookieString.substr(0, keyEndIndex)),
      value: decodeURIComponent(cookieString.substr(keyEndIndex + 1))
    };
  }

  /**
   * Renew the internal cache
   */
  private static _renewCache(): void {
    Cookies._cache = Cookies._getCookieObjectFromString(Cookies._document.cookie);
    Cookies._cachedDocumentCookie = Cookies._document.cookie;
  }

  /**
   * Check if cookies are enabled
   * @returns True if cookies are enabled
   */
  static areEnabled(): boolean {
    return Cookies._navigator.cookieEnabled || Cookies.set('cookies.js', '1').get('cookies.js') === '1';
  }
}

// Initialize enabled status
Cookies.enabled = Cookies.areEnabled();

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.Cookies = Cookies;
}
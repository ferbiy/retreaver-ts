/**
 * Base helper utilities for Retreaver library
 * Maintains exact functionality from original helpers.js
 */
export class Helpers {
  private static _ieVersion: number | false | null = null;

  /**
   * Assert that required keys exist in an object
   * @param object - The object to check
   * @param keys - The required keys
   * @returns The validated object
   * @throws Error if any required keys are missing
   */
  static assertRequiredKeys<T extends Record<string, any>>(
    object: T,
    ...keys: (keyof T)[]
  ): T {
    for (const key of keys) {
      if (typeof object === 'undefined' || typeof object[key] === 'undefined') {
        throw new Error(`ArgumentError: Required keys are not defined: ${keys.join(', ')}`);
      }
    }
    return object;
  }

  /**
   * Deep merge two objects
   * @param obj1 - Target object
   * @param obj2 - Source object
   * @returns Merged object
   */
  static merge<T, U>(obj1: T, obj2: U): T & U {
    for (const p in obj2) {
      try {
        if ((obj2[p] as any).constructor === Object) {
          (obj1 as any)[p] = Helpers.merge((obj1 as any)[p], (obj2 as any)[p]);
        } else {
          (obj1 as any)[p] = obj2[p];
        }
      } catch (e) {
        (obj1 as any)[p] = obj2[p];
      }
    }
    return obj1 as T & U;
  }

  /**
   * Check if argument is an array
   * @param arg - Value to check
   * @returns True if argument is an array
   */
  static isArray(arg: unknown): arg is unknown[] {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }

  /**
   * Get Internet Explorer version (legacy support)
   * @returns IE version number or false if not IE
   */
  static ieVersion(): number | false {
    if (Helpers._ieVersion === null) {
      Helpers._ieVersion = (function (): number | false {
        let v = 3;
        const div = document.createElement('div');
        const all = div.getElementsByTagName('i');

        while (
          (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->'),
          all[0]
        ) {
          // Continue loop
        }
        return v > 4 ? v : false;
      })();
    }

    if (Helpers._ieVersion === 6 || Helpers._ieVersion === 7) {
      if ((window as any).Retreaver && (window as any).Retreaver['easyxdm_loaded'] == null) {
        (window as any).Retreaver['easyxdm_loaded'] = false;
      }
    }

    return Helpers._ieVersion;
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.Helpers = Helpers;
}
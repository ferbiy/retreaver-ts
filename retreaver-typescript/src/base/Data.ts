import { Helpers } from './Helpers';
import { DataConfig } from '../types';

/**
 * Data storage class for Retreaver library
 * Maintains exact functionality from original data.js
 */
export class Data {
  private static _store: Record<string, Record<string | number, any>> = {};
  private config: DataConfig;

  constructor(config: DataConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize the data store for this instance
   */
  private initialize(): void {
    Helpers.assertRequiredKeys(this.config, 'type', 'primary_key');
    
    if (typeof Data._store[this.config.type] === 'undefined') {
      Data._store[this.config.type] = {};
    }
    
    if (typeof Data._store[this.config.type][this.config.primary_key] === 'undefined') {
      Data._store[this.config.type][this.config.primary_key] = {};
    }
  }

  /**
   * Get data from the store
   * @param keys - Optional keys to retrieve specific values
   * @returns The requested data
   */
  get<T = any>(...keys: string[]): T {
    let output: any = {};
    
    if (typeof keys[0] === 'undefined') {
      output = Data._store[this.config.type][this.config.primary_key];
    } else if (keys.length === 1) {
      output = Data._store[this.config.type][this.config.primary_key][keys[0]];
    } else {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        output[key] = Data._store[this.config.type][this.config.primary_key][key];
      }
    }
    
    return output;
  }

  /**
   * Set a value in the store
   * @param key - The key to set
   * @param value - The value to assign
   * @returns The assigned value
   */
  set<T>(key: string, value: T): T {
    Data._store[this.config.type][this.config.primary_key][key] = value;
    return value;
  }

  /**
   * Merge an object into the store
   * @param object - The object to merge
   * @returns The merged object
   */
  merge<T extends Record<string, any>>(object: T): T {
    for (const key in object) {
      Data._store[this.config.type][this.config.primary_key][key] = object[key];
    }
    return object;
  }

  /**
   * Get access to the global store (for internal use)
   */
  static getStore(): Record<string, Record<string | number, any>> {
    return Data._store;
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.Data = Data;
}
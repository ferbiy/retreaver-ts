import { Helpers } from './Helpers';
import { Data } from './Data';
import { Request } from './Request';
import { Cookies } from './Cookies';

/**
 * Base model class for Retreaver library
 * Maintains exact functionality from original model.js
 */
export abstract class Model {
  protected api_host_uri: string = '/api/v1/';
  protected type: string = 'model';
  protected _store?: Data;

  private static primary_keys: Record<string, string> = {};
  
  static inflections: Record<string, string> = {
    'number': 'numbers',
    'campaign': 'campaigns'
  };

  /**
   * Get or set the primary key for this model type
   * @param primary_key - The primary key to set (optional)
   * @returns The primary key for this model type
   */
  protected primaryKey(primary_key?: string): string {
    return Model.primaryKey(this.type, primary_key);
  }

  /**
   * Store data in the model
   * @param data - Data to store
   * @returns The data store instance
   */
  protected store(data?: any): Data | undefined {
    if (typeof data !== 'undefined') {
      const key = this.primaryKey();
      if (typeof data[key] === 'undefined') {
        throw new Error(`ArgumentError: Expected to receive primary_key ${key}`);
      }
      
      if (typeof this._store === 'undefined') {
        this._store = new Data({ type: this.type, primary_key: data[key] });
      }
      
      this._store.merge(data);
      Model.updateVisitorId(data);
    }
    return this._store;
  }

  /**
   * Get data from API
   * @param path - API path
   * @param callback - Callback function
   * @returns Request result
   */
  protected getData(path: string, callback?: Function): any {
    return this.connection().getJSON(this.api_host_uri + path, null, [Model.update, callback], this);
  }

  /**
   * Post data to API
   * @param path - API path
   * @param data - Data to post
   * @param callback - Callback function
   * @returns Request result
   */
  protected postData(path: string, data: any, callback?: Function): any {
    return this.connection().postJSON(this.api_host_uri + path, data, [Model.update, callback], this);
  }

  /**
   * Set a value with optional setter function
   * @param key - The key to set
   * @param value - The value to set
   * @returns The set value
   */
  set(key: string, value: any): any {
    const setterName = `set_${key}`;
    if (typeof (this as any)[setterName] === 'function') {
      value = (this as any)[setterName].apply(this, [value]);
    }
    return this._store!.set(key, value);
  }

  /**
   * Get one or more values
   * @param keys - Keys to retrieve
   * @returns The requested data
   */
  get(...keys: string[]): any {
    return this._store!.get(...keys);
  }

  /**
   * Get the connection instance
   * @returns Request connection
   */
  protected connection(): Request {
    return Request.connection();
  }

  /**
   * Update data store with response data
   * @param data - Response data
   * @returns The data
   */
  static update(data: any): any {
    for (const key in data) {
      const type = key;
      const value = data[key];
      const actualType = typeof Model.inflections[key] !== 'undefined' ? Model.inflections[key] : type;
      
      if (typeof Data.getStore()[actualType] !== 'undefined') {
        if (Helpers.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            Model.updateRecord(actualType, value[i]);
          }
        } else {
          Model.updateRecord(actualType, value);
        }
      }
    }
    return data;
  }

  /**
   * Update a single record in the store
   * @param type - Record type
   * @param record - Record data
   * @returns Success boolean
   */
  static updateRecord(type: string, record: any): boolean {
    Model.updateVisitorId(record);
    
    if (typeof record.id !== 'undefined') {
      const primary_key = Model.primaryKey(type);
      const store = Data.getStore();
      
      for (const key in record) {
        store[type][record[primary_key]][key] = record[key];
      }
      return true;
    }
    return false;
  }

  /**
   * Update visitor ID from record
   * @param record - Record that may contain visitor_id
   */
  static updateVisitorId(record: any): void {
    if (typeof record !== 'undefined' && typeof record.visitor_id !== 'undefined') {
      Cookies.set('CallPixels-vid', record.visitor_id);
    }
  }

  /**
   * Get or set primary key for a type
   * @param type - Model type
   * @param primary_key - Primary key to set (optional)
   * @returns The primary key
   */
  static primaryKey(type: string, primary_key?: string): string {
    if (typeof Model.primary_keys[type] === 'undefined') {
      Model.primary_keys[type] = 'id';
    }
    
    if (typeof primary_key !== 'undefined') {
      Model.primary_keys[type] = primary_key;
    }
    
    return Model.primary_keys[type];
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Base = (window as any).Retreaver.Base || {};
  (window as any).Retreaver.Base.Model = Model;
}
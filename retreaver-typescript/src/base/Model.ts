import { Data } from './Data';
import { DataConfig } from '../types';

/**
 * Base model class for Retreaver library
 * Maintains exact functionality from original model.js
 */
export abstract class Model {
  protected _data: Data;

  constructor(dataConfig: DataConfig) {
    this._data = new Data(dataConfig);
  }

  /**
   * Get data from the model
   * @param keys - Optional keys to retrieve specific values
   * @returns The requested data
   */
  get<T = any>(...keys: string[]): T {
    return this._data.get<T>(...keys);
  }

  /**
   * Set a value in the model
   * @param key - The key to set
   * @param value - The value to assign
   * @returns The assigned value
   */
  set<T>(key: string, value: T): T {
    return this._data.set(key, value);
  }

  /**
   * Merge an object into the model
   * @param object - The object to merge
   * @returns The merged object
   */
  merge<T extends Record<string, any>>(object: T): T {
    return this._data.merge(object);
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
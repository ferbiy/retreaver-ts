// Core configuration interfaces
export interface CampaignOptions {
  campaign_key: string;
}

export interface RequestConfig {
  addr: string;
  http_prefix: 'http' | 'https';
  urlregex: string;
}

export interface ConfigureOptions {
  host: string;
  prefix: 'http' | 'https';
}

// Number and Campaign interfaces
export interface NumberAttributes {
  id: number;
  campaign_key: string;
  formatted_number: string;
  number: string;
  plain_number: string;
  extension?: string;
  number_extension?: string;
  target_open: boolean;
  is_per_visitor: boolean;
  tag_values: Record<string, string>;
  visitor_id?: string;
  is_active?: string;
  id_checksum?: string;
  integrations?: IntegrationConfigs;
  replacement_numbers?: ReplacementNumber[];
}

export interface ReplacementNumber {
  find: string;
  replace_with: string;
}

export interface TagCollection {
  [key: string]: string;
}

// Callback types
export type NumberCallback = (number: RetreaverNumber) => void;
export type ErrorCallback = (error: any) => void;
export type CallCallback = (call: Call) => void;
export type TagCallback = (data?: any) => void;

// Integration configurations
export interface GoogleAnalyticsConfig {
  checkIntervalMs: number;
}

export interface TrueCallConfig {
  tcCampaignUuid: string;
  scriptSrc: string;
  checkIntervalMs: number;
  tagName: string;
}

export interface RedTrackConfig {
  checkIntervalMs: number;
  tagName: string;
}

export interface ClickFlareConfig {
  checkIntervalMs: number;
  tagName: string;
}

export interface IntegrationConfigs {
  google_analytics?: GoogleAnalyticsConfig;
  'truecall.com'?: TrueCallConfig;
  red_track?: RedTrackConfig;
  click_flare?: ClickFlareConfig;
}

// Call interface
export interface Call {
  uuid: string;
  [key: string]: any;
}

// Data store interface
export interface DataConfig {
  type: string;
  primary_key: string | number;
}

// Forward declarations for classes
export interface RetreaverNumber {
  get(key: string): any;
  get(...keys: string[]): any;
  set(key: string, value: any): any;
  addTags(tags: TagCollection, callback?: TagCallback): void;
  replaceTags(tags: TagCollection, callback?: TagCallback): void;
  removeTags(tags: TagCollection, callback?: TagCallback): void;
  removeTagsByKeys(keys: string[], callback?: TagCallback): void;
  clearTags(callback?: TagCallback): void;
  release(): void;
  initiateCall(dial: string, payload?: any, callback?: CallCallback): void;
}

export interface RetreaverCampaign {
  requestNumber(callback: NumberCallback): void;
  requestNumber(tags: TagCollection, callback: NumberCallback): void;
  requestNumber(tags: TagCollection, callback: NumberCallback, errorCallback: ErrorCallback): void;
  autoReplaceNumbers(tags?: TagCollection, callback?: NumberCallback, errorCallback?: ErrorCallback): void;
  numbers(): RetreaverNumber[];
  get(key: string): any;
  get(...keys: string[]): any;
  set(key: string, value: any): any;
}

// Main Retreaver namespace interface
export interface RetreaverNamespace {
  configure(options: ConfigureOptions): void;
  Campaign: new (options: CampaignOptions) => RetreaverCampaign;
  Number: new (attributes: NumberAttributes) => RetreaverNumber;
  Base: {
    Model: any;
    Request: any;
    Data: any;
    Helpers: any;
    Cookies: any;
    RequestNumber: any;
  };
  Cache: Record<string, any>;
  Vendor: {
    findAndReplaceDOMText: any;
  };
  _connection?: any;
}

// Global window extension
declare global {
  interface Window {
    Retreaver: RetreaverNamespace;
    XDomainRequest?: any;
    easyXDM?: any;
    TrueCall?: any;
    clickflare?: any;
  }
}
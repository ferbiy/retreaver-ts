// Export main classes and functions
export { Campaign } from './Campaign';
export { RetreaverNumber as Number } from './Number';
export { configure } from './configure';

// Export base classes
export { Model } from './base/Model';
export { Request } from './base/Request';
export { Data } from './base/Data';
export { Helpers } from './base/Helpers';
export { Cookies } from './base/Cookies';
export { Base64 } from './base/Base64';
export { RequestNumber } from './base/RequestNumber';

// Export utilities
export { Cache } from './Cache';
export { findAndReplaceDOMText } from './vendor/FindAndReplaceDOMText';

// Export types
export * from './types';

// Import all for global setup
import { Campaign } from './Campaign';
import { RetreaverNumber } from './Number';
import { configure } from './configure';
import { Model } from './base/Model';
import { Request } from './base/Request';
import { Data } from './base/Data';
import { Helpers } from './base/Helpers';
import { Cookies } from './base/Cookies';
import { Base64 } from './base/Base64';
import { RequestNumber } from './base/RequestNumber';
import { Cache } from './Cache';
import { findAndReplaceDOMText } from './vendor/FindAndReplaceDOMText';

// Setup global Retreaver namespace for backward compatibility
if (typeof window !== 'undefined') {
  const Retreaver = {
    Campaign,
    Number: RetreaverNumber,
    configure,
    Base: {
      Model,
      Request,
      Data,
      Helpers,
      Cookies,
      Base64,
      RequestNumber
    },
    Cache,
    Vendor: {
      findAndReplaceDOMText
    }
  };

  (window as any).Retreaver = Retreaver;
  
  // CallPixels alias
  (window as any).Callpixels = Retreaver;
}

// Default export for convenience
export default {
  Campaign,
  Number: RetreaverNumber,
  configure
};
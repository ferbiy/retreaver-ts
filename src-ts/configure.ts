import { Request } from './base/Request';
import { ConfigureOptions } from './types';

/**
 * Configure the retreaver client library
 * @param options - Configuration options
 * @param options.host - Retreaver API Host
 * @param options.prefix - http or https
 * @example
 * configure({host: 'api.rtvrapi.com', prefix: 'https'});
 */
export function configure(options: ConfigureOptions): void {
  const params = {
    addr: options.host,
    http_prefix: options.prefix || 'http',
    urlregex: "/\\/\\/[^\\/]*\\/(.*)/"
  };

  // Set the global connection
  if (typeof window !== 'undefined') {
    (window as any).Retreaver = (window as any).Retreaver || {};
    (window as any).Retreaver._connection = new Request(params);
  }
}

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.configure = configure;
}
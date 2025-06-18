/**
 * Cache module for Retreaver library
 * Maintains exact functionality from original cache.js
 */
export const Cache: Record<string, any> = {};

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver === 'undefined') {
    (window as any).Retreaver = {};
  }
  (window as any).Retreaver.Cache = Cache;
}
/**
 * CallPixels alias for Retreaver library
 * Maintains exact functionality from original callpixels.js
 */

// Ensure namespace is present for backward compatibility
if (typeof window !== 'undefined') {
  if (typeof (window as any).Retreaver !== 'undefined') {
    (window as any).Callpixels = (window as any).Retreaver;
  }
}
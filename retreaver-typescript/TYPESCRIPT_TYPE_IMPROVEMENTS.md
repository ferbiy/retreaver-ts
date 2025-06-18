# TypeScript Type Improvements

This document summarizes the type improvements made to the retreaver-ts codebase and explains where `any` types should be preserved.

## ✅ Improvements Made

### 1. Callback Type Improvements
- **ErrorCallback**: Changed from `(error: any)` to `(error: Error | string | unknown)` to better represent possible error types
- **TagCallback**: Changed from `(data?: any)` to `(data?: Record<string, unknown>)` to be more specific about the data structure
- **ModelCallback**: Changed from `(data: any)` to `(data: Record<string, unknown>)` for better type safety
- **ReplaceCallback**: Changed from `(...args: any[])` to `(...args: unknown[])` in vendor code

### 2. Function Return Type Improvements  
- **Helpers.isArray()**: Changed from `arg is any[]` to `arg is unknown[]` for better type safety
- **RetreaverNumber.tagsPayload()**: Changed from returning `any` to specific object type with known properties

## ⚠️ Types That Should Remain as `any`

### 1. Browser Compatibility & Dynamic Access
- `(window as any).*` - Required for cross-browser compatibility and dynamic property access
- `(element as any).readyState` - Needed for legacy IE browser support
- Dynamic property access like `(this as any)[setterName]` - Required for runtime method resolution

### 2. Generic Data Handling
- **Model.get()** and **Model.set()** methods - Handle dynamic data structures that can't be statically typed
- **Request callbacks** - Handle both string and object responses depending on context
- **Call interface properties** - Uses `[key: string]: any` for extensible data structure

### 3. Legacy Library Integration
- **Vendor library types** - Third-party library (FindAndReplaceDOMText) has complex internal structures
- **Base namespace properties** - Maintain compatibility with original JavaScript library structure

### 4. Configuration and Runtime Data
- **Cache objects** - `Record<string, any>` for flexible caching structures
- **Payload objects** - `any` types for flexible API request/response handling where structure varies

## 🔒 Types That Must Not Be Changed

1. **Window object extensions** - Break browser compatibility
2. **Legacy browser API calls** - Required for IE6/7 support  
3. **Dynamic method resolution** - Setter/getter pattern implementations
4. **Vendor library internals** - Complex nested array structures in DOM manipulation
5. **API response handling** - Variable response structures from external APIs

## Summary

The codebase now has improved type safety in callback functions and some return types while preserving the necessary `any` types for:
- Browser compatibility
- Dynamic behavior
- Legacy support
- Third-party library integration
- Flexible data structures

This balanced approach maintains functionality while providing better TypeScript experience where possible.
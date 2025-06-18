# Retreaver JS to TypeScript Migration Investigation & Plan

## 📋 Executive Summary

This document outlines the investigation findings and migration plan for converting the Retreaver JavaScript API library to TypeScript while maintaining 100% functionality and preparing for NPM package distribution.

## 🔍 Current Codebase Investigation

### Project Structure Analysis
```
retreaver-ts/
├── src/
│   ├── retreaver.js                    # Main entry point & namespace
│   └── retreaver/
│       ├── base/                       # Foundation classes
│       │   ├── helpers.js              # Utility functions
│       │   ├── cookies.js              # Cookie management
│       │   ├── base64.js               # Base64 encoding
│       │   ├── data.js                 # Data storage layer
│       │   ├── model.js                # Base model class
│       │   ├── request.js              # HTTP request handling
│       │   └── request_number.js       # Number request logic
│       ├── cache.js                    # Caching (minimal implementation)
│       ├── callpixels.js               # CallPixels integration
│       ├── campaign.js                 # Campaign management
│       ├── number.js                   # Number management
│       └── vendor/
│           └── find_and_replace_dom_text.js  # DOM text replacement
├── dist/                               # Built files (Grunt output)
├── examples/                           # Usage examples
├── config/                             # Documentation config
└── lib/retreaverjs/                    # Ruby/Rails integration
```

### Core Functionality Analysis

#### 1. **Main API Classes**
- **`Retreaver.Campaign`**: Manages campaigns, requests numbers, handles integrations
- **`Retreaver.Number`**: Manages phone numbers, tags, calls, visitor tracking
- **`Retreaver.Base.Model`**: Base class providing CRUD operations
- **`Retreaver.Base.Request`**: HTTP client with cross-browser compatibility
- **`Retreaver.Base.Data`**: In-memory data store

#### 2. **Key Features**
- **Number Management**: Request, tag, release phone numbers
- **Campaign Integration**: Match numbers to campaigns with tags
- **Call Initiation**: Start calls programmatically
- **Third-party Integrations**: Google Analytics, TrueCall, RedTrack, ClickFlare
- **DOM Manipulation**: Auto-replace phone numbers on pages
- **Cross-browser Support**: IE6+ compatibility with XDomainRequest/easyXDM
- **Visitor Tracking**: Cookie-based visitor identification

#### 3. **Architecture Patterns**
- **IIFE Pattern**: Each module wrapped in immediately invoked function expressions
- **Prototype Inheritance**: Uses JavaScript prototypal inheritance
- **Namespace Pattern**: Everything under `window.Retreaver` namespace
- **Observer Pattern**: Callback-based API responses
- **Singleton Pattern**: Shared data store and request connection

#### 4. **Browser Compatibility**
- Supports IE6+ (legacy XDomainRequest, easyXDM for older IE)
- Modern browsers (XMLHttpRequest, JSON, Promises)
- DOM manipulation capabilities
- Cookie management

#### 5. **Build Process**
- **Grunt**: Concatenates all JS files in specific order
- **File Order**: Critical dependency order maintained in Gruntfile.js
- **Output**: Single `retreaver.js` and minified `retreaver.min.js`

## 🎯 Migration Plan to TypeScript

### Phase 1: Project Setup & Infrastructure (Days 1-2)

#### 1.1 TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "UMD",
    "lib": ["DOM", "ES5", "ES2015.Promise"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 1.2 Package.json Updates
```json
{
  "name": "@retreaver/retreaver-js",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### Phase 2: Type Definitions (Days 3-4)

#### 2.1 Core Type Definitions
```typescript
// src/types/index.ts
export interface CampaignOptions {
  campaign_key: string;
}

export interface NumberAttributes {
  id: number;
  campaign_key: string;
  formatted_number: string;
  number: string;
  plain_number: string;
  target_open: boolean;
  is_per_visitor: boolean;
  tag_values: Record<string, string>;
}

export interface RequestOptions {
  host: string;
  prefix: 'http' | 'https';
}

export interface TagCollection {
  [key: string]: string;
}

export type NumberCallback = (number: RetreaverNumber) => void;
export type ErrorCallback = (error: any) => void;
```

#### 2.2 Integration Type Definitions
```typescript
// src/types/integrations.ts
export interface GoogleAnalyticsConfig {
  checkIntervalMs: number;
}

export interface TrueCallConfig {
  tcCampaignUuid: string;
  scriptSrc: string;
  checkIntervalMs: number;
}

export interface IntegrationConfigs {
  google_analytics?: GoogleAnalyticsConfig;
  'truecall.com'?: TrueCallConfig;
  red_track?: RedTrackConfig;
  click_flare?: ClickFlareConfig;
}
```

### Phase 3: Base Layer Migration (Days 5-7)

#### 3.1 Convert Base Classes
```typescript
// src/base/Helpers.ts
export class Helpers {
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

  static merge<T, U>(obj1: T, obj2: U): T & U {
    // Implementation preserved exactly as original
  }

  static isArray(arg: any): arg is any[] {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
}
```

#### 3.2 Convert Data Store
```typescript
// src/base/Data.ts
export interface DataConfig {
  type: string;
  primary_key: string | number;
}

export class Data {
  private static _store: Record<string, Record<string | number, any>> = {};
  private config: DataConfig;

  constructor(config: DataConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    // Implementation preserved exactly as original
  }

  get<T = any>(...keys: string[]): T {
    // Implementation preserved exactly as original
  }

  set<T>(key: string, value: T): T {
    // Implementation preserved exactly as original
  }
}
```

### Phase 4: Core Classes Migration (Days 8-11)

#### 4.1 Convert Model Base Class
```typescript
// src/base/Model.ts
export abstract class Model {
  protected type: string = 'model';
  protected _store?: Data;
  protected api_host_uri: string = '/api/v1/';

  protected abstract primaryKey(primary_key?: string): string;

  protected store(data?: any): Data | undefined {
    // Implementation preserved exactly as original
  }

  protected getData(path: string, callback?: Function): any {
    // Implementation preserved exactly as original
  }

  protected postData(path: string, data: any, callback?: Function): any {
    // Implementation preserved exactly as original
  }

  get(...keys: string[]): any {
    // Implementation preserved exactly as original
  }

  set(key: string, value: any): any {
    // Implementation preserved exactly as original
  }
}
```

#### 4.2 Convert Campaign Class
```typescript
// src/Campaign.ts
export class Campaign extends Model {
  protected type = 'campaigns';
  public numbers: RetreaverNumber[] = [];

  constructor(options: CampaignOptions) {
    super();
    this.initialize(options);
  }

  requestNumber(callback: NumberCallback): void;
  requestNumber(tags: TagCollection, callback: NumberCallback): void;
  requestNumber(
    tags: TagCollection,
    callback: NumberCallback,
    errorCallback: ErrorCallback
  ): void;
  requestNumber(
    tagsOrCallback: TagCollection | NumberCallback,
    callback?: NumberCallback,
    errorCallback?: ErrorCallback
  ): void {
    // Implementation preserved exactly as original with proper type handling
  }

  autoReplaceNumbers(
    tags?: TagCollection,
    callback?: NumberCallback,
    errorCallback?: ErrorCallback
  ): void {
    // Implementation preserved exactly as original
  }
}
```

### Phase 5: Advanced Features Migration (Days 12-14)

#### 5.1 Integration Handlers
```typescript
// src/integrations/GoogleAnalyticsIntegration.ts
export class GoogleAnalyticsIntegration {
  static handle(number: RetreaverNumber): void {
    const config = this.getIntegrationConfig(number, 'google_analytics');
    if (!config) return;

    const obtainCookies = new Promise<{gaSessionId: string; gaClientId: string}>((resolve) => {
      // Implementation preserved exactly as original
    });

    obtainCookies.then((sessionData) => {
      number.replaceTags({
        ga_session_id: sessionData.gaSessionId,
        ga_client_id: sessionData.gaClientId,
      });
    });
  }
}
```

#### 5.2 Request Handler with Cross-browser Support
```typescript
// src/base/Request.ts
export interface RequestConfig {
  http_prefix: 'http' | 'https';
  addr: string;
  urlregex: string;
}

export class Request {
  private config: RequestConfig;

  constructor(options: RequestConfig) {
    this.config = Helpers.assertRequiredKeys(options, 'http_prefix', 'addr', 'urlregex');
  }

  getJSON<T = any>(
    requestUrl: string,
    payload?: any,
    callbacks?: Function | Function[],
    context?: any
  ): void {
    // Implementation preserved exactly as original
  }

  private apiRequest(
    requestUri: string,
    callbackFunctions: Function | Function[],
    payload?: any
  ): void {
    // Implementation preserved exactly as original
    // Maintaining IE6/7 compatibility with XDomainRequest
  }
}
```

### Phase 6: Build System & Module System (Days 15-16)

#### 6.1 Module Structure
```typescript
// src/index.ts
export { Campaign } from './Campaign';
export { RetreaverNumber as Number } from './Number';
export { configure } from './configure';
export * from './types';

// Backward compatibility - attach to window if in browser
if (typeof window !== 'undefined') {
  (window as any).Retreaver = {
    Campaign,
    Number: RetreaverNumber,
    configure,
  };
}
```

#### 6.2 TypeScript Build Configuration
```typescript
// webpack.config.js (for browser builds)
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'retreaver.js',
    library: 'Retreaver',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

### Phase 7: Testing & Validation (Days 17-19)

#### 7.1 Unit Tests
```typescript
// tests/Campaign.test.ts
import { Campaign } from '../src/Campaign';

describe('Campaign', () => {
  it('should maintain exact same API as original', () => {
    const campaign = new Campaign({ campaign_key: 'test-key' });
    expect(campaign).toBeInstanceOf(Campaign);
    // Add tests to verify exact same behavior
  });
});
```

#### 7.2 Integration Tests
- Browser compatibility tests (IE11+, Chrome, Firefox, Safari)
- API endpoint integration tests
- DOM manipulation tests
- Third-party integration tests

### Phase 8: NPM Package Preparation (Days 20-21)

#### 8.1 Package Structure
```
dist/
├── index.js                 # CommonJS entry point
├── index.d.ts               # TypeScript definitions
├── esm/                     # ES Module version
│   └── index.js
└── browser/                 # Browser UMD bundle
    ├── retreaver.js
    └── retreaver.min.js
```

#### 8.2 NPM Scripts
```json
{
  "scripts": {
    "build": "npm run build:cjs && npm run build:esm && npm run build:browser",
    "build:cjs": "tsc --module commonjs --outDir dist",
    "build:esm": "tsc --module es2015 --outDir dist/esm",
    "build:browser": "webpack --config webpack.config.js",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

## ✅ Migration Principles

### 1. **100% Functionality Preservation**
- All existing APIs maintain exact same signatures
- All callback patterns preserved
- All integration behaviors maintained
- All browser compatibility maintained

### 2. **Type Safety Enhancement**
- Add comprehensive TypeScript interfaces
- Maintain runtime behavior exactly
- Provide better developer experience with IntelliSense

### 3. **Backward Compatibility**
- Original global `window.Retreaver` still available
- Same CDN-style usage supported
- Existing implementations continue working

### 4. **Modern Development**
- NPM package distribution
- ES modules support
- Tree-shaking capabilities
- Modern build tools integration

## 🚀 Implementation Timeline

- **Days 1-4**: Setup & Type definitions (20%)
- **Days 5-11**: Core migration (40%)
- **Days 12-16**: Advanced features & build system (25%)
- **Days 17-21**: Testing, validation & NPM prep (15%)

## 📦 Final Deliverables

1. **TypeScript Source Code**: Complete TS rewrite maintaining 100% functionality
2. **Type Definitions**: Comprehensive `.d.ts` files for excellent developer experience
3. **Multiple Build Targets**: CommonJS, ES Modules, UMD browser bundle
4. **NPM Package**: Ready for publication with proper versioning
5. **Documentation**: Updated README and API documentation
6. **Test Suite**: Comprehensive tests ensuring behavior parity

This migration plan ensures a smooth transition to TypeScript while maintaining complete backward compatibility and preparing for modern NPM distribution.
# Retreaver JavaScript API - TypeScript Edition

[![npm version](https://badge.fury.io/js/%40retreaver%2Fretreaver-js.svg)](https://badge.fury.io/js/%40retreaver%2Fretreaver-js)

A complete TypeScript rewrite of the Retreaver JavaScript API client library, maintaining 100% compatibility with the original while adding comprehensive type safety and modern development features.

## 🚀 Features

- **100% TypeScript**: Full type safety with comprehensive interfaces
- **100% Backward Compatible**: Drop-in replacement for the original JavaScript library
- **Multiple Build Targets**: CommonJS, ES Modules, and UMD browser bundle
- **Modern NPM Package**: Proper package structure with TypeScript definitions
- **Tree Shakable**: ES modules support for optimal bundle sizes
- **Legacy Browser Support**: Maintains IE6+ compatibility from original library
- **Third-party Integrations**: Google Analytics, TrueCall, RedTrack, ClickFlare support

## 📦 Installation

### NPM/Yarn (Recommended)
```bash
npm install @retreaver/retreaver-js
# or
yarn add @retreaver/retreaver-js
```

### CDN (Browser)
```html
<script src="https://unpkg.com/@retreaver/retreaver-js/dist/browser/retreaver.js"></script>
```

## 🔧 Usage

### TypeScript/ES Modules
```typescript
import { Campaign, configure } from '@retreaver/retreaver-js';

// Configure the library
configure({
  host: 'api.rtvrapi.com',
  prefix: 'https'
});

// Create a campaign
const campaign = new Campaign({ 
  campaign_key: '67d9fb1917ae8f4eaff36831b41788c3' 
});

// Request a number with type safety
campaign.requestNumber({ home_value: '50000' }, (number) => {
  console.log(number.get('formatted_number'));
  
  // Add tags with full intellisense
  number.addTags({ 
    date_of_birth: '1980/01/01',
    interested_in: 'solar_panels'
  });
});
```

### CommonJS (Node.js)
```javascript
const { Campaign, configure } = require('@retreaver/retreaver-js');

configure({
  host: 'api.rtvrapi.com',
  prefix: 'https'
});

const campaign = new Campaign({ 
  campaign_key: '67d9fb1917ae8f4eaff36831b41788c3' 
});
```

### Browser (Global)
```html
<script src="https://unpkg.com/@retreaver/retreaver-js/dist/browser/retreaver.js"></script>
<script>
// Works exactly like the original library
Retreaver.configure({
  host: 'api.rtvrapi.com',
  prefix: 'https'
});

var campaign = new Retreaver.Campaign({ 
  campaign_key: '67d9fb1917ae8f4eaff36831b41788c3' 
});

campaign.requestNumber({home_value: '50000'}, function (number) {
  document.getElementById('phone').innerHTML = number.get('formatted_number');
});
</script>
```

## 📚 API Reference

### Campaign Class

#### Constructor
```typescript
new Campaign(options: CampaignOptions)
```

#### Methods

**`requestNumber(callback: NumberCallback): void`**
**`requestNumber(tags: TagCollection, callback: NumberCallback): void`**
**`requestNumber(tags: TagCollection, callback: NumberCallback, errorCallback: ErrorCallback): void`**

Request a phone number from the campaign.

```typescript
campaign.requestNumber((number) => {
  console.log(number.get('formatted_number'));
});

campaign.requestNumber({ calling_about: 'support' }, (number) => {
  console.log(number.get('number')); // E.164 format
});
```

**`autoReplaceNumbers(tags?, callback?, errorCallback?): void`**

Automatically replace numbers on the page according to campaign settings.

### Number Class

#### Methods

**`addTags(tags: TagCollection, callback?: Function): void`**
```typescript
number.addTags({ 
  customer_type: 'premium',
  source: 'website' 
});
```

**`replaceTags(tags: TagCollection, callback?: Function): void`**
```typescript
number.replaceTags({ 
  status: 'qualified',
  score: '85' 
});
```

**`removeTags(tags: TagCollection, callback?: Function): void`**

**`removeTagsByKeys(keys: string[], callback?: Function): void`**

**`clearTags(callback?: Function): void`**

**`release(): void`**

**`initiateCall(dial: string, payload?: any, callback?: CallCallback): void`**
```typescript
number.initiateCall('1234567890', { 
  company_name: 'Acme Corp' 
}, (call) => {
  console.log('Call started with UUID:', call.uuid);
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Number ID |
| `campaign_key` | string | Campaign key |
| `formatted_number` | string | Nationally formatted number `(866) 898-7878` |
| `number` | string | E.164 formatted number `+18668987878` |
| `plain_number` | string | Unformatted digits `8668987878` |
| `target_open` | boolean | Whether targets are available |
| `is_per_visitor` | boolean | Whether number tracks unique visitors |
| `tag_values` | object | Currently assigned tags |

## 🔧 Configuration

```typescript
interface ConfigureOptions {
  host: string;          // API hostname
  prefix: 'http' | 'https'; // Protocol
}

configure({
  host: 'api.rtvrapi.com',
  prefix: 'https'
});
```

## 🎯 Type Definitions

The library includes comprehensive TypeScript definitions:

```typescript
interface TagCollection {
  [key: string]: string;
}

interface CampaignOptions {
  campaign_key: string;
}

interface NumberAttributes {
  id: number;
  campaign_key: string;
  formatted_number: string;
  number: string;
  // ... and many more
}

type NumberCallback = (number: RetreaverNumber) => void;
type ErrorCallback = (error: any) => void;
```

## 🌍 Third-party Integrations

The library automatically integrates with various third-party services when configured:

- **Google Analytics**: Automatic session and client ID tracking
- **TrueCall**: Dynamic script loading and ID tracking
- **RedTrack**: Click ID extraction and tagging
- **ClickFlare**: Event token tracking

## 🏗️ Build Targets

The package provides multiple build targets:

- **`dist/index.js`**: CommonJS for Node.js
- **`dist/esm/index.js`**: ES Modules for modern bundlers
- **`dist/browser/retreaver.js`**: UMD bundle for browsers
- **`dist/index.d.ts`**: TypeScript definitions

## 🔄 Migration from Original Library

This TypeScript version is a **drop-in replacement** for the original JavaScript library:

### Before (Original JS)
```javascript
<script src="retreaver.js"></script>
<script>
var campaign = new Retreaver.Campaign({campaign_key: 'abc123'});
campaign.request_number({tag: 'value'}, function(number) {
  console.log(number.get('formatted_number'));
});
</script>
```

### After (TypeScript)
```html
<script src="@retreaver/retreaver-js/dist/browser/retreaver.js"></script>
<script>
// Exact same code works!
var campaign = new Retreaver.Campaign({campaign_key: 'abc123'});
campaign.request_number({tag: 'value'}, function(number) {
  console.log(number.get('formatted_number'));
});
</script>
```

**Or with modern TypeScript:**
```typescript
import { Campaign } from '@retreaver/retreaver-js';

const campaign = new Campaign({campaign_key: 'abc123'});
campaign.requestNumber({tag: 'value'}, (number) => {
  console.log(number.get('formatted_number'));
});
```

## 🔍 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build all targets
npm run build

# Build specific targets
npm run build:cjs    # CommonJS
npm run build:esm    # ES Modules
npm run build:browser # Browser UMD

# Watch mode for development
npm run build:dev
```

### Project Structure

```
src-ts/
├── types/              # TypeScript type definitions
├── base/               # Foundation classes
│   ├── Helpers.ts      # Utility functions
│   ├── Cookies.ts      # Cookie management
│   ├── Data.ts         # Data storage
│   ├── Model.ts        # Base model class
│   ├── Request.ts      # HTTP client
│   └── RequestNumber.ts # Number request logic
├── vendor/             # Third-party utilities
│   └── FindAndReplaceDOMText.ts
├── Campaign.ts         # Campaign management
├── Number.ts           # Number management
├── configure.ts        # Configuration function
└── index.ts            # Main entry point
```

## 📄 License

GPL-3.0 - Same as the original library

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. 100% compatibility with original library is maintained
2. All TypeScript interfaces are properly typed
3. Tests pass for all build targets
4. Documentation is updated

## ⚠️ Breaking Changes

**None!** This is a feature, not a bug. The library maintains 100% API compatibility with the original JavaScript version while adding TypeScript benefits.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/retreaver/retreaverjs/issues)
- **Documentation**: [Retreaver Documentation](https://retreaver.com/documentation/javascript/v1/)
- **Original Library**: [GitHub](https://github.com/retreaver/retreaverjs)

---

**Built with ❤️ by the Retreaver team. Maintaining the power of the original with the safety of TypeScript.**
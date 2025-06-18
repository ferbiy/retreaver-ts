# Installation

Get started with the Retreaver JavaScript API by installing it through your preferred package manager or using a CDN for direct browser usage.

## Package Managers (Recommended)

### NPM

```bash
npm install @retreaver/retreaver-js
```

### Yarn

```bash
yarn add @retreaver/retreaver-js
```

### PNPM

```bash
pnpm add @retreaver/retreaver-js
```

## CDN (Browser)

For direct browser usage without a build system:

### Latest Version

```html
<script src="https://unpkg.com/@retreaver/retreaver-js/dist/browser/retreaver.js"></script>
```

### Specific Version (Recommended for production)

```html
<script src="https://unpkg.com/@retreaver/retreaver-js@1.0.0/dist/browser/retreaver.js"></script>
```

### JSDelivr Alternative

```html
<script src="https://cdn.jsdelivr.net/npm/@retreaver/retreaver-js@1.0.0/dist/browser/retreaver.js"></script>
```

## Build Targets

The package provides multiple build targets to support different environments:

| Build Target | Path | Usage |
|-------------|------|--------|
| **ES Modules** | `dist/esm/index.js` | Modern bundlers (Webpack, Rollup, Vite) |
| **CommonJS** | `dist/index.js` | Node.js applications |
| **UMD Bundle** | `dist/browser/retreaver.js` | Direct browser usage |
| **TypeScript** | `dist/index.d.ts` | Type definitions |

## Verification

After installation, verify everything is working:

### Node.js/TypeScript

```typescript
import { Campaign, configure } from '@retreaver/retreaver-js';

console.log('Retreaver library loaded successfully!');
```

### Browser (Global)

```html
<script src="https://unpkg.com/@retreaver/retreaver-js/dist/browser/retreaver.js"></script>
<script>
console.log('Retreaver available:', typeof Retreaver !== 'undefined');
console.log('Campaign class:', typeof Retreaver.Campaign);
</script>
```

## Requirements

### Node.js Projects
- **Node.js**: >= 14.0.0
- **TypeScript**: >= 4.0.0 (if using TypeScript)

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Legacy Support**: Internet Explorer 6+ (via UMD bundle)
- **Mobile**: iOS Safari, Android Chrome

## Next Steps

Once installed, proceed to:

1. **[Quick Start Guide](./quick-start)** - Get your first number in 5 minutes
2. **[Configuration](./configuration)** - Set up your API endpoints
3. **[Basic Examples](../examples/basic-usage)** - See working code samples

## Troubleshooting

### Common Issues

**TypeError: Campaign is not a constructor**
```javascript
// ❌ Wrong - using CommonJS destructuring syntax
const { Campaign } = require('@retreaver/retreaver-js');

// ✅ Correct - using default export
const Retreaver = require('@retreaver/retreaver-js');
const campaign = new Retreaver.Campaign({...});

// ✅ Or with ES modules
import { Campaign } from '@retreaver/retreaver-js';
```

**Module not found errors in TypeScript**
- Ensure you have TypeScript >= 4.0.0
- Check your `tsconfig.json` has proper module resolution

**Bundle size concerns**
- Use ES modules build for tree-shaking
- Import only what you need:
```typescript
import { Campaign } from '@retreaver/retreaver-js';
// Instead of: import * as Retreaver from '@retreaver/retreaver-js';
```

Need more help? Check our [GitHub Issues](https://github.com/retreaver/retreaverjs/issues) or [Discussions](https://github.com/retreaver/retreaverjs/discussions).
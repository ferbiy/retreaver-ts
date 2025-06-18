# Welcome to Retreaver JavaScript API

Welcome to the **Retreaver JavaScript API** documentation! This is a complete **TypeScript rewrite** of the original Retreaver JavaScript library, maintaining **100% backward compatibility** while adding modern development features.

## 🚀 What You'll Find Here

This documentation provides everything you need to integrate phone call tracking into your web applications:

- **[Getting Started Guide](./getting-started/installation)** - Install and configure the library
- **[API Reference](../api/)** - Complete method and class documentation  
- **[Live Examples](./examples/basic-usage)** - Working code examples
- **[Interactive Playground](../playground)** - Try the library in your browser
- **[Integration Guides](./integrations/google-analytics)** - Third-party service setup

## ✨ Key Features

### 🔧 **TypeScript First**
Built from scratch in TypeScript with comprehensive type definitions for the best developer experience.

```typescript
import { Campaign, configure } from '@retreaver/retreaver-js';

// Full IntelliSense and type checking
const campaign = new Campaign({ 
  campaign_key: 'your-key-here' 
});

campaign.requestNumber({ home_value: '50000' }, (number) => {
  // Fully typed number object
  console.log(number.get('formatted_number'));
});
```

### 🔄 **100% Backward Compatible**
Drop-in replacement for the original library. All existing code works without changes:

```html
<!-- Your existing code continues to work -->
<script src="retreaver.js"></script>
<script>
var campaign = new Retreaver.Campaign({campaign_key: 'abc123'});
campaign.request_number({tag: 'value'}, function(number) {
  console.log(number.get('formatted_number'));
});
</script>
```

### 📦 **Multiple Build Targets**
- **ES Modules** for modern bundlers (tree-shaking support)
- **CommonJS** for Node.js applications  
- **UMD Bundle** for direct browser usage
- **TypeScript Definitions** included

### 🔗 **Built-in Integrations**
Automatic integration with popular services:
- Google Analytics (session & client tracking)
- TrueCall (dynamic phone numbers)
- RedTrack (click ID tracking)
- ClickFlare (conversion tracking)

## 🎯 Quick Start

Get up and running in less than 5 minutes:

```bash
npm install @retreaver/retreaver-js
```

```typescript
import { Campaign, configure } from '@retreaver/retreaver-js';

// Configure the library
configure({
  host: 'api.rtvrapi.com',
  prefix: 'https'
});

// Create a campaign
const campaign = new Campaign({ 
  campaign_key: 'your-campaign-key' 
});

// Request a number
campaign.requestNumber((number) => {
  document.getElementById('phone').textContent = 
    number.get('formatted_number');
});
```

## 📚 Navigation Guide

### New to Retreaver?
Start with our **[Installation Guide](./getting-started/installation)** to get set up quickly.

### Migrating from JavaScript?
Check out our **[Migration Guide](./getting-started/migration-guide)** for a smooth transition.

### Need Specific Examples?
Browse our **[Examples Section](./examples/basic-usage)** for real-world implementations.

### Want to Experiment?
Try our **[Interactive Playground](../playground)** to test code in real-time.

### Looking for API Details?
The **[API Reference](../api/)** has complete documentation for every method and property.

## 💡 What's Different?

| Original JavaScript | New TypeScript |
|-------------------|----------------|
| ✅ Runtime errors | ✅ Compile-time safety |
| ✅ Basic IntelliSense | ✅ Full type checking |
| ✅ UMD bundle only | ✅ Multiple build targets |
| ✅ Manual types | ✅ Built-in TypeScript support |
| ✅ No tree-shaking | ✅ Optimized bundling |

## 🤝 Need Help?

- **GitHub Issues**: [Report bugs or request features](https://github.com/retreaver/retreaverjs/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/retreaver/retreaverjs/discussions)  
- **Stack Overflow**: [Get community help](https://stackoverflow.com/questions/tagged/retreaver)
- **Documentation**: [Full Retreaver docs](https://retreaver.com/documentation/)

---

**Ready to get started?** Head over to the **[Installation Guide](./getting-started/installation)** and build something amazing! 🚀
/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
        'getting-started/migration-guide',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core/campaigns',
        'core/numbers',
        'core/tags',
        'core/call-tracking',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/campaign',
        'api/number',
        'api/configuration',
        'api/types',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/google-analytics',
        'integrations/truecall',
        'integrations/redtrack',
        'integrations/clickflare',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic-usage',
        'examples/react-integration',
        'examples/wordpress',
        'examples/advanced-tracking',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/typescript',
        'advanced/bundling',
        'advanced/performance',
        'advanced/debugging',
      ],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

module.exports = sidebars;
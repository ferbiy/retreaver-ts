// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Retreaver JavaScript API',
  tagline: 'TypeScript-first phone tracking library with complete backward compatibility',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://retreaver.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/retreaverjs/',

  // GitHub pages deployment config
  organizationName: 'retreaver',
  projectName: 'retreaverjs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/retreaver/retreaverjs/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/retreaver/retreaverjs/tree/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/retreaver-social-card.jpg',
      navbar: {
        title: 'Retreaver JS',
        logo: {
          alt: 'Retreaver Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/api',
            label: 'API Reference',
            position: 'left',
          },
          {
            to: '/playground',
            label: 'Playground',
            position: 'left',
          },
          {
            to: '/examples',
            label: 'Examples',
            position: 'left',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/retreaver/retreaverjs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'API Reference',
                to: '/api',
              },
              {
                label: 'Examples',
                to: '/examples',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/retreaver/retreaverjs/discussions',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/retreaver',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/retreaver/retreaverjs',
              },
              {
                label: 'Retreaver.com',
                href: 'https://retreaver.com',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Retreaver Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['typescript', 'javascript', 'bash'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'YOUR_APP_ID',
        // Public API key: it is safe to commit it
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'retreaver-js',
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),

  themes: ['@docusaurus/theme-live-codeblock'],
  
  // Removed the API docs plugin for now since it conflicts with TypeDoc
  // plugins: [
  //   [
  //     '@docusaurus/plugin-content-docs',
  //     {
  //       id: 'api',
  //       path: '../docs/api',
  //       routeBasePath: 'api',
  //       sidebarPath: require.resolve('./sidebars.api.js'),
  //     },
  //   ],
  // ],
};

module.exports = config;
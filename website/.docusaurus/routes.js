import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/retreaverjs/__docusaurus/debug',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug', 'e55'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/config',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/config', 'aaa'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/content',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/content', '3d0'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/globalData',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/globalData', '487'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/metadata',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/metadata', 'f6c'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/registry',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/registry', '9c2'),
    exact: true
  },
  {
    path: '/retreaverjs/__docusaurus/debug/routes',
    component: ComponentCreator('/retreaverjs/__docusaurus/debug/routes', 'd02'),
    exact: true
  },
  {
    path: '/retreaverjs/search',
    component: ComponentCreator('/retreaverjs/search', '2c8'),
    exact: true
  },
  {
    path: '/retreaverjs/docs',
    component: ComponentCreator('/retreaverjs/docs', '04c'),
    routes: [
      {
        path: '/retreaverjs/docs',
        component: ComponentCreator('/retreaverjs/docs', '0df'),
        routes: [
          {
            path: '/retreaverjs/docs',
            component: ComponentCreator('/retreaverjs/docs', '5a9'),
            routes: [
              {
                path: '/retreaverjs/docs/getting-started/installation',
                component: ComponentCreator('/retreaverjs/docs/getting-started/installation', '3f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/retreaverjs/docs/intro',
                component: ComponentCreator('/retreaverjs/docs/intro', 'f93'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/retreaverjs/',
    component: ComponentCreator('/retreaverjs/', '328'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];

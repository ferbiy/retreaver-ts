import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '100% TypeScript',
    Svg: require('@site/static/img/typescript-icon.svg').default,
    description: (
      <>
        Built from the ground up in TypeScript with comprehensive type definitions.
        Get full IntelliSense, compile-time error checking, and better refactoring support.
      </>
    ),
  },
  {
    title: 'Backward Compatible',
    Svg: require('@site/static/img/compatibility-icon.svg').default,
    description: (
      <>
        Drop-in replacement for the original JavaScript library. All existing code
        continues to work without any changes while gaining TypeScript benefits.
      </>
    ),
  },
  {
    title: 'Modern & Fast',
    Svg: require('@site/static/img/performance-icon.svg').default,
    description: (
      <>
        ES Modules, tree-shaking, multiple build targets, and modern development tools.
        Optimized bundle sizes and excellent performance in all environments.
      </>
    ),
  },
  {
    title: 'Third-party Ready',
    Svg: require('@site/static/img/integrations-icon.svg').default,
    description: (
      <>
        Built-in integrations with Google Analytics, TrueCall, RedTrack, and ClickFlare.
        Automatic session tracking and seamless data flow.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    Svg: require('@site/static/img/developer-icon.svg').default,
    description: (
      <>
        Comprehensive documentation, interactive examples, live playground,
        and excellent debugging tools. Built by developers, for developers.
      </>
    ),
  },
  {
    title: 'Production Ready',
    Svg: require('@site/static/img/production-icon.svg').default,
    description: (
      <>
        Battle-tested in production environments. Comprehensive error handling,
        fallbacks, and legacy browser support (IE6+).
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
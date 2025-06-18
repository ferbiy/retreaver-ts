import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '100% TypeScript',
    emoji: '🔧',
    description: (
      <>
        Built from the ground up in TypeScript with comprehensive type definitions.
        Get full IntelliSense, compile-time error checking, and better refactoring support.
      </>
    ),
  },
  {
    title: 'Backward Compatible',
    emoji: '🔄',
    description: (
      <>
        Drop-in replacement for the original JavaScript library. All existing code
        continues to work without any changes while gaining TypeScript benefits.
      </>
    ),
  },
  {
    title: 'Modern & Fast',
    emoji: '⚡',
    description: (
      <>
        ES Modules, tree-shaking, multiple build targets, and modern development tools.
        Optimized bundle sizes and excellent performance in all environments.
      </>
    ),
  },
  {
    title: 'Third-party Ready',
    emoji: '🔗',
    description: (
      <>
        Built-in integrations with Google Analytics, TrueCall, RedTrack, and ClickFlare.
        Automatic session tracking and seamless data flow.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    emoji: '👨‍💻',
    description: (
      <>
        Comprehensive documentation, interactive examples, live playground,
        and excellent debugging tools. Built by developers, for developers.
      </>
    ),
  },
  {
    title: 'Production Ready',
    emoji: '🚀',
    description: (
      <>
        Battle-tested in production environments. Comprehensive error handling,
        fallbacks, and legacy browser support (IE6+).
      </>
    ),
  },
];

function Feature({emoji, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureSvg} style={{
          fontSize: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px'
        }}>
          {emoji}
        </div>
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
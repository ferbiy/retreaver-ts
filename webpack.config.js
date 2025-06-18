const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'retreaver.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: {
      name: 'Retreaver',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this',
    clean: true
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
  },
  mode: 'production',
  optimization: {
    minimize: false // We'll create a separate minified version
  }
};
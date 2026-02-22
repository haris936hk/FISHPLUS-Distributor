import rules from './webpack.rules.mjs';

export default {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
    'jsreport-core': 'commonjs jsreport-core',
    '@jsreport/jsreport-chrome-pdf': 'commonjs @jsreport/jsreport-chrome-pdf',
    '@jsreport/jsreport-handlebars': 'commonjs @jsreport/jsreport-handlebars',
  },
};

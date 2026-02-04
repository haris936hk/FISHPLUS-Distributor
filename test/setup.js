const { JSDOM } = require('jsdom');

// Set up JSDOM for React component testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Suppress React 18 console errors in tests
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
    return;
  }
  originalError.call(console, ...args);
};

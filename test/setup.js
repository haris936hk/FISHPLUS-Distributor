import '@testing-library/jest-dom';

// JSDOM is handled by Vitest environment config, no manual setup needed here
// but we can add global mocks if necessary

// Suppress React 18 console errors in tests
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
    return;
  }
  originalError.call(console, ...args);
};

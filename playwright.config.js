const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './test/e2e',
    outputDir: 'test-results',
    timeout: 30000,
    expect: {
        timeout: 10000,
    },
    reporter: 'list',
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
});

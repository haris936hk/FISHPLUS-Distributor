const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

test.describe('Application Launch', () => {
    let app;
    let firstWindow;

    test.beforeAll(async () => {
        // Launch the app using the webpack build output
        // We assume the app has been built/started at least once to generate .webpack/main
        const mainEntry = path.join(__dirname, '../../.webpack/main/index.js');

        // Electron executeable path provided by the 'electron' package
        const electronPath = require('electron');

        app = await electron.launch({
            executablePath: electronPath,
            args: [mainEntry],
        });

        firstWindow = await app.firstWindow();
        await firstWindow.waitForLoadState('domcontentloaded');
    });

    test.afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    test('shows the correct window title', async () => {
        // Use auto-retrying assertion for title
        await expect(firstWindow).toHaveTitle(/FISHPLUS/);
    });

    test('renders the dashboard', async () => {
        // Check if error boundary is showing
        const errorBoundary = firstWindow.getByText('Something went wrong');
        if (await errorBoundary.isVisible()) {
            console.error('App crashed!');
            // Try to get error details
            const errorDetails = await firstWindow.getByText('Error Details:').isVisible()
                ? await firstWindow.locator('code').textContent()
                : 'No details';
            console.error(errorDetails);
            throw new Error('App crashed: ' + errorDetails);
        }

        // Check for a known element on the dashboard
        // The dashboard header contains "AL-SHEIKH FISH TRADER"
        // Use a high-confidence locator
        const title = firstWindow.getByText(/AL-SHEIKH FISH TRADER/);
        await expect(title).toBeVisible({ timeout: 10000 });
    });
});

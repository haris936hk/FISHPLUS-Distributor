import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.js'],
        include: ['test/**/*.{test,spec}.{js,jsx}'],
        exclude: ['test/e2e/**', 'node_modules', 'dist'],
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
    resolve: {
        alias: {
            // electron: fileURLToPath(new URL('./__mocks__/electron.js', import.meta.url)),
        },
    },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.js'],
        include: ['test/**/*.{test,spec}.{js,jsx}'],
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
});

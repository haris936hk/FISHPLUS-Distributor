import { vi } from 'vitest';

export const query = vi.fn();
export const execute = vi.fn();
export const transaction = vi.fn((callback) => callback());
export const initialize = vi.fn();
export const close = vi.fn();

export default {
    query,
    execute,
    transaction,
    initialize,
    close,
};

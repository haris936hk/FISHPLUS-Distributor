import { describe, it, expect } from 'vitest';

/**
 * Example / smoke tests demonstrating Vitest's basic and async patterns.
 * These supplement sanity.test.js with a slightly richer demonstration.
 */
describe('Example Vitest Tests', () => {
  it('basic arithmetic works', () => {
    expect(2 + 2).toBe(4);
  });

  it('array operations work correctly', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('object matching works', () => {
    const obj = { name: 'Fish', weight: 25.5 };
    expect(obj).toMatchObject({ name: 'Fish' });
    expect(obj.weight).toBeCloseTo(25.5);
  });

  it('async operations resolve correctly', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('async operations can reject and be caught', async () => {
    await expect(Promise.reject(new Error('oops'))).rejects.toThrow('oops');
  });

  it('string matching works', () => {
    const message = 'AL-SHEIKH FISH TRADER';
    expect(message).toContain('FISH');
    expect(message).toMatch(/TRADER/);
  });
});

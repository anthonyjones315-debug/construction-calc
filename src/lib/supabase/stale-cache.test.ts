import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isSupabaseTimeoutLike,
  throwForStaleCacheOnTimeout,
  withSupabaseRevalidationTimeout,
  SupabaseTimeoutError,
} from './stale-cache';

describe('isSupabaseTimeoutLike', () => {
  it('should return true for SupabaseTimeoutError', () => {
    expect(isSupabaseTimeoutLike(new SupabaseTimeoutError('test'))).toBe(true);
  });

  it('should return false for primitive types, undefined, and null', () => {
    expect(isSupabaseTimeoutLike(undefined)).toBe(false);
    expect(isSupabaseTimeoutLike(null)).toBe(false);
    expect(isSupabaseTimeoutLike(123)).toBe(false);
    expect(isSupabaseTimeoutLike('string')).toBe(false);
  });

  it('should return true for AbortError', () => {
    const error = new Error('abort');
    error.name = 'AbortError';
    expect(isSupabaseTimeoutLike(error)).toBe(true);
    expect(isSupabaseTimeoutLike({ name: 'AbortError' })).toBe(true);
  });

  it('should return true for postgres timeout code 57014', () => {
    expect(isSupabaseTimeoutLike({ code: '57014' })).toBe(true);
  });

  it('should return true for timeout-related messages', () => {
    expect(isSupabaseTimeoutLike({ message: 'query_canceled' })).toBe(true);
    expect(isSupabaseTimeoutLike({ message: 'statement timeout' })).toBe(true);
    expect(isSupabaseTimeoutLike({ message: 'connection timed out' })).toBe(true);
    expect(isSupabaseTimeoutLike({ message: 'TIMEOUT exception' })).toBe(true);
  });

  it('should return false for random errors', () => {
    expect(isSupabaseTimeoutLike(new Error('something else'))).toBe(false);
    expect(isSupabaseTimeoutLike({ message: 'random error', code: '123' })).toBe(false);
  });
});

describe('throwForStaleCacheOnTimeout', () => {
  it('should throw SupabaseTimeoutError if error is timeout-like', () => {
    const timeoutError = Object.assign(new Error('timeout msg'), { code: '57014' });
    expect(() => throwForStaleCacheOnTimeout(timeoutError, 'myOp')).toThrow(SupabaseTimeoutError);
    expect(() => throwForStaleCacheOnTimeout(timeoutError, 'myOp')).toThrow(
      '[stale-cache-fallback] myOp: timeout msg'
    );
  });

  it('should throw SupabaseTimeoutError with generic message if error is not Error instance', () => {
    const timeoutError = { code: '57014', message: 'timeout msg' };
    expect(() => throwForStaleCacheOnTimeout(timeoutError, 'myOp')).toThrow(SupabaseTimeoutError);
    expect(() => throwForStaleCacheOnTimeout(timeoutError, 'myOp')).toThrow(
      '[stale-cache-fallback] myOp: Supabase timeout detected'
    );
  });

  it('should not throw if error is not timeout-like', () => {
    const normalError = new Error('something else');
    expect(() => throwForStaleCacheOnTimeout(normalError, 'myOp')).not.toThrow();
  });
});

describe('withSupabaseRevalidationTimeout', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should resolve if operation completes within timeout', async () => {
    const result = await withSupabaseRevalidationTimeout(Promise.resolve('success'), 'myOp');
    expect(result).toBe('success');
  });

  it('should reject if operation rejects within timeout', async () => {
    const error = new Error('op error');
    await expect(withSupabaseRevalidationTimeout(Promise.reject(error), 'myOp')).rejects.toThrow(
      'op error'
    );
  });

  it('should reject with SupabaseTimeoutError if operation times out', async () => {
    process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = '50';

    // We must pass a PromiseLike since `withSupabaseRevalidationTimeout`
    // resolves the Promise at the time it's called with `Promise.resolve(operation)`.
    // It captures process.env.SUPABASE_REVALIDATION_TIMEOUT_MS at that exact moment.

    const slowOperation = new Promise((resolve) => setTimeout(() => resolve('success'), 150));

    await expect(withSupabaseRevalidationTimeout(slowOperation, 'myOp')).rejects.toThrow(
      SupabaseTimeoutError
    );
    // test exact message matching
    try {
      await withSupabaseRevalidationTimeout(new Promise((r) => setTimeout(r, 150)), 'myOp');
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toBe('myOp timed out after 50ms');
    }
  });

  it('should use default timeout if env is not set or invalid', async () => {
    process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = 'invalid';

    // Default is 3500ms, let's just make sure it doesn't timeout fast
    const fastOperation = new Promise((resolve) => setTimeout(() => resolve('success'), 50));

    const result = await withSupabaseRevalidationTimeout(fastOperation, 'myOp');
    expect(result).toBe('success');
  });
});

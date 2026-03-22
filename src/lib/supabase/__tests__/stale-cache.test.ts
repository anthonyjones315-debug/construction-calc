import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withSupabaseRevalidationTimeout,
  isSupabaseTimeoutLike,
  throwForStaleCacheOnTimeout,
  SupabaseTimeoutError,
} from '../stale-cache';

describe('withSupabaseRevalidationTimeout', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  it('should resolve successfully before timeout', async () => {
    const operation = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 1000);
    });

    const promise = withSupabaseRevalidationTimeout(operation, 'testOp');

    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toBe('success');
  });

  it('should timeout with default MS (3500)', async () => {
    const operation = new Promise(() => {}); // never resolves

    const promise = withSupabaseRevalidationTimeout(operation, 'testOp');

    // Using vi.advanceTimersByTimeAsync triggers the timeout and rejects the promise, but without
    // expect(promise).rejects being ready, it counts as an Unhandled Rejection in Vitest if not caught properly or awaited properly in conjunction.
    // So we capture it with expect().rejects before advancing.

    const promiseToReject = expect(promise).rejects.toThrow(SupabaseTimeoutError);
    await vi.advanceTimersByTimeAsync(3500);
    await promiseToReject;
  });

  it('should use SUPABASE_REVALIDATION_TIMEOUT_MS from env', async () => {
    process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = '5000';
    const operation = new Promise(() => {});

    const promise = withSupabaseRevalidationTimeout(operation, 'testOp');

    await vi.advanceTimersByTimeAsync(4999);
    // Should not timeout yet

    const promiseToReject = expect(promise).rejects.toThrow(SupabaseTimeoutError);
    await vi.advanceTimersByTimeAsync(1);
    await promiseToReject;
  });

  it('should fallback to default MS if env var is invalid', async () => {
    process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = 'invalid';
    const operation = new Promise(() => {});

    const promise = withSupabaseRevalidationTimeout(operation, 'testOp');

    const promiseToReject = expect(promise).rejects.toThrow(SupabaseTimeoutError);
    await vi.advanceTimersByTimeAsync(3500);
    await promiseToReject;
  });

  it('should reject if operation rejects before timeout', async () => {
    const operation = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('operation failed')), 1000);
    });

    const promise = withSupabaseRevalidationTimeout(operation, 'testOp');

    const promiseToReject = expect(promise).rejects.toThrow('operation failed');
    await vi.advanceTimersByTimeAsync(1000);
    await promiseToReject;
  });
});

describe('isSupabaseTimeoutLike', () => {
  it('should return true for SupabaseTimeoutError', () => {
    const error = new SupabaseTimeoutError('test error');
    expect(isSupabaseTimeoutLike(error)).toBe(true);
  });

  it('should return false for falsy or primitive values', () => {
    expect(isSupabaseTimeoutLike(null)).toBe(false);
    expect(isSupabaseTimeoutLike(undefined)).toBe(false);
    expect(isSupabaseTimeoutLike('timeout')).toBe(false); // String matching 'timeout' is not an error object
    expect(isSupabaseTimeoutLike(123)).toBe(false);
    expect(isSupabaseTimeoutLike(true)).toBe(false);
  });

  it('should return true for errors with AbortError name', () => {
    const error = new Error('aborted');
    error.name = 'AbortError';
    expect(isSupabaseTimeoutLike(error)).toBe(true);

    const objError = { name: 'AbortError' };
    expect(isSupabaseTimeoutLike(objError)).toBe(true);
  });

  it('should return true for errors with code 57014', () => {
    const objError = { code: '57014', message: 'postgres canceled query' };
    expect(isSupabaseTimeoutLike(objError)).toBe(true);
  });

  it('should return true for errors with specific timeout messages', () => {
    const timeoutMsg1 = { message: 'connection timed out' };
    expect(isSupabaseTimeoutLike(timeoutMsg1)).toBe(true);

    const timeoutMsg2 = { message: 'statement timeout occurred' };
    expect(isSupabaseTimeoutLike(timeoutMsg2)).toBe(true);

    const timeoutMsg3 = { message: 'query_canceled due to timeout' };
    expect(isSupabaseTimeoutLike(timeoutMsg3)).toBe(true);

    const timeoutMsg4 = { message: 'some timeout error' };
    expect(isSupabaseTimeoutLike(timeoutMsg4)).toBe(true);
  });

  it('should be case-insensitive for messages', () => {
    const timeoutMsg = { message: 'TIMED OUT' };
    expect(isSupabaseTimeoutLike(timeoutMsg)).toBe(true);
  });

  it('should return false for unrelated errors', () => {
    const error = new Error('network error');
    expect(isSupabaseTimeoutLike(error)).toBe(false);

    const objError = { code: '23505', message: 'unique violation' };
    expect(isSupabaseTimeoutLike(objError)).toBe(false);

    expect(isSupabaseTimeoutLike({})).toBe(false);
  });
});

describe('throwForStaleCacheOnTimeout', () => {
  it('should not throw if error is not timeout-like', () => {
    const error = new Error('network error');
    expect(() => throwForStaleCacheOnTimeout(error, 'testOp')).not.toThrow();

    expect(() => throwForStaleCacheOnTimeout(null, 'testOp')).not.toThrow();
  });

  it('should throw SupabaseTimeoutError with correct prefix if timeout-like Error object', () => {
    const error = new Error('timed out operation');
    error.name = 'AbortError';

    expect(() => throwForStaleCacheOnTimeout(error, 'testOp')).toThrow(SupabaseTimeoutError);
    expect(() => throwForStaleCacheOnTimeout(error, 'testOp')).toThrow(
      '[stale-cache-fallback] testOp: timed out operation'
    );
  });

  it('should throw SupabaseTimeoutError with default message if timeout-like non-Error object', () => {
    const objError = { code: '57014' }; // No message provided

    expect(() => throwForStaleCacheOnTimeout(objError, 'testOp')).toThrow(SupabaseTimeoutError);
    expect(() => throwForStaleCacheOnTimeout(objError, 'testOp')).toThrow(
      '[stale-cache-fallback] testOp: Supabase timeout detected'
    );
  });

  it('should re-wrap an existing SupabaseTimeoutError', () => {
    const error = new SupabaseTimeoutError('original message');

    expect(() => throwForStaleCacheOnTimeout(error, 'testOp')).toThrow(SupabaseTimeoutError);
    expect(() => throwForStaleCacheOnTimeout(error, 'testOp')).toThrow(
      '[stale-cache-fallback] testOp: original message'
    );
  });
});

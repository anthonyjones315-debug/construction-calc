import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SupabaseTimeoutError,
  isSupabaseTimeoutLike,
  throwForStaleCacheOnTimeout,
  withSupabaseRevalidationTimeout,
} from "@/lib/supabase/stale-cache";

describe("stale-cache timeout utilities", () => {
  describe("isSupabaseTimeoutLike", () => {
    it("returns true for SupabaseTimeoutError instances", () => {
      const error = new SupabaseTimeoutError("test timeout");
      expect(isSupabaseTimeoutLike(error)).toBe(true);
    });

    it("returns false for non-objects or null", () => {
      expect(isSupabaseTimeoutLike(null)).toBe(false);
      expect(isSupabaseTimeoutLike(undefined)).toBe(false);
      expect(isSupabaseTimeoutLike("timeout")).toBe(false);
      expect(isSupabaseTimeoutLike(123)).toBe(false);
    });

    it("returns true for objects with name 'AbortError'", () => {
      expect(isSupabaseTimeoutLike({ name: "AbortError" })).toBe(true);
    });

    it("returns true for objects with code '57014'", () => {
      expect(isSupabaseTimeoutLike({ code: "57014" })).toBe(true);
    });

    it("returns true for objects with timeout-related messages", () => {
      expect(isSupabaseTimeoutLike({ message: "Network timeout occurred" })).toBe(true);
      expect(isSupabaseTimeoutLike({ message: "Request timed out" })).toBe(true);
      expect(isSupabaseTimeoutLike({ message: "canceling statement due to statement timeout" })).toBe(true);
      expect(isSupabaseTimeoutLike({ message: "canceling statement due to query_canceled" })).toBe(true);
    });

    it("returns false for other objects and errors", () => {
      expect(isSupabaseTimeoutLike(new Error("Something else went wrong"))).toBe(false);
      expect(isSupabaseTimeoutLike({ code: "12345", message: "Normal error" })).toBe(false);
      expect(isSupabaseTimeoutLike({})).toBe(false);
    });
  });

  describe("throwForStaleCacheOnTimeout", () => {
    it("does nothing if the error is not timeout-like", () => {
      const error = new Error("Normal error");
      // Should not throw
      expect(() => throwForStaleCacheOnTimeout(error, "testOp")).not.toThrow();
    });

    it("throws a SupabaseTimeoutError with the correct message if the error is an Error object", () => {
      const error = { name: "AbortError", message: "The operation was aborted" };

      expect(() => throwForStaleCacheOnTimeout(error, "fetchData")).toThrowError(
        SupabaseTimeoutError
      );

      expect(() => throwForStaleCacheOnTimeout(error, "fetchData")).toThrowError(
        "[stale-cache-fallback] fetchData: Supabase timeout detected" // Since error is not an instanceof Error
      );
    });

    it("throws a SupabaseTimeoutError with the correct message if the error is an instanceof Error", () => {
      const error = new Error("The operation timed out");
      error.name = "AbortError"; // Make it timeout-like

      expect(() => throwForStaleCacheOnTimeout(error, "fetchData")).toThrowError(
        SupabaseTimeoutError
      );

      expect(() => throwForStaleCacheOnTimeout(error, "fetchData")).toThrowError(
        "[stale-cache-fallback] fetchData: The operation timed out"
      );
    });
  });

  describe("withSupabaseRevalidationTimeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
      delete process.env.SUPABASE_REVALIDATION_TIMEOUT_MS;
    });

    it("resolves successfully if the operation finishes before the timeout", async () => {
      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("success"), 1000);
      });

      const promise = withSupabaseRevalidationTimeout(operation, "testOp");

      vi.advanceTimersByTime(1000);

      await expect(promise).resolves.toBe("success");
    });

    it("rejects with SupabaseTimeoutError if the operation takes longer than the timeout", async () => {
      // Default timeout is 3500ms
      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("success"), 4000);
      });

      const promise = withSupabaseRevalidationTimeout(operation, "testOp");

      vi.advanceTimersByTime(3500);

      await expect(promise).rejects.toThrow(SupabaseTimeoutError);
      await expect(promise).rejects.toThrow("testOp timed out after 3500ms");
    });

    it("respects the SUPABASE_REVALIDATION_TIMEOUT_MS environment variable", async () => {
      process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = "5000";

      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("success"), 4000); // 4000ms < 5000ms, should succeed
      });

      const promise = withSupabaseRevalidationTimeout(operation, "testOp");

      vi.advanceTimersByTime(4000);

      await expect(promise).resolves.toBe("success");

      const slowOperation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("success"), 6000);
      });

      const slowPromise = withSupabaseRevalidationTimeout(slowOperation, "testOp");

      vi.advanceTimersByTime(5000);

      await expect(slowPromise).rejects.toThrow(SupabaseTimeoutError);
      await expect(slowPromise).rejects.toThrow("testOp timed out after 5000ms");
    });

    it("falls back to default if SUPABASE_REVALIDATION_TIMEOUT_MS is invalid", async () => {
      process.env.SUPABASE_REVALIDATION_TIMEOUT_MS = "invalid";

      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("success"), 4000);
      });

      const promise = withSupabaseRevalidationTimeout(operation, "testOp");

      vi.advanceTimersByTime(3500); // Should timeout at 3500ms

      await expect(promise).rejects.toThrow(SupabaseTimeoutError);
      await expect(promise).rejects.toThrow("testOp timed out after 3500ms");
    });
  });
});

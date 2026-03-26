import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to mock the @sentry/nextjs module
vi.mock("@sentry/nextjs", () => {
  return {
    captureRequestError: vi.fn(),
  };
});

describe("instrumentation.ts", () => {
  const originalEnv = process.env;
  let instrumentation: typeof import("../instrumentation");
  let Sentry: typeof import("@sentry/nextjs");

  beforeEach(async () => {
    // Reset process.env and module registry before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    Sentry = await import("@sentry/nextjs");
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("when SHOULD_INIT_SENTRY is true (production)", () => {
    beforeEach(async () => {
      process.env.NODE_ENV = "production";
      process.env.SENTRY_ENABLE_IN_DEV = "0";
      // Dynamically import instrumentation to evaluate SHOULD_INIT_SENTRY
      instrumentation = await import("../instrumentation");
    });

    it("onRequestError should call Sentry.captureRequestError", () => {
      const error = new Error("Test error");
      const request = { url: "http://localhost:3000" } as any;
      const response = { statusCode: 500 } as any;

      instrumentation.onRequestError(error, request, response);

      expect(Sentry.captureRequestError).toHaveBeenCalledTimes(1);
      expect(Sentry.captureRequestError).toHaveBeenCalledWith(error, request, response);
    });

    it("register should attempt to load nodejs config when runtime is nodejs", async () => {
      process.env.NEXT_RUNTIME = "nodejs";

      // We don't want to actually load the real config and fail,
      // but if we mock it, we can verify it doesn't throw.
      // In this specific test, we'll mock the config files so the dynamic import succeeds
      vi.mock("../sentry.server.config", () => ({}));

      await expect(instrumentation.register()).resolves.not.toThrow();
    });

    it("register should attempt to load edge config when runtime is edge", async () => {
      process.env.NEXT_RUNTIME = "edge";

      vi.mock("../sentry.edge.config", () => ({}));

      await expect(instrumentation.register()).resolves.not.toThrow();
    });
  });

  describe("when SHOULD_INIT_SENTRY is true (dev with flag)", () => {
    beforeEach(async () => {
      process.env.NODE_ENV = "development";
      process.env.SENTRY_ENABLE_IN_DEV = "1";
      instrumentation = await import("../instrumentation");
    });

    it("onRequestError should call Sentry.captureRequestError", () => {
      const error = new Error("Test error");
      const request = { url: "http://localhost:3000" } as any;
      const response = { statusCode: 500 } as any;

      instrumentation.onRequestError(error, request, response);

      expect(Sentry.captureRequestError).toHaveBeenCalledTimes(1);
    });

    it("register should attempt to load nodejs config when runtime is nodejs", async () => {
      process.env.NEXT_RUNTIME = "nodejs";
      vi.mock("../sentry.server.config", () => ({}));
      await expect(instrumentation.register()).resolves.not.toThrow();
    });
  });

  describe("when SHOULD_INIT_SENTRY is false (development)", () => {
    beforeEach(async () => {
      process.env.NODE_ENV = "development";
      process.env.SENTRY_ENABLE_IN_DEV = "0";
      instrumentation = await import("../instrumentation");
    });

    it("onRequestError should not call Sentry.captureRequestError", () => {
      const error = new Error("Test error");
      const request = { url: "http://localhost:3000" } as any;
      const response = { statusCode: 500 } as any;

      instrumentation.onRequestError(error, request, response);

      expect(Sentry.captureRequestError).not.toHaveBeenCalled();
    });

    it("register should return early and not load configs", async () => {
      process.env.NEXT_RUNTIME = "nodejs";

      // If it tries to load an unmocked module that doesn't exist or throws, it would fail
      // but since SHOULD_INIT_SENTRY is false, it returns early.
      await expect(instrumentation.register()).resolves.toBeUndefined();
    });
  });
});

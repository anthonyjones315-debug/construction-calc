import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";

describe("proxy.ts", () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it("should return clerkMiddleware when clerk is ready", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      clerkMiddleware: vi.fn(() => "mocked-clerk-middleware"),
    }));

    vi.doMock("next/server", () => ({
      NextResponse: {
        next: vi.fn(() => "mocked-next-response"),
      },
    }));

    vi.doMock("@/lib/clerk/env", () => ({
      shouldUseClerkMiddleware: vi.fn(() => true),
    }));

    const proxy = await import("./proxy");
    expect(proxy.default).toBe("mocked-clerk-middleware");
  });

  it("should return clerkDisabledProxy when clerk is not ready and warn in development", async () => {
    process.env.NODE_ENV = "development";

    vi.doMock("@clerk/nextjs/server", () => ({
      clerkMiddleware: vi.fn(),
    }));

    vi.doMock("next/server", () => ({
      NextResponse: {
        next: vi.fn(() => "mocked-next-response"),
      },
    }));

    vi.doMock("@/lib/clerk/env", () => ({
      shouldUseClerkMiddleware: vi.fn(() => false),
    }));

    const proxy = await import("./proxy");
    expect(typeof proxy.default).toBe("function");
    expect(proxy.default.name).toBe("clerkDisabledProxy");

    const result = await proxy.default();
    expect(result).toBe("mocked-next-response");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Clerk] API keys missing or invalid.")
    );
  });

  it("should return clerkDisabledProxy when clerk is not ready and not warn in production", async () => {
    process.env.NODE_ENV = "production";

    vi.doMock("@clerk/nextjs/server", () => ({
      clerkMiddleware: vi.fn(),
    }));

    vi.doMock("next/server", () => ({
      NextResponse: {
        next: vi.fn(() => "mocked-next-response"),
      },
    }));

    vi.doMock("@/lib/clerk/env", () => ({
      shouldUseClerkMiddleware: vi.fn(() => false),
    }));

    const proxy = await import("./proxy");
    expect(typeof proxy.default).toBe("function");
    expect(proxy.default.name).toBe("clerkDisabledProxy");

    const result = await proxy.default();
    expect(result).toBe("mocked-next-response");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should export the correct config matcher", async () => {
    const proxy = await import("./proxy");
    expect(proxy.config).toBeDefined();
    expect(proxy.config.matcher).toEqual([
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
    ]);
  });
});

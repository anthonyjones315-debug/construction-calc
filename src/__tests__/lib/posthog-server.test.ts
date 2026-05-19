import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPostHogClient } from "@/lib/posthog-server";
import { PostHog } from "posthog-node";

// Mock posthog-node so we can assert on constructor arguments without making real HTTP requests
vi.mock("posthog-node", () => {
  return {
    PostHog: vi.fn().mockImplementation((token, options) => {
      return {
        __mockToken: token,
        __mockOptions: options,
        shutdown: vi.fn(),
      };
    }),
  };
});

describe("getPostHogClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws an error when no token is provided", () => {
    expect(() => getPostHogClient()).toThrow(
      "PostHog token missing (set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)."
    );
  });

  it("uses NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN when provided", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "test_project_token");

    const client = getPostHogClient() as any;

    expect(PostHog).toHaveBeenCalledTimes(1);
    expect(client.__mockToken).toBe("test_project_token");
    expect(client.__mockOptions).toMatchObject({
      host: "https://us.i.posthog.com", // Default host
      flushAt: 1,
      flushInterval: 0,
    });
  });

  it("falls back to NEXT_PUBLIC_POSTHOG_KEY when PROJECT_TOKEN is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "test_fallback_key");

    const client = getPostHogClient() as any;

    expect(PostHog).toHaveBeenCalledTimes(1);
    expect(client.__mockToken).toBe("test_fallback_key");
  });

  it("prioritizes NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN over NEXT_PUBLIC_POSTHOG_KEY", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "primary_token");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "fallback_token");

    const client = getPostHogClient() as any;

    expect(PostHog).toHaveBeenCalledTimes(1);
    expect(client.__mockToken).toBe("primary_token");
  });

  it("uses custom host when NEXT_PUBLIC_POSTHOG_HOST is set", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "test_token");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://custom.posthog.com");

    const client = getPostHogClient() as any;

    expect(client.__mockOptions).toMatchObject({
      host: "https://custom.posthog.com",
    });
  });
});

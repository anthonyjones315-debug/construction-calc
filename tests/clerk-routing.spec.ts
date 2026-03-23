import { afterEach, describe, expect, it } from "vitest";
import {
  buildClerkAuthHref,
  getClerkFallbackRedirectFromEnv,
  getClerkRouteFromEnv,
} from "@/lib/clerk/routing";

const ENV_KEYS = [
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
] as const;

const ORIGINAL_ENV = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = ORIGINAL_ENV[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("buildClerkAuthHref", () => {
  it("omits the callback when the default redirect is used", () => {
    expect(buildClerkAuthHref("sign-in", "/command-center")).toBe("/sign-in");
    expect(buildClerkAuthHref("sign-up", "/settings#business-profile")).toBe(
      "/sign-up",
    );
  });

  it("keeps safe in-app redirects", () => {
    expect(buildClerkAuthHref("sign-in", "/saved?tab=recent")).toBe(
      "/sign-in?callbackUrl=%2Fsaved%3Ftab%3Drecent",
    );
  });

  it("drops unsafe redirect targets", () => {
    expect(buildClerkAuthHref("sign-in", "https://evil.example")).toBe(
      "/sign-in",
    );
  });
});

describe("Clerk env route helpers", () => {
  it("uses safe explicit auth routes from env", () => {
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/auth/login";

    expect(getClerkRouteFromEnv("sign-in")).toBe("/auth/login");
  });

  it("falls back to app defaults when env routes are unsafe", () => {
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = "https://evil.example";

    expect(getClerkRouteFromEnv("sign-up")).toBe("/sign-up");
  });

  it("supports legacy after-sign-in envs as redirect defaults", () => {
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/saved";

    expect(getClerkFallbackRedirectFromEnv("sign-in")).toBe("/saved");
  });
});

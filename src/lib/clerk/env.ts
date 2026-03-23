import { isPublishableKey } from "@clerk/shared/keys";

function getPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ??
    process.env.CLERK_PUBLISHABLE_KEY?.trim() ??
    ""
  );
}

function getSecretKey(): string {
  return process.env.CLERK_SECRET_KEY?.trim() ?? "";
}

function getKeyMode(
  value: string,
  prefixes: readonly [testPrefix: string, livePrefix: string],
): "test" | "live" | null {
  if (value.startsWith(prefixes[0])) return "test";
  if (value.startsWith(prefixes[1])) return "live";
  return null;
}

export function shouldEnableClerkClient(): boolean {
  const pk = getPublishableKey();
  const sk = getSecretKey();

  if (!pk) {
    return process.env.NODE_ENV === "development" && !sk;
  }

  return isPublishableKey(pk);
}

/**
 * Returns true when Clerk middleware should run:
 * - **Keyless (development only)**: both publishable and secret env vars are unset/empty.
 * - **Explicit**: both are set and use valid prefixes for the same mode (test vs live).
 *
 * Returns false for partial env (only one set) or invalid strings so we can avoid
 * throwing inside `clerkMiddleware` (which causes 500s and broken `_next` assets).
 */
export function shouldUseClerkMiddleware(): boolean {
  // Removed hardcoded dev-bypass so Clerk can protect routes properly

  const pk = getPublishableKey();
  const sk = getSecretKey();

  const keyless = !pk && !sk;
  if (keyless) return process.env.NODE_ENV === "development";

  const pkMode = getKeyMode(pk, ["pk_test_", "pk_live_"]);
  const skMode = getKeyMode(sk, ["sk_test_", "sk_live_"]);

  return !!pkMode && !!skMode && pkMode === skMode;
}

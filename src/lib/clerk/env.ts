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

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  const sk = process.env.CLERK_SECRET_KEY?.trim() ?? "";

  const keyless = !pk && !sk;
  if (keyless) return process.env.NODE_ENV === "development";

  const pkMode = pk.startsWith("pk_test_")
    ? "test"
    : pk.startsWith("pk_live_")
      ? "live"
      : null;
  const skMode = sk.startsWith("sk_test_")
    ? "test"
    : sk.startsWith("sk_live_")
      ? "live"
      : null;

  return !!pkMode && !!skMode && pkMode === skMode;
}

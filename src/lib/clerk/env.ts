/**
 * Returns true when Clerk middleware should run:
 * - **Keyless**: both publishable and secret env vars are unset/empty (Clerk dev keyless).
 * - **Explicit**: both are set and use valid prefixes for the same mode (test vs live).
 *
 * Returns false for partial env (only one set) or invalid strings so we can avoid
 * throwing inside `clerkMiddleware` (which causes 500s and broken `_next` assets).
 */
export function shouldUseClerkMiddleware(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  const sk = process.env.CLERK_SECRET_KEY?.trim() ?? "";

  const keyless = !pk && !sk;
  if (keyless) return true;

  const pkValid = pk.startsWith("pk_test_") || pk.startsWith("pk_live_");
  const skValid = sk.startsWith("sk_test_") || sk.startsWith("sk_live_");

  return pkValid && skValid && !!pk && !!sk;
}

import { isPublishableKey } from "@clerk/shared/keys";

/**
 * Publishable key for `ClerkProvider` (trimmed, validated like Clerk’s own parser).
 * Returns `undefined` when unset, keyless, or invalid — invalid values must be
 * removed from `.env.local` because Next.js still inlines `NEXT_PUBLIC_*` for
 * client bundles that read `process.env` directly.
 *
 * A key that only matches the `pk_*` prefix but fails decoding (truncated,
 * wrong paste) makes Clerk build `https:///npm/@clerk/clerk-js/...` and breaks
 * CSP + script load — `isPublishableKey` catches that.
 */
export function getClerkPublishableKey(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.CLERK_PUBLISHABLE_KEY;

  if (raw == null) return undefined;

  const trimmed = raw.trim();
  if (trimmed === "") return undefined;

  const isDevelopment = process.env.NODE_ENV === "development";

  if (!trimmed.startsWith("pk_test_") && !trimmed.startsWith("pk_live_")) {
    if (isDevelopment) {
      console.warn(
        "[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with pk_test_ or pk_live_. Fix or remove it in .env.local (see src/lib/supabase/CLERK_SETUP.md).",
      );
      return undefined;
    }

    return trimmed;
  }

  if (!isPublishableKey(trimmed)) {
    if (isDevelopment) {
      console.warn(
        "[Clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not a valid Clerk key (copy the full key from Dashboard → API keys). Remove or fix it — see src/lib/supabase/CLERK_SETUP.md.",
      );
      return undefined;
    }

    return trimmed;
  }

  return trimmed;
}

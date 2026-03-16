import { PostHog } from "posthog-node";

/** Server-side PostHog client for API routes and server actions. Use NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST. Always call await posthog.shutdown() when done. */
export function getPostHogClient() {
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!token) {
    throw new Error("PostHog token missing (set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN).");
  }

  return new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
}

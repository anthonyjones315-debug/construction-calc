import { PostHog } from "posthog-node";

/** Server-side PostHog client for API routes and server actions. Use NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST. Always call await posthog.shutdown() when done. */
export function getPostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

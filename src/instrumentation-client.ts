import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export { posthog };

// Initialize PostHog (Next.js 15.3+ instrumentation — see https://posthog.com/docs/libraries/next-js)
if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
  });
  if (typeof window !== "undefined") {
    (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  }
} else {
  console.warn("PostHog not initialized - missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST");
}

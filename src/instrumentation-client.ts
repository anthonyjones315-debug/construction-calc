import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export { posthog };

// Initialize PostHog (Next.js 15.3+ instrumentation — see https://posthog.com/docs/libraries/next-js)
const globalAny = globalThis as typeof globalThis & { __POSTHOG_INITTED?: boolean };

if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST &&
  !globalAny.__POSTHOG_INITTED
) {
  const alreadyWindowInited =
    typeof window !== "undefined" &&
    (window as unknown as { __PH_INIT?: boolean }).__PH_INIT;
  if (!alreadyWindowInited) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-01-30",
    });
    globalAny.__POSTHOG_INITTED = true;
    if (typeof window !== "undefined") {
      (window as unknown as { posthog: typeof posthog }).posthog = posthog;
      (window as unknown as { __PH_INIT?: boolean }).__PH_INIT = true;
    }
  }
}

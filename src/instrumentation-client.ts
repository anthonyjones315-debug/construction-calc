import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
export { posthog };

// Disable PostHog auto-init here; CSPostHogProvider handles client init once.

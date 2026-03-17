"use client";

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// PostHog client setup lives in CSPostHogProvider so the browser only inits it once.
export { posthog };

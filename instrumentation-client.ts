"use client";

import posthog from "posthog-js";

const token =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== "undefined" && token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    capture_pageview: false,
    autocapture: true,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
} else {
  // eslint-disable-next-line no-console
  console.warn("PostHog not initialized - missing token or running on server.");
}

export { posthog };

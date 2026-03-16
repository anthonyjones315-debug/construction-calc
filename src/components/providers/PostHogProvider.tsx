"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

const globalAny = globalThis as typeof globalThis & { __POSTHOG_INITTED?: boolean };
let posthogInitialized = typeof globalAny.__POSTHOG_INITTED === "boolean"
  ? globalAny.__POSTHOG_INITTED
  : false;

export function CSPostHogProvider({ children }: Props) {
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";

  useEffect(() => {
    if (!token) return;
    if (posthogInitialized) return;
    if (typeof window === "undefined") return;

    posthog.init(token, {
      api_host: host,
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      autocapture: true,
      disable_session_recording: false,
      persistence: "localStorage",
    });
    posthogInitialized = true;
    globalAny.__POSTHOG_INITTED = true;
  }, [host, token]);

  if (!token) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

let posthogInitialized = false;

export function CSPostHogProvider({ children }: Props) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  useEffect(() => {
    if (!token) return;
    if (posthogInitialized) return;
    if (typeof window === "undefined") return;

    posthog.init(token, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
    posthogInitialized = true;
  }, [host, token]);

  if (!token) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}


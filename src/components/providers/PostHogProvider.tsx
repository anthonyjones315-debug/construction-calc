"use client";

import { usePathname } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

let posthogInitialized = false;

function isPostHogLoaded() {
  return Boolean((posthog as typeof posthog & { __loaded?: boolean }).__loaded);
}

export function CSPostHogProvider({ children }: Props) {
  const pathname = usePathname();
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!token) return;
    if (typeof window === "undefined") return;
    if (isHomePage) return;
    if (
      posthogInitialized ||
      isPostHogLoaded() ||
      (window as unknown as { __PH_INIT?: boolean }).__PH_INIT
    ) {
      posthogInitialized = true;
      (window as unknown as { __PH_INIT?: boolean }).__PH_INIT = true;
      return;
    }

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
    (window as unknown as { __PH_INIT?: boolean }).__PH_INIT = true;
  }, [host, isHomePage, token]);

  if (!token || isHomePage) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

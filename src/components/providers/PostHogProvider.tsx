"use client";

import { usePathname } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ReactNode, useEffect, useState } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasConsentFor,
} from "@/lib/privacy/consent";

type Props = {
  children: ReactNode;
};

let posthogInitialized = false;

function isPostHogLoaded() {
  return Boolean((posthog as typeof posthog & { __loaded?: boolean }).__loaded);
}

type PostHogWindowFlags = {
  __PH_INIT?: boolean;
  __PH_INIT_STARTED?: boolean;
};

export function CSPostHogProvider({ children }: Props) {
  const pathname = usePathname();
  const [canTrack, setCanTrack] = useState<boolean>(() =>
    hasConsentFor("analytics"),
  );
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  // Always use the first-party ingest proxy in the browser so preview deployments
  // don't trip CSP on direct PostHog asset/config/event calls.
  const host = "/ingest";
  const isHomePage = pathname === "/";

  useEffect(() => {
    function handleConsentChange() {
      setCanTrack(hasConsentFor("analytics"));
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    if (typeof window === "undefined") return;
    if (!canTrack) {
      if (isPostHogLoaded()) {
        posthog.opt_out_capturing?.();
      }
      return;
    }
    if (isHomePage) return;
    const flags = window as typeof window & PostHogWindowFlags;

    if (
      posthogInitialized ||
      isPostHogLoaded() ||
      flags.__PH_INIT ||
      flags.__PH_INIT_STARTED
    ) {
      return;
    }

    // Mark initialization before calling posthog.init so React re-renders or
    // provider re-mounts cannot race into a second init attempt.
    flags.__PH_INIT_STARTED = true;
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
    flags.__PH_INIT = true;
  }, [canTrack, host, isHomePage, token]);

  if (!token || isHomePage || !canTrack) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

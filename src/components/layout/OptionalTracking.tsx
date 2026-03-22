"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@/components/layout/Analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readConsentState,
  type TermlyConsentState,
} from "@/lib/privacy/consent";

export function OptionalTracking() {
  const [consentState, setConsentState] = useState<TermlyConsentState | null>(() =>
    readConsentState(),
  );

  useEffect(() => {
    function handleConsentChange() {
      setConsentState(readConsentState());
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    };
  }, []);

  const canLoadAnalytics = consentState?.analytics === true;

  if (!canLoadAnalytics) return null;

  return <Analytics />;
}

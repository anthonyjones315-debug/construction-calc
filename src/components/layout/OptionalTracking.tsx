"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@/components/layout/Analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readConsentState,
  type TermlyConsentState,
} from "@/lib/privacy/consent";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;
const ENABLE_ADSENSE = process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true";

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
  const canLoadAdvertising = consentState?.advertising === true;
  const shouldLoadAdsense = ENABLE_ADSENSE && Boolean(ADSENSE_ID);
  const shouldLoadAdvertising = canLoadAdvertising && shouldLoadAdsense;

  if (!canLoadAnalytics && !shouldLoadAdvertising) return null;

  return (
    <>
      {shouldLoadAdvertising ? (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
        ></script>
      ) : null}
      {canLoadAnalytics ? <Analytics /> : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@/components/layout/Analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
  readCookieConsent,
} from "@/lib/privacy/consent";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;
const ENABLE_ADSENSE = process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true";

export function OptionalTracking() {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() =>
    readCookieConsent(),
  );

  useEffect(() => {
    function handleConsentChange(event: Event) {
      const detail = (event as CustomEvent<CookieConsentChoice>).detail;
      setChoice(detail ?? readCookieConsent());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
        setChoice(readCookieConsent());
      }
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChange,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (choice !== "accepted") return null;

  const shouldLoadAdsense = ENABLE_ADSENSE && Boolean(ADSENSE_ID);

  return (
    <>
      {shouldLoadAdsense ? (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
        ></script>
      ) : null}
      <Analytics />
    </>
  );
}

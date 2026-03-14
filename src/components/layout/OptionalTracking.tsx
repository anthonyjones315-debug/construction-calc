"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@/components/layout/Analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
  readCookieConsent,
} from "@/lib/privacy/consent";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

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

  return (
    <>
      {ADSENSE_ID && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      )}
      <Analytics />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
} from "@/lib/privacy/consent";
import { ShieldCheck, ShieldX } from "lucide-react";

export function ConsentSettings() {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateId = window.requestAnimationFrame(() => {
      setChoice(readCookieConsent());
      setHydrated(true);
    });

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
      window.cancelAnimationFrame(hydrateId);
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChange,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function updateConsent(next: CookieConsentChoice) {
    writeCookieConsent(next);
    setChoice(next);
  }

  if (!hydrated) return null;

  return (
    <section className="content-card mx-auto mt-8 max-w-2xl p-6">
      <div className="mb-3">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Privacy & Consent
        </h2>
        <p className="text-sm text-[--color-ink-dim]">
          Control optional analytics, ad measurement, and personalization cookies. Core security cookies always stay on.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
        <div>
          <p className="text-sm font-semibold text-[--color-ink]">
            Optional cookies are {choice === "accepted" ? "enabled" : "disabled"}.
          </p>
          <p className="text-xs text-[--color-ink-dim]">
            You can change this anytime. Changes apply to future page loads.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateConsent("rejected")}
            className="flex items-center gap-1 rounded-lg border border-[--color-border] px-3 py-2 text-sm font-semibold text-[--color-ink] hover:border-[--color-orange-brand]"
          >
            <ShieldX className="h-4 w-4" aria-hidden />
            Reject
          </button>
          <button
            type="button"
            onClick={() => updateConsent("accepted")}
            className="flex items-center gap-1 rounded-lg bg-[--color-orange-brand] px-3 py-2 text-sm font-semibold text-white hover:bg-[--color-orange-dark]"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}

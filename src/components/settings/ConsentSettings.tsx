"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readConsentState,
  type TermlyConsentState,
} from "@/lib/privacy/consent";
import { ShieldCheck } from "lucide-react";

export function ConsentSettings() {
  const [consentState, setConsentState] = useState<TermlyConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateId = window.setTimeout(() => {
      setConsentState(readConsentState());
      setHydrated(true);
    }, 0);

    function handleConsentChange() {
      setConsentState(readConsentState());
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.clearTimeout(hydrateId);
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    };
  }, []);

  if (!hydrated) return null;

  const categories = [
    { key: "essential", label: "Essential", enabled: consentState?.essential === true },
    { key: "performance", label: "Performance", enabled: consentState?.performance === true },
    { key: "analytics", label: "Analytics", enabled: consentState?.analytics === true },
    { key: "advertising", label: "Advertising", enabled: consentState?.advertising === true },
    {
      key: "social_networking",
      label: "Social",
      enabled: consentState?.social_networking === true,
    },
  ] as const;

  return (
    <section className="content-card mx-auto mt-8 max-w-2xl p-6">
      <div className="mb-3">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[--color-ink-dim]">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Privacy & Consent
        </h2>
        <p className="text-sm text-[--color-ink-dim]">
          Termly controls cookie preferences for the whole site. Use the preferences center below to update consent in one place.
        </p>
      </div>

      <div className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <div
              key={category.key}
              className="rounded-lg border border-[--color-border] px-3 py-2"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-ink-dim]">
                {category.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-[--color-ink]">
                {category.enabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="#"
            className="termly-display-preferences inline-flex items-center gap-1 rounded-lg bg-[--color-blue-brand] px-3 py-2 text-sm font-semibold text-white hover:bg-[--color-blue-dark]"
          >
            Open Termly Preferences
          </a>
          <p className="text-xs text-[--color-ink-dim]">
            Changes apply through Termly across analytics, ads, and personalization features.
          </p>
        </div>
      </div>
    </section>
  );
}

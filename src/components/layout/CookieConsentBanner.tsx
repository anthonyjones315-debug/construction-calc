"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  type CookieConsentChoice,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/privacy/consent";

export function CookieConsentBanner() {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() =>
    readCookieConsent(),
  );
  const [visible, setVisible] = useState(() => readCookieConsent() === null);

  useEffect(() => {
    function openPreferences() {
      setVisible(true);
    }

    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
    return () => {
      window.removeEventListener(
        COOKIE_PREFERENCES_OPEN_EVENT,
        openPreferences,
      );
    };
  }, []);

  function handleChoice(nextChoice: CookieConsentChoice) {
    writeCookieConsent(nextChoice);
    setChoice(nextChoice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-[--color-surface] p-5 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[--color-orange-brand]">
              Cookie Preferences
            </p>
            <p className="mt-2 text-sm font-semibold text-[--color-ink]">
              Necessary cookies stay on so sign-in and security keep working.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[--color-ink-dim]">
              Optional analytics, ad measurement, AdSense, and affiliate
              tracking cookies load only if you accept them. You can reject
              optional cookies and still use the calculators.
            </p>
            {choice && (
              <p className="mt-2 text-xs text-[--color-ink-dim]">
                Current setting: optional cookies are{" "}
                {choice === "accepted" ? "enabled" : "disabled"}.
              </p>
            )}
            <p className="mt-2 text-xs text-[--color-ink-dim]">
              See our{" "}
              <Link
                href="/privacy"
                className="font-medium text-[--color-orange-brand] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="font-medium text-[--color-orange-brand] hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleChoice("rejected")}
              className="min-h-[44px] rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-[--color-ink] transition-colors hover:bg-[--color-surface-alt]"
            >
              Reject Optional Cookies
            </button>
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="min-h-[44px] rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[--color-orange-dark]"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

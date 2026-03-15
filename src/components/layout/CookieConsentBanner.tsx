"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_PREFERENCES_OPEN_EVENT,
  type CookieConsentChoice,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/privacy/consent";
import { routes } from "@routes";

export function CookieConsentBanner() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() =>
    readCookieConsent(),
  );
  const [isOpen, setIsOpen] = useState(() => readCookieConsent() === null);

  function hasGlobalPrivacyControlEnabled(): boolean {
    if (typeof navigator === "undefined") return false;
    const gpcWindow =
      typeof window !== "undefined"
        ? (window as Window & { doNotTrack?: string | null })
        : null;

    const gpcNavigator = navigator as Navigator & {
      globalPrivacyControl?: boolean;
      msDoNotTrack?: string | null;
    };

    const doNotTrackSignals = [
      navigator.doNotTrack,
      gpcNavigator.msDoNotTrack,
      gpcWindow?.doNotTrack ?? null,
    ];

    return (
      gpcNavigator.globalPrivacyControl === true ||
      doNotTrackSignals.some((signal) => signal === "1" || signal === "yes")
    );
  }

  useEffect(() => {
    const nextChoice = readCookieConsent();
    const shouldAutoRejectForGpc =
      nextChoice === null && hasGlobalPrivacyControlEnabled();
    const effectiveChoice: CookieConsentChoice | null = shouldAutoRejectForGpc
      ? "rejected"
      : nextChoice;

    if (shouldAutoRejectForGpc) {
      writeCookieConsent("rejected");
    }

    const hydrateId = window.requestAnimationFrame(() => {
      setChoice(effectiveChoice);
      setIsOpen(effectiveChoice === null);
      setIsHydrated(true);
    });

    function openPreferences() {
      setIsOpen(true);
    }

    function handleConsentChange() {
      const nextChoice = readCookieConsent();
      setChoice(nextChoice);
      setIsOpen(nextChoice === null);
    }

    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.cancelAnimationFrame(hydrateId);
      window.removeEventListener(
        COOKIE_PREFERENCES_OPEN_EVENT,
        openPreferences,
      );
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChange,
      );
    };
  }, []);

  function handleChoice(nextChoice: CookieConsentChoice) {
    setChoice(nextChoice);
    setIsOpen(false);
    writeCookieConsent(nextChoice);
  }

  function handleClose() {
    handleChoice("rejected");
  }

  if (!isHydrated || !isOpen) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] left-auto max-w-md">
      <div className="pointer-events-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)] transition-colors">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
              Cookie Preferences
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              Necessary cookies stay on so sign-in and security keep working.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Optional analytics, ad measurement, AdSense, and affiliate
              tracking cookies load only if you accept them. You can reject
              optional cookies and still use the calculators.
            </p>
            {choice && (
              <p className="mt-2 text-xs text-slate-500">
                Current setting: optional cookies are{" "}
                {choice === "accepted" ? "enabled" : "disabled"}.
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              See our{" "}
              <Link
                href={routes.privacy}
                className="font-medium text-[--color-orange-brand] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href={routes.terms}
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
              className="btn-tactile min-h-11 cursor-pointer rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
            >
              Reject Optional Cookies
            </button>
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="btn-tactile min-h-11 cursor-pointer rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[--color-orange-dark] active:scale-[0.98]"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

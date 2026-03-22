"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  X,
  BookOpenCheck,
  LayoutDashboard,
  FileText,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { routes } from "@routes";
import { GlassFeatureItem } from "@/components/ui/glass-elements";

const STORAGE_KEY = "pcc_welcome_guide_dismissed_v1";
const SESSION_KEY = "pcc_welcome_guide_seen_v1";

type WelcomeGuidePopupProps = {
  forceOpen?: boolean;
};

export function WelcomeGuidePopup({
  forceOpen = false,
}: WelcomeGuidePopupProps) {
  const [show, setShow] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const persistDismissal = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
      if (dontShowAgain) {
        localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      /* ignore storage failures */
    }
  }, [dontShowAgain]);

  const dismiss = useCallback(() => {
    setShow(false);
    persistDismissal();
  }, [persistDismissal]);

  useEffect(() => {
    try {
      const permanentlyDismissed = localStorage.getItem(STORAGE_KEY) === "1";
      const seenThisSession = sessionStorage.getItem(SESSION_KEY) === "1";

      if (permanentlyDismissed) return;

      if (forceOpen) {
        const forcedTimer = window.setTimeout(() => setShow(true), 0);
        return () => window.clearTimeout(forcedTimer);
      }

      if (seenThisSession) return;

      const timer = window.setTimeout(() => setShow(true), 900);
      return () => window.clearTimeout(timer);
    } catch {
      if (forceOpen) {
        const fallbackTimer = window.setTimeout(() => setShow(true), 0);
        return () => window.clearTimeout(fallbackTimer);
      }
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!show) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss, show]);

  if (!show) return null;

  const features = [
    { icon: LayoutDashboard, label: "Command Center setup and first-run workflow" },
    { icon: Receipt, label: "Estimate math, pricing, and audit checks" },
    { icon: FileText, label: "Client-ready PDF handoff and saved jobs" },
    { icon: ShieldCheck, label: "Best practices for secure account recovery" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30"
        onClick={dismiss}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-guide-title"
        className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 px-[env(safe-area-inset-left,0px)] py-[env(safe-area-inset-top,0px)] sm:w-[calc(100%-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_50px_rgba(0,0,0,0.15)] sm:p-6">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close welcome guide"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="relative mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-orange-soft] text-orange-brand">
              <BookOpenCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-brand">
                Welcome
              </p>
              <h2
                id="welcome-guide-title"
                className="text-lg font-display font-bold text-slate-900"
              >
                Your guide is ready
              </h2>
            </div>
          </div>

          <p className="relative mb-4 text-sm leading-relaxed text-slate-500">
            Start with the welcome guide to learn the fastest path through your
            Command Center, saved estimates, PDF exports, and field-ready
            workflows.
          </p>

          <div className="relative mb-5 grid gap-2">
            {[
              {
                icon: LayoutDashboard,
                label: "Command Center: estimates, team, and price book in one place",
              },
              {
                icon: Receipt,
                label: "Estimate math, pricing, and tax audit for tri-county work",
              },
              {
                icon: FileText,
                label: "Client-ready PDF export and saved estimate management",
              },
              {
                icon: ShieldCheck,
                label: "Oneida County tax rates and ST-124 capital improvement rules",
              },
            ].map(({ icon: Icon, label }) => (
              <GlassFeatureItem key={label}>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span>{label}</span>
              </GlassFeatureItem>
            ))}
          </div>

          <label className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-brand focus:ring-[--color-orange-brand]/30"
            />
            Don&apos;t show this popup again
          </label>

          <div className="mt-3 flex flex-col gap-2 pb-[env(safe-area-inset-bottom,0px)]">
            <Link
              href={routes.guide}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-orange-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[--color-orange-dark]"
              onClick={dismiss}
            >
              Open Welcome Guide
            </Link>
            <Link
              href={routes.commandCenter}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              onClick={dismiss}
            >
              Go to Command Center
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl text-xs text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              Close for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

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
import {
  GlassDialogFrame,
  GlassFeatureItem,
  GlassIconBadge,
} from "./glass-elements";

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

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
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
        <GlassDialogFrame className="max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto p-5 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)] sm:p-6">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
            aria-label="Close welcome guide"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="relative mb-4 flex items-center gap-3">
            <GlassIconBadge>
              <BookOpenCheck
                className="h-5 w-5"
                aria-hidden
              />
            </GlassIconBadge>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                Welcome
              </p>
              <h2
                id="welcome-guide-title"
                className="text-lg font-display font-bold text-white"
              >
                Your guide is ready
              </h2>
            </div>
          </div>

          <p className="relative mb-4 text-sm leading-relaxed text-slate-400">
            Start with the welcome guide to learn the fastest path through your
            Command Center, saved estimates, PDF exports, and field-ready
            workflows.
          </p>

          <div className="relative mb-5 grid gap-2">
            {[
              {
                icon: LayoutDashboard,
                label: "Command Center setup and first-run workflow",
              },
              {
                icon: Receipt,
                label: "Estimate math, pricing, and audit checks",
              },
              {
                icon: FileText,
                label: "Client-ready PDF handoff and saved jobs",
              },
              {
                icon: ShieldCheck,
                label: "Best practices for secure account recovery",
              },
            ].map(({ icon: Icon, label }) => (
              <GlassFeatureItem key={label}>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span>{label}</span>
              </GlassFeatureItem>
            ))}
          </div>

          <label className="mb-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-orange-500 focus:ring-orange-500"
            />
            Don&apos;t show this popup again
          </label>

          <div className="mt-3 flex flex-col gap-2 pb-[env(safe-area-inset-bottom,0px)]">
            <Link
              href={routes.guide}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[--color-orange-dark]"
              onClick={dismiss}
            >
              Open Welcome Guide
            </Link>
            <Link
              href={routes.commandCenter}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
              onClick={dismiss}
            >
              Go to Command Center
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl text-xs text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
            >
              Close for now
            </button>
          </div>
        </GlassDialogFrame>
      </div>
    </>
  );
}

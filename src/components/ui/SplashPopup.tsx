"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  X,
  BookOpenCheck,
  Receipt,
  FileText,
  Activity,
  Smartphone,
} from "lucide-react";
import { routes } from "@routes";

const STORAGE_KEY = "operators_manual_splash_v1";

export function SplashPopup() {
  const [show, setShow] = useState(false);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ok */
    }
  }

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      /* private browsing */
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="splash-title"
        className="fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
        onClick={(event) => event.stopPropagation()}
        style={{ animation: "splashUp 0.25s ease forwards" }}
      >
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_top,rgba(247,148,29,0.08),transparent_42%)] before:content-['']">
          {/* Close */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          <div className="relative mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-orange-brand]/12">
              <BookOpenCheck
                className="w-5 h-5 text-[--color-orange-brand]"
                aria-hidden
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-500">
                Start Here
              </p>
              <h2
                id="splash-title"
                className="text-lg font-display font-bold text-white"
              >
                New how-to guides are live
              </h2>
            </div>
          </div>

          <p className="relative mb-4 text-sm leading-relaxed text-slate-400">
            Learn the exact workflows behind tax checks, estimate handoff, PDF
            exports, analytics verification, and field version control.
          </p>

          <div className="relative mb-5 grid gap-2">
            {[
              {
                icon: Receipt,
                label: "Cents-perfect audit checks",
              },
              {
                icon: FileText,
                label: "Estimate-to-invoice PDF workflow",
              },
              {
                icon: Activity,
                label: "PostHog ingest verification steps",
              },
              {
                icon: Smartphone,
                label: "Latest-version device refresh routine",
              },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-slate-300"
              >
                <Icon className="h-4 w-4 text-[--color-orange-brand]" aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Link
              href={routes.guide}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[--color-orange-dark] cursor-pointer"
              onClick={dismiss}
            >
              Open How-To Guide
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl text-xs text-slate-400 transition-colors hover:bg-white/6 hover:text-white cursor-pointer"
            >
              Skip and open calculators
            </button>
            <Link
              href={routes.fieldNotes}
              className="min-h-[44px] w-full flex items-center justify-center rounded-xl text-xs text-[--color-orange-brand] transition-colors hover:bg-white/6 cursor-pointer"
              onClick={dismiss}
            >
              Browse Field Notes →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

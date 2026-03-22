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
import {
  GlassButton,
  GlassDialogFrame,
  GlassFeatureItem,
  GlassIconBadge,
} from "./glass-elements";

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
        className="fixed inset-0 z-50 bg-black/30"
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
        <GlassDialogFrame className="p-6 text-[--color-ink] shadow-[0_24px_50px_rgba(0,0,0,0.12)]">
          {/* Close */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[--color-ink-dim] transition-colors hover:bg-[--color-surface-alt] hover:text-[--color-ink]"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          <div className="relative mb-4 flex items-center gap-3">
            <GlassIconBadge>
              <BookOpenCheck
                className="w-5 h-5"
                aria-hidden
              />
            </GlassIconBadge>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                Start Here
              </p>
              <h2
                id="splash-title"
                className="text-lg font-display font-bold text-[--color-ink]"
              >
                New how-to guides are live
              </h2>
            </div>
          </div>

          <p className="relative mb-4 text-sm leading-relaxed text-[--color-ink-mid]">
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
              <GlassFeatureItem key={label}>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span>{label}</span>
              </GlassFeatureItem>
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
            <GlassButton
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl border-transparent bg-transparent text-xs text-[--color-ink-mid] shadow-none hover:bg-[--color-surface-alt] hover:text-[--color-ink]"
            >
              Skip and open calculators
            </GlassButton>
            <Link
              href={routes.fieldNotes}
              className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl text-xs text-primary transition-colors hover:bg-[--color-orange-soft]"
              onClick={dismiss}
            >
              Browse Field Notes →
            </Link>
          </div>
        </GlassDialogFrame>
      </div>
    </>
  );
}

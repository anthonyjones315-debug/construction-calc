"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { routes } from "@routes";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Default: CRM Email Engine copy */
  children?: React.ReactNode;
}

const DEFAULT_COPY = (
  <>
    The CRM Email Engine is in final testing. Soon, you&apos;ll be able to send
    branded estimates directly to clients. Follow our Field Notes for the Phase
    2 rollout.
  </>
);

export function ComingSoonModal({
  open,
  onClose,
  title = "Coming soon",
  children = DEFAULT_COPY,
}: ComingSoonModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <h2
            id="coming-soon-title"
            className="font-display text-lg font-bold text-white"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {children}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={routes.fieldNotes}
              className="inline-flex items-center justify-center rounded-xl bg-[--color-orange-brand] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:brightness-95"
              onClick={onClose}
            >
              Visit Field Notes
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

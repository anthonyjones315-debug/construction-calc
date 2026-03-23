"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";

export function CrmFeedbackBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage to see if we should show it
    // Logic: show vaguely "occasionally" (e.g. at most once a day)
    const lastSeen = localStorage.getItem("crm-feedback-last-seen");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastSeen || now - parseInt(lastSeen, 10) > oneDay) {
      // 30% chance to show it if enough time passed, keeping it "occasional"
      if (Math.random() > 0.3) {
        setTimeout(() => setIsVisible(true), 100);
        localStorage.setItem("crm-feedback-last-seen", now.toString());
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:bottom-6 z-50 flex items-center justify-center p-4">
      <div className="pointer-events-auto flex w-full max-w-lg items-start gap-4 rounded-2xl border border-[--color-blue-brand]/20 bg-white p-4 shadow-2xl shadow-[--color-blue-brand]/10 ring-1 ring-black/5">
        <div className="flex shrink-0 items-center justify-center rounded-full bg-[--color-blue-soft] p-2.5 text-[--color-blue-brand]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-[--color-ink]">
            CRM is here! 🚀
          </h3>
          <p className="mt-1 text-sm text-[--color-ink-mid] leading-relaxed">
            We just rolled out the new CRM tools. Please provide your feedback so we can make it even better for your workflow.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-lg bg-[--color-blue-brand] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[--color-blue-dark] shadow-sm"
            >
              Give Feedback
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                // Permanent dismiss if they want
                localStorage.setItem("crm-feedback-last-seen", (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
              }}
              className="rounded-lg px-4 py-2 text-xs font-bold text-[--color-ink-dim] transition hover:bg-[--color-surface-alt]"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

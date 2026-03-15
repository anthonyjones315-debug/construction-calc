"use client";

import { useState } from "react";
import { X, Mail, Loader2 } from "lucide-react";

export type EstimatePayload = {
  title: string;
  calculatorLabel: string;
  controlNumber?: string | null;
  clientName?: string | null;
  jobSiteAddress?: string | null;
  results: Array<{
    label: string;
    value: string | number;
    unit: string;
    description?: string;
    highlight?: boolean;
  }>;
  budgetItems?: Array<{
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
  }>;
  totalCost?: number;
  generatedAt?: string;
};

interface EmailEstimateModalProps {
  open: boolean;
  onClose: () => void;
  estimate: EstimatePayload;
}

const DEFAULT_SUBJECT = "Estimate from Pro Construction Calc";

export function EmailEstimateModal({
  open,
  onClose,
  estimate,
}: EmailEstimateModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = to.trim().toLowerCase();
    if (!email) return;
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: subject.trim() || DEFAULT_SUBJECT,
          estimate: {
            ...estimate,
            generatedAt:
              estimate.generatedAt ?? new Date().toISOString().slice(0, 10),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to send email.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to send.");
    }
  }

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
        aria-labelledby="email-estimate-title"
        className="fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <h2
            id="email-estimate-title"
            className="font-display text-lg font-bold text-white"
          >
            Email Estimate
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Send this estimate to a client. Emails are sent from system@proconstructioncalc.com.
          </p>

          {status === "sent" ? (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Estimate sent successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="flex flex-col gap-1 text-sm text-slate-300">
                To (email)
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="client@example.com"
                  className="h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-white placeholder:text-slate-500 focus:border-[--color-orange-brand]/80 focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-300">
                Subject
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="h-10 rounded-xl border border-white/15 bg-black/30 px-3 text-white placeholder:text-slate-500 focus:border-[--color-orange-brand]/80 focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/40"
                />
              </label>
              {status === "error" && errorMessage && (
                <p className="text-sm text-red-300">{errorMessage}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[--color-orange-brand] px-4 text-sm font-bold text-black transition hover:brightness-95 disabled:opacity-60"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden />
                  )}
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
                >
                  Close
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

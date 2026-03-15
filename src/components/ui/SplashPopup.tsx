"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { X, FileDown } from "lucide-react";
import { routes } from "@routes";

const STORAGE_KEY = "bcp_beta_splash_v3";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
const CONSENT_VERSION = "2026-03-13";

export function SplashPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

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

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ok */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!marketingConsent) {
      setError(
        "Please confirm that you want product update emails before joining the list.",
      );
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: "splash_popup",
          marketingConsent: true,
          consentVersion: CONSENT_VERSION,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Signup failed");
      }

      setStatus("done");
      setTimeout(dismiss, 1800);
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

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
        className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
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
              <FileDown
                className="w-5 h-5 text-[--color-orange-brand]"
                aria-hidden
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-orange-brand]">
                Now in Beta
              </p>
              <h2
                id="splash-title"
                className="text-lg font-display font-bold text-white"
              >
                Save Estimates as PDF
              </h2>
            </div>
          </div>

          <p className="relative mb-4 text-sm leading-relaxed text-slate-400">
            Join the product updates list for launch notices, feature releases,
            and PDF workflow updates.
          </p>

          <div className="relative mb-5 flex flex-wrap gap-2">
            {[
              "Professional PDF export",
              "AI material optimizer",
              "Budget tracker",
              "Saved estimates",
            ].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
              >
                <span className="text-[--color-orange-brand]">✓</span> {f}
              </span>
            ))}
          </div>

          {status === "done" ? (
            <p className="py-2 text-center text-sm font-medium text-emerald-400">
              ✓ You&apos;re on the list! Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="relative">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
                  aria-label="Email address"
                  autoComplete="email"
                  maxLength={320}
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-4 py-2.5 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {status === "loading" ? "…" : "Notify Me"}
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[--color-orange-brand]"
                  aria-label="Consent to product update emails"
                />
                <span>
                  I agree to receive product updates and launch emails at this
                  address. If marketing emails are sent, they will include
                  unsubscribe instructions. See the{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[--color-orange-brand] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </form>
          )}

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl text-xs text-slate-400 transition-colors hover:bg-white/6 hover:text-white cursor-pointer"
            >
              No thanks, just use the calculators
            </button>
            <Link
              href={routes.fieldNotes}
              className="min-h-[44px] w-full flex items-center justify-center rounded-xl text-xs text-[--color-orange-brand] transition-colors hover:bg-white/6 cursor-pointer"
              onClick={dismiss}
            >
              Read Field Notes →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

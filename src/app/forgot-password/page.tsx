"use client";

import Link from "next/link";
import { useState } from "react";
import { HardHat } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { routes } from "@routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Client uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (resetError) {
        console.error("Auth Error Detail:", resetError);
        setError(resetError.message ?? "Could not send reset email. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Auth Error Detail:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-10 font-sans"
    >
      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Brand header — matches login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <HardHat
              className="h-10 w-10 text-orange-600 shrink-0"
              aria-hidden
            />
            <span className="text-white font-display font-bold text-xl tracking-tight uppercase">
              Pro Construction Calc
            </span>
          </div>
          <h1 className="text-white/70 text-sm font-medium">
            Reset your password
          </h1>
          <p className="mt-0.5 text-xs text-white/50">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20"
              aria-hidden
            >
              <svg
                className="h-6 w-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-emerald-400">
              Check your inbox
            </p>
            <p className="text-sm text-white/70">
              If an account exists for that email, we&apos;ve sent a password
              reset link. It may take a few minutes to arrive.
            </p>
            <Link
              href={routes.auth.signIn}
              className="w-full rounded-lg border border-slate-800 bg-transparent px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-950 text-center"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="mb-4 rounded-lg border border-red-500/30 bg-red-950/60 px-4 py-3 text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleReset}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-medium text-white/80 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-500 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[--color-orange-brand] px-4 py-4 text-lg font-black text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? "Sending…" : "SEND RESET LINK"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href={routes.auth.signIn}
                className="inline-flex items-center justify-center w-full rounded-lg border-2 border-white/80 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* Footer — matches login */}
        <p className="mt-auto pt-8 text-center text-[10px] font-display uppercase tracking-widest text-slate-400">
          Designed for the Mohawk Valley · Rome, NY
        </p>
      </div>
    </main>
  );
}

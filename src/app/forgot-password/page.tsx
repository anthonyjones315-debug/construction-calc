"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, HardHat, MailCheck, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { buildPublicUrl } from "@/lib/site-url";
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
        { redirectTo: buildPublicUrl("/reset-password") }
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
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 font-sans"
    >
      <div className="w-full max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[30px] border border-orange-500/20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_38%),linear-gradient(160deg,#111827_0%,#0f172a_52%,#020617_100%)] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="inline-flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15">
                <HardHat
                  className="h-6 w-6 text-orange-500 shrink-0"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                  Account Recovery
                </p>
                <p className="font-display text-xl font-bold uppercase tracking-tight text-white">
                  Pro Construction Calc
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-lg text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Get back into your estimating cockpit.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Send a secure reset link to your email so you can get back to
              saved estimates, field workflows, and client-ready exports
              without starting over.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                  <MailCheck className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-white">
                  Secure email delivery
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Recovery links are sent to the address on file and route you
                  back into the live app.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-white">
                  Contractor-safe reset
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  No marketing detours. Just restore access and get your team
                  back to work.
                </p>
              </div>
            </div>

            <p className="mt-8 text-[10px] font-display uppercase tracking-widest text-slate-400">
              Built for the Tri-County Field
            </p>
          </section>

          <section className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_24px_50px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                Password Reset
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                Send reset link
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Enter your email and we&apos;ll send a secure password reset
                link.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Your replacement password will still need to meet the full
                security requirements before it can be saved.
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"
                  aria-hidden
                >
                  <MailCheck className="h-7 w-7 text-emerald-300" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-bold uppercase tracking-[0.08em] text-emerald-300">
                    Check your inbox
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                    If an account exists for that email, we&apos;ve sent a
                    password reset link. It may take a few minutes to arrive.
                  </p>
                </div>
                <Link
                  href={routes.auth.signIn}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    className="mb-4 rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-3 text-sm text-red-300"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleReset}
                  className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-white/80"
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
                      className="w-full rounded-xl border border-slate-500 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[--color-orange-brand] px-4 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-5 space-y-3">
                  <Link
                    href={routes.auth.signIn}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-transparent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to Login
                  </Link>
                  <p className="text-center text-xs leading-relaxed text-white/50">
                    Use the same email tied to your account. If the message
                    doesn&apos;t arrive, check spam and retry from this page.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

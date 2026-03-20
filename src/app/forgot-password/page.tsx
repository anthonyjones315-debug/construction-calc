"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, HardHat, MailCheck, ShieldCheck } from "lucide-react";
import { routes } from "@routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotFound(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 && data.notFound) {
          setNotFound(true);
          setError(data.error ?? "No account found for that email address.");
        } else {
          setError(data.error ?? "Could not send reset email. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-[--color-bg] px-4 py-10 font-sans"
    >
      <div className="w-full max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

          {/* ── Left panel: brand + feature callouts ── */}
          <section className="relative overflow-hidden rounded-[30px] border border-[--color-orange-brand]/20 bg-[radial-gradient(circle_at_top_left,rgba(234,88,12,0.08),transparent_38%),linear-gradient(160deg,#fff7ed_0%,#fef3e2_52%,#f6f4ef_100%)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.07)] sm:p-8">
            <div className="inline-flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[--color-orange-brand]/25 bg-[--color-orange-brand]/10">
                <HardHat
                  className="h-6 w-6 text-[--color-orange-brand] shrink-0"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[--color-orange-brand]">
                  Account Recovery
                </p>
                <p className="font-display text-xl font-bold uppercase tracking-tight text-[--color-ink]">
                  Pro Construction Calc
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-lg text-3xl font-black uppercase tracking-tight text-[--color-ink] sm:text-4xl">
              Get back into your estimating cockpit.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[--color-ink-mid] sm:text-base">
              Send a secure reset link to your email so you can get back to
              saved estimates, field workflows, and client-ready exports
              without starting over.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[--color-border] bg-white/70 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[--color-orange-brand]/25 bg-[--color-orange-brand]/10 text-[--color-orange-brand]">
                  <MailCheck className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-[--color-ink]">
                  Secure email delivery
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[--color-ink-dim]">
                  Recovery links are sent to the address on file and route you
                  back into the live app.
                </p>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-white/70 p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[--color-orange-brand]/25 bg-[--color-orange-brand]/10 text-[--color-orange-brand]">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-[--color-ink]">
                  Contractor-safe reset
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[--color-ink-dim]">
                  No marketing detours. Just restore access and get your team
                  back to work.
                </p>
              </div>
            </div>

            <p className="mt-8 text-[10px] font-display uppercase tracking-widest text-[--color-ink-dim]">
              Built for the Tri-County Field
            </p>
          </section>

          {/* ── Right panel: form ── */}
          <section className="rounded-[30px] border border-[--color-border] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.07)] sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[--color-orange-brand]">
                Password Reset
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[--color-ink]">
                Send reset link
              </h2>
              <p className="mt-2 text-sm text-[--color-ink-mid]">
                Enter your email and we&apos;ll send a secure password reset
                link.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[--color-ink-dim]">
                Your replacement password will still need to meet the full
                security requirements before it can be saved.
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-6 rounded-2xl border border-emerald-500/25 bg-emerald-50 p-6 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
                  aria-hidden
                >
                  <MailCheck className="h-7 w-7 text-emerald-600" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-bold uppercase tracking-[0.08em] text-emerald-700">
                    Check your inbox
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-800/70">
                    If an account exists for that email, we&apos;ve sent a
                    password reset link. It may take a few minutes to arrive.
                  </p>
                </div>
                <Link
                  href={routes.auth.signIn}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[--color-border] bg-white px-4 py-3 text-sm font-semibold text-[--color-ink] transition hover:border-[--color-orange-brand]/40 hover:text-[--color-orange-brand] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                      notFound
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                    role="alert"
                    aria-live="polite"
                  >
                    <p>{error}</p>
                    {notFound && (
                      <p className="mt-2 text-xs">
                        Want to get started?{" "}
                        <Link
                          href={routes.register}
                          className="font-semibold text-[--color-orange-brand] underline hover:no-underline"
                        >
                          Create a free account
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                <form
                  onSubmit={handleReset}
                  className="space-y-4 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] p-5"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[--color-ink-mid]"
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
                      className="w-full rounded-xl border border-[--color-border] bg-white px-3.5 py-3 text-sm text-[--color-ink] placeholder-[--color-ink-dim] outline-none transition focus:border-[--color-orange-brand] focus:ring-2 focus:ring-[--color-orange-brand]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[--color-orange-brand] px-4 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[--color-orange-dark] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-5 space-y-3">
                  <Link
                    href={routes.auth.signIn}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[--color-border] bg-transparent px-4 py-3 text-sm font-medium text-[--color-ink-mid] transition-colors hover:border-[--color-orange-brand]/40 hover:text-[--color-orange-brand] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to Login
                  </Link>
                  <p className="text-center text-xs leading-relaxed text-[--color-ink-dim]">
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

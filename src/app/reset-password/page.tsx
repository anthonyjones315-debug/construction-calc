"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HardHat } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  PASSWORD_MIN_LENGTH,
  isPasswordPolicySatisfied,
  getPasswordPolicyError,
} from "@/lib/security/password-policy";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { routes } from "@routes";

const REDIRECT_DELAY_MS = 2000;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordValid = isPasswordPolicySatisfied(password);
  const canSubmit =
    !isLoading &&
    !showToast &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    isPasswordValid &&
    passwordsMatch;

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => {
      router.replace(routes.commandCenter);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [showToast, router]);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordPolicyError = getPasswordPolicyError(password);
    if (passwordPolicyError) {
      setError(passwordPolicyError);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          updateError.message ??
            "Could not update password. The link may have expired — try requesting a new one."
        );
        setIsLoading(false);
        return;
      }

      setShowToast(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[--color-bg] flex flex-col items-center justify-center px-4 py-10 font-sans"
    >
      {/* Toast: Password Updated! */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg"
        >
          Password Updated! Redirecting to Command Center…
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Brand header — matches login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <HardHat
              className="h-10 w-10 text-blue-brand shrink-0"
              aria-hidden
            />
            <span className="text-[--color-ink] font-display font-bold text-xl tracking-tight uppercase">
              Pro Construction Calc
            </span>
          </div>
          <h1 className="text-copy-secondary text-sm font-medium">
            Set new password
          </h1>
          <p className="mt-0.5 text-xs text-copy-tertiary">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleUpdate}
          className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="reset-new-password"
              className="block text-xs font-medium text-copy-secondary mb-1.5"
            >
              New Password
            </label>
            <input
              id="reset-new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              required
              minLength={PASSWORD_MIN_LENGTH}
              placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
              aria-describedby="reset-password-requirements"
              className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3.5 py-2.5 text-sm text-[--color-ink] placeholder-copy-tertiary outline-none focus:border-[--color-blue-brand] focus:ring-2 focus:ring-[--color-blue-brand]/30 transition"
            />
          </div>

          <div>
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-medium text-copy-secondary mb-1.5"
            >
              Confirm New Password
            </label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              required
              minLength={PASSWORD_MIN_LENGTH}
              placeholder="Re-enter your new password"
              className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3.5 py-2.5 text-sm text-[--color-ink] placeholder-copy-tertiary outline-none focus:border-[--color-blue-brand] focus:ring-2 focus:ring-[--color-blue-brand]/30 transition"
            />
          </div>

          <div id="reset-password-requirements">
            <PasswordRequirements
              password={password}
              confirmPassword={confirmPassword}
              showMatchRule
              className="bg-[--color-surface-alt]"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-[--color-blue-brand] px-4 py-3 text-sm font-black text-white transition hover:bg-[--color-blue-dark] focus:outline-none focus:ring-2 focus:ring-[--color-blue-brand]/35 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Updating…" : "UPDATE & SIGN IN"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={routes.auth.signIn}
            className="inline-flex items-center justify-center w-full rounded-lg border-2 border-[--color-border] bg-transparent px-4 py-2.5 text-sm font-medium text-[--color-ink] transition-colors hover:bg-[--color-surface-alt] focus:outline-none focus:ring-2 focus:ring-[--color-blue-brand]/30 focus:ring-offset-2"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer — matches login */}
        <p className="mt-auto pt-8 text-center text-[10px] font-display uppercase tracking-widest text-copy-secondary">
          Built for the Tri-County Field
        </p>
      </div>
    </main>
  );
}

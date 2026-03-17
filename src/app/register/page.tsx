"use client";

import Link from "next/link";
import { useActionState } from "react";
import { routes } from "@routes";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
} from "@/lib/security/password-policy";
import {
  registerUserAction,
  type RegisterActionState,
} from "@/app/register/actions";

const initialState: RegisterActionState = {
  status: "idle",
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUserAction,
    initialState,
  );

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[--color-bg] flex items-center justify-center px-4 text-[--color-ink]"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">
                P
              </span>
            </div>
            <span className="text-[--color-ink] font-display font-bold text-xl tracking-wide">
              Pro Construction Calc
            </span>
          </div>
          <h1 className="text-[--color-ink] text-lg font-semibold">
            Create your account
          </h1>
          <p className="text-[--color-ink-mid] text-sm mt-1">
            Save estimates, export PDFs, and manage your price book.
          </p>
        </div>

        <section className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-6 space-y-4 shadow-lg">
          <form action={formAction} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-[--color-ink]"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="mt-1 w-full rounded-lg border border-slate-500 bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink] outline-none ring-0 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[--color-ink]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-500 bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink] outline-none ring-0 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[--color-ink]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                required
                className="mt-1 w-full rounded-lg border border-slate-500 bg-[--color-surface] px-3 py-2 text-sm text-[--color-ink] outline-none ring-0 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              />
              <ul className="mt-2 space-y-1 text-xs text-[--color-ink-mid]">
                {PASSWORD_REQUIREMENTS.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>

            {state.message && (
              <p
                className={
                  state.status === "success"
                    ? "rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700"
                    : "rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
                }
                role="status"
                aria-live="polite"
              >
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-orange-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[--color-orange-dark] disabled:cursor-wait disabled:bg-[--color-orange-dark]"
            >
              {isPending ? "Creating account…" : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-[--color-ink-mid]">
            Already have an account?{" "}
            <Link
              href={routes.auth.signIn}
              className="font-medium text-[--color-ink] underline decoration-[--color-border] underline-offset-2 transition-colors hover:text-[--color-orange-dark]"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="text-center mt-6 text-[--color-ink-mid] text-sm">
          <Link
            href={routes.home}
            className="transition-colors hover:text-[--color-ink]"
          >
            Back to calculators
          </Link>
        </p>
      </div>
    </main>
  );
}

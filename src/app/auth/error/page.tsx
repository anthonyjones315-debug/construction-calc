"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { routes } from "@routes";

type AuthErrorContentModel = {
  title: string;
  description: string;
  recoverySteps?: string[];
  primaryActionLabel?: string;
};

const CALLBACK_HANDLER_ERROR = "OAUTH_CALLBACK_HANDLER_ERROR";

const callbackHandlerErrorAliases = new Set([
  CALLBACK_HANDLER_ERROR,
  "OAuthCallbackHandlerError",
  "CallbackRouteError",
  "OAuthCallback",
]);

function normalizeAuthErrorCode(rawErrorCode: string): string {
  if (callbackHandlerErrorAliases.has(rawErrorCode)) {
    return CALLBACK_HANDLER_ERROR;
  }

  return rawErrorCode;
}

const errorMessages: Record<string, AuthErrorContentModel> = {
  [CALLBACK_HANDLER_ERROR]: {
    title: "We couldn’t complete your sign-in",
    description:
      "Your provider returned to us, but the secure callback verification failed before we could finish login.",
    recoverySteps: [
      "Try sign-in again in the same browser tab.",
      "If it keeps failing, disable strict privacy blockers for this site and retry.",
      "If you switched providers, sign in with the original provider first.",
    ],
    primaryActionLabel: "Retry Secure Sign-In",
  },
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Link Expired",
    description:
      "The sign-in link has expired or already been used. Please request a new one.",
  },
  OAuthSignin: {
    title: "Sign-In Error",
    description: "Could not start the sign-in process. Please try again.",
  },
  OAuthCallback: {
    title: "Callback Error",
    description: "Something went wrong during sign-in. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Account Error",
    description: "Could not create your account. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "This email is already linked to a different sign-in method. Try signing in with your original method.",
  },
  Default: {
    title: "Sign-In Error",
    description:
      "An unexpected error occurred during sign-in. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const rawErrorCode = searchParams.get("error") ?? "Default";
  const errorCode = normalizeAuthErrorCode(rawErrorCode);
  const { title, description } =
    errorMessages[errorCode] ?? errorMessages.Default;
  const recoverySteps =
    errorMessages[errorCode]?.recoverySteps ??
    errorMessages.Default.recoverySteps;
  const primaryActionLabel =
    errorMessages[errorCode]?.primaryActionLabel ?? "Try Sign In Again";

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-[#0A0A0B] px-4 font-sans"
    >
      <div className="w-full max-w-sm text-center">
        {/* Logo — high-vis P brand */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#FF8C00] flex items-center justify-center shadow-[0_4px_20px_rgba(255,140,0,0.4)]">
            <span className="text-black font-display font-black text-lg">P</span>
          </div>
          <span className="text-white font-display font-black text-xl tracking-wide uppercase">
            Pro Construction Calc
          </span>
        </div>

        {/* Error card */}
        <section
          className="rounded-2xl border border-red-500/25 bg-[#111318] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
          aria-labelledby="auth-error-heading"
          aria-live="polite"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/80">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z"
              />
            </svg>
          </div>
          <h1
            id="auth-error-heading"
            className="text-white font-semibold text-lg mb-2"
          >
            {title}
          </h1>
          <p className="mb-6 text-sm text-white/80">{description}</p>
          {recoverySteps && recoverySteps.length > 0 && (
            <ul className="mb-6 space-y-2 rounded-lg border border-white/10 bg-[#0A0A0B]/80 p-3 text-left text-xs text-white/80">
              {recoverySteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="text-[#FF8C00]">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-3">
            <Link
              href={routes.auth.signIn}
              className="block w-full rounded-xl bg-[#FF8C00] px-4 py-2.5 text-sm font-bold text-black uppercase tracking-wide transition hover:bg-[#e67e00] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0B]"
            >
              {primaryActionLabel}
            </Link>
            <Link
              href="/command-center"
              className="block w-full rounded-xl border border-white/15 bg-[#0A0A0B] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/5 hover:border-[#FF8C00] hover:text-[#FF8C00] focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0B]"
            >
              Back to Command Center
            </Link>
          </div>
        </section>

        {rawErrorCode !== "Default" && (
          <p className="mt-4 text-xs text-white/50">
            Error code: {rawErrorCode}
          </p>
        )}
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="flex min-h-screen items-center justify-center bg-[#0A0A0B]"
        >
          <div
            className="flex items-center gap-3 text-white/80"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-8 h-8 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Loading sign-in error…</span>
          </div>
        </main>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}

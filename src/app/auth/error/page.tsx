"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HardHat } from "lucide-react";
import { routes } from "@routes";
import { useSession } from "next-auth/react";

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
  const router = useRouter();
  const { data: session } = useSession();
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
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 font-sans"
    >
      <div className="w-full max-w-sm text-center">
        {/* Logo — Orange Hard Hat (matches sign-in and header) */}
        <div className="inline-flex items-center gap-2 mb-8">
          <HardHat
            className="h-10 w-10 text-orange-600 shrink-0"
            aria-hidden
          />
          <span className="text-white font-display font-bold text-xl tracking-tight uppercase">
            Pro Construction Calc
          </span>
        </div>

        {/* Error card */}
        <section
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
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
            <ul className="mb-6 space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-left text-xs text-white/80">
              {recoverySteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="text-orange-600">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-3">
            <Link
              href={routes.auth.signIn}
              className="block w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {primaryActionLabel}
            </Link>
            <button
              type="button"
              onClick={() =>
                router.push(session?.user?.id ? routes.commandCenter : routes.home)
              }
              className="block w-full rounded-lg border border-slate-800 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Back to Command Center
            </button>
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
          className="flex min-h-screen items-center justify-center bg-slate-950"
        >
          <div
            className="flex items-center gap-3 text-white/80"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"
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

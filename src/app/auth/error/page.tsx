"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { HardHat } from "lucide-react";
import { routes } from "@routes";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { BUSINESS_EMAIL } from "@/lib/business-identity";

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
  const fallbackReference = `auth-${rawErrorCode.toLowerCase()}`;
  const supportError = useMemo(
    () =>
      Object.assign(
        new Error(`${title}: ${description}`),
        { digest: fallbackReference },
      ),
    [description, fallbackReference, title],
  );

  useEffect(() => {
    Sentry.captureMessage("Auth error page shown", {
      level: "warning",
      tags: {
        area: "auth",
        error_code: rawErrorCode,
      },
      extra: {
        href:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
    });
  }, [rawErrorCode]);

  return (
    <main
      id="main-content"
      className="animated-gradient-bg flex min-h-screen items-center justify-center px-4 py-10 font-sans text-copy-primary"
    >
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <HardHat
            className="h-10 w-10 shrink-0 text-primary"
            aria-hidden
          />
          <span className="font-display text-xl font-bold uppercase tracking-tight text-copy-primary">
            Pro Construction Calc
          </span>
        </div>

        <section
          className="glass-container-elevated relative overflow-hidden p-6"
          aria-labelledby="auth-error-heading"
          aria-live="polite"
        >
          <div
            aria-hidden
            className="glass-decorative absolute inset-x-0 top-0 h-28"
            style={{
              background:
                "radial-gradient(circle at top, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 54%)",
            }}
          />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
              <svg
                className="w-6 h-6 text-red-300"
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
              className="mb-2 text-lg font-semibold text-copy-primary"
            >
              {title}
            </h1>
            <p className="mb-6 text-sm text-copy-secondary">{description}</p>
            {recoverySteps && recoverySteps.length > 0 && (
              <ul className="glass-panel-deep mb-6 space-y-2 p-3 text-left text-xs text-copy-secondary">
                {recoverySteps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-3">
              <Link
                href={routes.auth.signIn}
                prefetch={false}
                className="glass-button-primary block w-full rounded-lg px-4 py-2.5 text-sm font-black"
              >
                {primaryActionLabel}
              </Link>
              <button
                type="button"
                onClick={() =>
                  router.push(session?.user?.id ? routes.commandCenter : routes.home)
                }
                className="glass-button block w-full rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                Back to Command Center
              </button>
              <ManualErrorReportButton
                error={supportError}
                source="auth-error-page"
                buttonLabel="Send backup report"
                className="w-full"
              />
              <a
                href={`mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
                  `Auth error: ${rawErrorCode}`,
                )}`}
                className="glass-button block w-full rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {rawErrorCode !== "Default" && (
          <p className="mt-4 text-xs text-copy-tertiary">
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
          className="animated-gradient-bg flex min-h-screen items-center justify-center text-copy-primary"
        >
          <div
            className="glass-panel flex items-center gap-3 text-copy-secondary"
            role="status"
            aria-live="polite"
          >
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
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

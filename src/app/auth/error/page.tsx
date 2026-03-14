"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string }> = {
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
  const errorCode = searchParams.get("error") ?? "Default";
  const { title, description } =
    errorMessages[errorCode] ?? errorMessages.Default;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-neutral-950 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">B</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-wide">
            BUILD CALC PRO
          </span>
        </div>

        {/* Error card */}
        <section
          className="rounded-xl border border-red-800 bg-neutral-900 p-6"
          aria-labelledby="auth-error-heading"
          aria-live="polite"
        >
          <div className="w-12 h-12 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <p className="text-neutral-300 text-sm mb-6">{description}</p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full rounded-lg bg-orange-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
            >
              Try Sign In Again
            </Link>
            <Link
              href="/"
              className="block w-full rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-700"
            >
              Back to Calculators
            </Link>
          </div>
        </section>

        {errorCode !== "Default" && (
          <p className="mt-4 text-neutral-300 text-xs">
            Error code: {errorCode}
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
          className="min-h-screen bg-neutral-950 flex items-center justify-center"
        >
          <div
            className="flex items-center gap-3 text-neutral-200"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-8 h-8 border-2 border-orange-brand border-t-transparent rounded-full animate-spin"
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

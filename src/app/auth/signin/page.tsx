"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function getSafeCallbackUrl(candidate: string | null): string {
  if (!candidate) {
    return "/calculators";
  }

  if (candidate.startsWith("/")) {
    return candidate;
  }

  try {
    const parsedCandidate = new URL(candidate);
    if (
      typeof window !== "undefined" &&
      parsedCandidate.origin === window.location.origin
    ) {
      return `${parsedCandidate.pathname}${parsedCandidate.search}${parsedCandidate.hash}`;
    }
  } catch {
    return "/calculators";
  }

  return "/calculators";
}

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Could not start sign-in. Please try again.",
    OAuthCallback: "Something went wrong during sign-in. Please try again.",
    OAuthAccountNotLinked:
      "This email is already linked to a different sign-in method.",
    Configuration:
      "Google sign-in is not available right now. Please try again shortly.",
    Callback: "Sign-in callback error. Please try again.",
    Default: "Sign-in failed. Please try again.",
  };

  async function handleGoogleSignIn() {
    setIsSigningIn(true);
    await signIn("google", { callbackUrl });
    setIsSigningIn(false);
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-neutral-950 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">
                B
              </span>
            </div>
            <span className="text-white font-display font-bold text-xl tracking-wide">
              BUILD CALC PRO
            </span>
          </div>
          <h1 className="text-neutral-100 text-lg font-semibold">
            Sign in to your account
          </h1>
          <p className="text-neutral-300 text-sm mt-1">
            Save estimates, export PDFs, and manage your price book.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 rounded-lg border border-red-700 bg-red-950/70 p-3 text-sm text-red-100"
            role="alert"
            aria-live="polite"
          >
            {errorMessages[error] ?? errorMessages.Default}
          </div>
        )}

        {/* Sign in card */}
        <section
          className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 space-y-4"
          aria-labelledby="google-sign-in-heading"
        >
          <h2 id="google-sign-in-heading" className="sr-only">
            Google sign-in
          </h2>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            aria-busy={isSigningIn}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-950 transition-colors hover:bg-neutral-100 disabled:cursor-wait disabled:bg-neutral-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {isSigningIn ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs text-neutral-400">
              <span className="bg-neutral-900 px-2">or</span>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-3 text-xs leading-relaxed text-neutral-300">
            Google sign-in shares your name, email address, and profile photo
            with us. We use that information to create and secure your account,
            save estimates you choose to keep, and send service-related messages
            about your account. We do not add your Google email to marketing
            lists unless you opt in separately.
          </div>

          <p className="text-[11px] text-neutral-400">
            Necessary authentication cookies are used to keep you signed in.
            Optional analytics and advertising cookies are controlled through
            the site cookie banner.
          </p>
        </section>

        {/* Back link */}
        <p className="text-center mt-6 text-neutral-300 text-sm">
          <Link href="/" className="transition-colors hover:text-white">
            Back to calculators
          </Link>
        </p>

        <p className="text-center mt-4 text-neutral-300 text-xs leading-relaxed">
          By signing in you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-neutral-100 underline decoration-neutral-400 underline-offset-2 transition-colors hover:text-white"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-neutral-100 underline decoration-neutral-400 underline-offset-2 transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
          . Marketing emails require separate opt-in.
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
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
            <span>Loading sign-in…</span>
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

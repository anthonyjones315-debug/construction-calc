"use client";

import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HardHat, Loader2 } from "lucide-react";
import { routes } from "@routes";
import posthog from "posthog-js";

const callbackHandlerErrorCodes = new Set([
  "OAUTH_CALLBACK_HANDLER_ERROR",
  "OAuthCallbackHandlerError",
  "CallbackRouteError",
]);

function normalizeAuthErrorCode(code: string | null): string | null {
  if (!code) {
    return null;
  }

  if (callbackHandlerErrorCodes.has(code)) {
    return "OAUTH_CALLBACK_HANDLER_ERROR";
  }

  return code;
}

type SignInClientProps = {
  callbackUrl: string;
  errorCode: string | null;
};

export default function SignInClient({
  callbackUrl,
  errorCode,
}: SignInClientProps) {
  const error = normalizeAuthErrorCode(errorCode);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCredentialsSigningIn, setIsCredentialsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
      router.replace(routes.commandCenter);
    }
  }, [router, status, session]);

  const errorMessages: Record<string, string> = {
    OAUTH_CALLBACK_HANDLER_ERROR:
      "We couldn’t complete secure sign-in. Please retry in this tab, or temporarily disable strict privacy blockers for this site.",
    OAuthSignin: "Could not start sign-in. Please try again.",
    OAuthCallback: "Something went wrong during sign-in. Please try again.",
    OAuthAccountNotLinked:
      "This email is already linked to a different sign-in method.",
    Configuration:
      "Sign-in is not available right now. Please try again shortly.",
    Callback: "Sign-in callback error. Please try again.",
    Default: "Sign-in failed. Please try again.",
  };

  async function handleGoogleSignIn() {
    setCredentialsError(null);
    setIsSigningIn(true);
    posthog.capture("sign_in_attempted", { method: "google" });
    await signIn("google", {
      callbackUrl,
      redirect: true,
      prompt: "select_account",
    });
  }

  async function handleCredentialsSignIn(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setCredentialsError(null);
    setIsCredentialsSigningIn(true);
    posthog.capture("sign_in_attempted", { method: "credentials" });

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setIsCredentialsSigningIn(false);

    if (result?.error) {
      posthog.capture("sign_in_failed", { method: "credentials" });
      setCredentialsError("Invalid email or password.");
      return;
    }

    const activeSession = await getSession();
    console.log("Auth State:", activeSession?.user ?? null);

    if (activeSession?.user?.id) {
      posthog.identify(activeSession.user.id, {
        email: activeSession.user.email ?? undefined,
        name: activeSession.user.name ?? undefined,
      });
    }

    window.location.assign(result?.url ?? callbackUrl);
  }

  const activeError = credentialsError ?? (error ? errorMessages[error] : null);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 font-sans"
    >
      {(isSigningIn || isCredentialsSigningIn) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/95 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[--color-orange-brand]/50 bg-[--color-orange-brand]/10">
            <Loader2 className="h-7 w-7 animate-spin text-orange-600" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            {isSigningIn ? "Redirecting to Google…" : "Signing in…"}
          </p>
          <p className="text-xs text-slate-400">Pro Construction Calc</p>
        </div>
      )}
      <div className="w-full max-w-sm">
        {/* Brand header — Orange Hard Hat logo (matches main header) */}
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
            Sign in to your Estimating Cockpit
          </h1>
          <p className="mt-0.5 text-xs text-white/50">
            Access your Field Notes &amp; saved estimates
          </p>
        </div>

        {activeError && (
          <div
            className="mb-4 rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-3 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {activeError}
          </div>
        )}

        <section
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
          aria-labelledby="oauth-sign-in-heading"
        >
          <h2 id="oauth-sign-in-heading" className="sr-only">
            OAuth sign-in
          </h2>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || isCredentialsSigningIn}
            aria-busy={isSigningIn}
            className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-white/80 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-50"
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

          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-white/50">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-3">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-medium text-white/80 mb-1.5"
              >
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-500 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signin-password"
                  className="block text-xs font-medium text-white/80"
                >
                  Password
                </label>
                <Link
                  href={routes.auth.forgotPassword}
                  className="text-xs font-medium text-orange-500 transition-colors hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 rounded"
                  aria-label="Send a password reset link to your email"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                className="w-full rounded-lg border border-slate-500 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSigningIn || isCredentialsSigningIn}
              className="w-full rounded-lg bg-[--color-orange-brand] px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
            >
              {isCredentialsSigningIn ? "Signing in…" : "Continue with Email"}
            </button>
          </form>

          <p className="text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link
              href={routes.register}
              className="font-semibold text-orange-500 transition-colors hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 rounded"
            >
              Sign Up
            </Link>
          </p>

          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs leading-relaxed text-white/55">
            Social sign-in shares your name and email with us to create and
            secure your account. We do not add your email to marketing lists
            unless you opt in separately.
          </div>
        </section>

        <div className="mt-6 space-y-2 text-center">
          <button
            type="button"
            onClick={() =>
              router.push(session?.user?.id ? routes.commandCenter : routes.home)
            }
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white/80 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Back to Command Center
          </button>
          <p className="text-xs text-white/50">
            By signing in you agree to our{" "}
            <Link
              href={routes.terms}
              className="underline underline-offset-2 text-orange-500 transition-colors hover:text-orange-400"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href={routes.privacy}
              className="underline underline-offset-2 text-orange-500 transition-colors hover:text-orange-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="pt-2 text-center text-[10px] font-display uppercase tracking-widest text-slate-400">
            Designed for the Mohawk Valley · Rome, NY
          </p>
        </div>
      </div>
    </main>
  );
}

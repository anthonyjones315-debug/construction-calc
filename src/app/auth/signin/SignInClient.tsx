"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HardHat, Loader2 } from "lucide-react";
import { routes } from "@routes";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { BUSINESS_EMAIL } from "@/lib/business-identity";
import { AmazonAdBanner } from "@/components/layout/AmazonAdBanner";

const WelcomeGuidePopup = dynamic(
  () =>
    import("@/components/ui/WelcomeGuidePopup").then(
      (mod) => mod.WelcomeGuidePopup,
    ),
  { ssr: false },
);

const callbackHandlerErrorCodes = new Set([
  "OAUTH_CALLBACK_HANDLER_ERROR",
  "OAuthCallbackHandlerError",
  "CallbackRouteError",
]);

const twoFactorErrorCodes = new Set([
  "TWO_FACTOR_REQUIRED",
  "TWO_FACTOR_INVALID",
  "TWO_FACTOR_RATE_LIMITED",
]);

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
  TWO_FACTOR_REQUIRED:
    "Enter the 6-digit security code we emailed to finish signing in.",
  TWO_FACTOR_INVALID:
    "That security code is invalid or expired. Enter the newest code we sent.",
  TWO_FACTOR_RATE_LIMITED:
    "Too many incorrect security code attempts. Wait a minute and try again.",
  Default: "Sign-in failed. Please try again.",
};

function normalizeAuthErrorCode(code: string | null): string | null {
  if (!code) {
    return null;
  }

  if (callbackHandlerErrorCodes.has(code)) {
    return "OAUTH_CALLBACK_HANDLER_ERROR";
  }

  return code;
}

function resolveCredentialsErrorCode(result: {
  error?: string | null;
  url?: string | null;
}) {
  const rawError = result.error ?? null;

  if (rawError !== "CredentialsSignin") {
    return rawError;
  }

  try {
    const parsed = new URL(result.url ?? "", window.location.origin);
    return parsed.searchParams.get("code") ?? rawError;
  } catch {
    return rawError;
  }
}

type SignInClientProps = {
  callbackUrl: string;
  errorCode: string | null;
  forceWelcome: boolean;
  registered: boolean;
};

type SentryFeedbackWidget = {
  appendToDom: () => void;
  removeFromDom: () => void;
};

function resolvePostSignInDestination(
  resultUrl: string | null | undefined,
  callbackUrl: string,
): string {
  const fallback = callbackUrl.startsWith("/")
    ? callbackUrl
    : routes.commandCenter;

  if (!resultUrl) {
    return fallback;
  }

  try {
    const parsed = new URL(resultUrl, window.location.origin);

    if (parsed.origin !== window.location.origin) {
      return fallback;
    }

    const callbackFromResult = parsed.searchParams.get("callbackUrl");

    if (parsed.pathname === routes.auth.signIn) {
      return callbackFromResult?.startsWith("/")
        ? callbackFromResult
        : fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export default function SignInClient({
  callbackUrl,
  errorCode,
  forceWelcome,
  registered,
}: SignInClientProps) {
  const error = normalizeAuthErrorCode(errorCode);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCredentialsSigningIn, setIsCredentialsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [twoFactorStep, setTwoFactorStep] = useState(
    twoFactorErrorCodes.has(error ?? ""),
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(
    error === "TWO_FACTOR_REQUIRED" ? 60 : 0,
  );
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [authEventId, setAuthEventId] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const activeError = credentialsError ?? (error ? errorMessages[error] : null);
  const supportError = useMemo(
    () =>
      Object.assign(
        new Error(activeError ?? "Authentication failed on the sign-in screen."),
        {
          digest: authEventId ?? undefined,
        },
      ),
    [activeError, authEventId],
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
      window.location.replace(
        resolvePostSignInDestination(callbackUrl, routes.commandCenter),
      );
    }
  }, [callbackUrl, status, session]);

  useEffect(() => {
    if (!twoFactorStep || cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds, twoFactorStep]);

  useEffect(() => {
    if (twoFactorStep) {
      otpRefs.current[0]?.focus();
    }
  }, [twoFactorStep]);

  // Mount Sentry User Feedback widget (bottom-right "Report a bug" trigger)
  useEffect(() => {
    const feedbackApi = Sentry.getFeedback?.() as
      | {
          createWidget?: (options?: {
            triggerLabel?: string;
            colorScheme?: "light" | "dark" | "system";
          }) => SentryFeedbackWidget;
        }
      | undefined;
    const widget = feedbackApi?.createWidget?.({
      triggerLabel: "Report a bug",
      colorScheme: "system",
    });
    widget?.appendToDom?.();
    return () => widget?.removeFromDom?.();
  }, [callbackUrl]);

  // Capture Google auth errors and prompt for feedback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("error");

    if (authError) {
      const eventId = Sentry.captureException(
        new Error(`Google Login Failure: ${authError}`),
        {
          tags: { section: "authentication", error_code: authError },
          extra: {
            callbackUrl,
            href: window.location.href,
          },
        },
      );
      setAuthEventId(eventId);

      Sentry.showReportDialog({
        title: "Login Trouble?",
        subtitle:
          "Our system noticed the Google login failed. Can you tell us what happened?",
        labelSubmit: "Send Feedback",
      });
    }
  }, [callbackUrl]);

  function resetOtp() {
    setOtp(["", "", "", "", "", ""]);
  }

  function beginTwoFactorStep(nextError?: string | null, cooldown = 60) {
    setTwoFactorStep(true);
    setCooldownSeconds(cooldown);
    setCredentialsError(
      nextError && errorMessages[nextError]
        ? errorMessages[nextError]
        : errorMessages.TWO_FACTOR_REQUIRED,
    );
    resetOtp();
  }

  async function handleResendCode() {
    if (cooldownSeconds > 0 || isResendingCode) return;

    setIsResendingCode(true);
    setCredentialsError(null);

    try {
      const response = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSeconds?: number;
      };

      if (!response.ok) {
        if (response.status === 429) {
          setCooldownSeconds(payload.retryAfterSeconds ?? 60);
        }
        throw new Error(
          payload.error ?? "We couldn't resend the security code right now.",
        );
      }

      beginTwoFactorStep("TWO_FACTOR_REQUIRED", payload.retryAfterSeconds ?? 60);
    } catch (resendError) {
      setCredentialsError(
        resendError instanceof Error
          ? resendError.message
          : "We couldn't resend the security code right now.",
      );
    } finally {
      setIsResendingCode(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");

    if (digits.length > 1) {
      const next = [...otp];
      digits
        .slice(0, 6)
        .split("")
        .forEach((digit, offset) => {
          if (index + offset < next.length) {
            next[index + offset] = digit;
          }
        });
      setOtp(next);
      const focusIndex = Math.min(index + digits.length, otpRefs.current.length - 1);
      otpRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = digits;
    setOtp(next);

    if (digits && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleGoogleSignIn() {
    setCredentialsError(null);
    setIsSigningIn(true);
    setAuthEventId(null);
    posthog.capture("sign_in_attempted", { method: "google" });
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
        prompt: "select_account",
      });
    } catch (error) {
      const eventId = Sentry.captureException(error, {
        tags: {
          section: "authentication",
          provider: "google",
          stage: "sign-in-start",
        },
        extra: { callbackUrl },
      });
      setAuthEventId(eventId);
      setCredentialsError(
        "Google sign-in could not start. Please try again or use the backup report/contact options below.",
      );
      setIsSigningIn(false);
    }
  }

  async function handleCredentialsSignIn(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setCredentialsError(null);
    setAuthEventId(null);
    setIsCredentialsSigningIn(true);
    posthog.capture("sign_in_attempted", { method: "credentials" });

    const result = await signIn("credentials", {
      email,
      password,
      code: twoFactorStep ? otp.join("") : undefined,
      callbackUrl,
      redirect: false,
    });

    setIsCredentialsSigningIn(false);

    const credentialsErrorCode = resolveCredentialsErrorCode(result ?? {});

    if (credentialsErrorCode) {
      posthog.capture("sign_in_failed", { method: "credentials" });
      const eventId = Sentry.captureMessage("Credentials sign-in failed", {
        level: "warning",
        tags: {
          section: "authentication",
          provider: "credentials",
        },
        extra: {
          callbackUrl,
          error: credentialsErrorCode,
        },
      });
      setAuthEventId(eventId);

      if (credentialsErrorCode === "TWO_FACTOR_REQUIRED") {
        beginTwoFactorStep(credentialsErrorCode);
        return;
      }

      if (credentialsErrorCode === "TWO_FACTOR_INVALID") {
        setTwoFactorStep(true);
        resetOtp();
        setCredentialsError(errorMessages.TWO_FACTOR_INVALID);
        return;
      }

      if (credentialsErrorCode === "TWO_FACTOR_RATE_LIMITED") {
        setTwoFactorStep(true);
        setCooldownSeconds(60);
        setCredentialsError(errorMessages.TWO_FACTOR_RATE_LIMITED);
        return;
      }

      setCredentialsError("Invalid email or password.");
      return;
    }

    const activeSession = await getSession();

    if (activeSession?.user?.id) {
      posthog.identify(activeSession.user.id, {
        email: activeSession.user.email ?? undefined,
        name: activeSession.user.name ?? undefined,
      });
    }

    window.location.assign(
      resolvePostSignInDestination(result?.url, callbackUrl),
    );
  }
  return (
    <main
      id="main-content"
      className="flex min-h-dvh overflow-hidden bg-[#f6f4ef] px-4 py-10 font-sans items-center justify-center"
    >
      {forceWelcome && <WelcomeGuidePopup forceOpen={forceWelcome} />}
      {(isSigningIn || isCredentialsSigningIn) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#f6f4ef]/95 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[--color-orange-brand]/50 bg-[--color-orange-brand]/10">
            <Loader2 className="h-7 w-7 animate-spin text-orange-600" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            {isSigningIn
              ? "Redirecting to Google…"
              : twoFactorStep
                ? "Verifying security code…"
                : "Signing in…"}
          </p>
          <p className="text-xs text-slate-500">Pro Construction Calc</p>
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
            <span className="text-slate-900 font-display font-bold text-xl tracking-tight uppercase">
              Pro Construction Calc
            </span>
          </div>
          <h1 className="text-slate-600 text-sm font-medium">
            Sign in to your Estimating Cockpit
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Access your Field Notes &amp; saved estimates
          </p>
        </div>

        {activeError && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            {activeError}
          </div>
        )}

        {registered && !activeError && (
          <div
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
            aria-live="polite"
          >
            Account created successfully. Sign in to open your Command Center,
            and use the welcome guide if you want a quick walkthrough.
          </div>
        )}

        {activeError && (
          <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">
              Need a fallback?
            </p>
            <p className="mt-1 text-slate-500">
              If Google sign-in still fails or the feedback widget does not open,
              send a backup report or contact us directly.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <ManualErrorReportButton
                error={supportError}
                eventId={authEventId}
                source="auth-signin"
                buttonLabel="Send backup report"
              />
              <a
                href={`mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
                  "Google sign-in issue",
                )}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
              >
                Contact Us
              </a>
            </div>
          </div>
        )}

        <section
          className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
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
            className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
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
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-3">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-medium text-slate-700 mb-1.5"
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
                disabled={twoFactorStep}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>

            {!twoFactorStep ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs font-medium text-slate-700"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700">
                    Security code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorStep(false);
                      setCredentialsError(null);
                      resetOtp();
                    }}
                    className="text-xs font-medium text-orange-500 transition-colors hover:text-orange-400"
                  >
                    Change sign-in details
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="h-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      aria-label={`Security code digit ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span>
                    Code expires in 5 minutes.
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={cooldownSeconds > 0 || isResendingCode}
                    className="font-semibold text-orange-400 transition hover:text-orange-300 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    {isResendingCode
                      ? "Sending..."
                      : cooldownSeconds > 0
                        ? `Resend in ${cooldownSeconds}s`
                        : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                isSigningIn ||
                isCredentialsSigningIn ||
                (twoFactorStep && otp.join("").length !== 6)
              }
              className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isCredentialsSigningIn
                ? twoFactorStep
                  ? "Verifying security code…"
                  : "Signing in…"
                : twoFactorStep
                  ? "Verify Security Code"
                  : "Continue with Email"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href={routes.register}
              className="font-semibold text-orange-500 transition-colors hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 rounded"
            >
              Sign Up
            </Link>
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            Social sign-in shares your name and email with us to create and
            secure your account. We do not add your email to marketing lists
            unless you opt in separately.
          </div>
        </section>

        <AmazonAdBanner variant="signin" />

        <div className="mt-6 space-y-2 text-center">
          <button
            type="button"
            onClick={() =>
              router.push(session?.user?.id ? routes.commandCenter : routes.home)
            }
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Back to Command Center
          </button>
          <p className="text-xs text-slate-500">
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
          <p className="pt-2 text-center text-[10px] font-display uppercase tracking-widest text-slate-400 opacity-60">
            Built for the Tri-County Field
          </p>
        </div>
      </div>
    </main>
  );
}

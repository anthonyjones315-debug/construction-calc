"use client";

import type { Route } from "next";
import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  SignIn,
  SignUp,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@routes";
import {
  getClerkAuthRoute,
  type ClerkAuthMode,
} from "@/lib/clerk/routing";

type ClerkAuthPageProps = {
  mode: ClerkAuthMode;
  fallbackRedirectUrl: string;
  clerkEnabled: boolean;
};

const LOAD_TIMEOUT_MS = 4000;

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--shell-header-h))] w-full max-w-lg items-center px-4 py-10">
      <div className="w-full">{children}</div>
    </div>
  );
}

function AuthStatusCard({
  title,
  description,
  footer,
}: {
  title: string;
  description: string;
  footer?: string;
}) {
  return (
    <div className="w-full rounded-3xl border border-[--color-border] bg-[--color-surface] p-8 text-center shadow-[0_20px_60px_rgba(15,18,27,0.08)]">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
      <h1 className="mt-6 text-2xl font-black text-[--color-ink]">{title}</h1>
      <p className="mt-2 text-sm text-[--color-ink-mid]">{description}</p>
      {footer ? (
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[--color-ink-dim]">
          {footer}
        </p>
      ) : null}
    </div>
  );
}

function AuthUnavailableCard({ mode }: { mode: ClerkAuthMode }) {
  const title =
    mode === "sign-up"
      ? "Sign-up is temporarily unavailable"
      : "Sign-in is temporarily unavailable";

  return (
    <div className="w-full rounded-3xl border border-[--color-border] bg-[--color-surface] p-8 text-center shadow-[0_20px_60px_rgba(15,18,27,0.08)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-lg font-black text-amber-700">
        !
      </div>
      <h1 className="mt-6 text-2xl font-black text-[--color-ink]">{title}</h1>
      <p className="mt-2 text-sm text-[--color-ink-mid]">
        Clerk did not initialize for this deployment, so the secure auth form
        cannot render yet.
      </p>
      <p className="mt-2 text-sm text-[--color-ink-mid]">
        Restore the Clerk publishable key for this environment and redeploy to
        bring auth back online.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={routes.home}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[--color-border] px-5 py-2.5 text-sm font-semibold text-[--color-ink] transition-colors hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

export function ClerkAuthPage({
  mode,
  fallbackRedirectUrl,
  clerkEnabled,
}: ClerkAuthPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    router.replace(fallbackRedirectUrl as Route);
  }, [fallbackRedirectUrl, isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isLoaded]);

  if (!clerkEnabled) {
    return (
      <AuthFrame>
        <AuthUnavailableCard mode={mode} />
      </AuthFrame>
    );
  }

  const authRoute = getClerkAuthRoute(mode);

  return (
    <AuthFrame>
      <ClerkLoading>
        <AuthStatusCard
          title={mode === "sign-up" ? "Loading sign-up" : "Loading sign-in"}
          description={
            timedOut
              ? "Clerk is taking longer than expected to load. If this persists, the auth environment is likely misconfigured."
              : "Loading the secure Clerk auth experience for you now."
          }
          footer={timedOut ? "Waiting On Clerk" : undefined}
        />
      </ClerkLoading>

      <ClerkFailed>
        <AuthUnavailableCard mode={mode} />
      </ClerkFailed>

      <ClerkLoaded>
        {mode === "sign-up" ? (
          <SignUp
            path={authRoute}
            routing="path"
            signInUrl={routes.auth.signIn}
            fallbackRedirectUrl={fallbackRedirectUrl}
          />
        ) : (
          <SignIn
            path={authRoute}
            routing="path"
            signUpUrl={routes.auth.signUp}
            fallbackRedirectUrl={fallbackRedirectUrl}
          />
        )}
      </ClerkLoaded>
    </AuthFrame>
  );
}

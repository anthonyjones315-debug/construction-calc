"use client";

import type { Route } from "next";
import { useClerk, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { routes } from "@routes";

type ClerkAuthLauncherProps = {
  mode: "sign-in" | "sign-up";
  fallbackRedirectUrl: string;
};

export function ClerkAuthLauncher({
  mode,
  fallbackRedirectUrl,
}: ClerkAuthLauncherProps) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const openedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      router.replace(fallbackRedirectUrl as Route);
      return;
    }

    if (openedRef.current) {
      return;
    }

    openedRef.current = true;

    if (mode === "sign-up") {
      clerk.openSignUp({ fallbackRedirectUrl });
      return;
    }

    clerk.openSignIn({ fallbackRedirectUrl });
  }, [clerk, fallbackRedirectUrl, isLoaded, isSignedIn, mode, router]);

  const title = mode === "sign-up" ? "Create your account" : "Sign in to continue";
  const description =
    mode === "sign-up"
      ? "We are opening Clerk secure sign-up for you now."
      : "We are opening Clerk secure sign-in for you now.";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--shell-header-h))] w-full max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-[--color-border] bg-[--color-surface] p-8 text-center shadow-[0_20px_60px_rgba(15,18,27,0.08)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
        <h1 className="mt-6 text-2xl font-black text-[--color-ink]">{title}</h1>
        <p className="mt-2 text-sm text-[--color-ink-mid]">{description}</p>
        <p className="mt-2 text-sm text-[--color-ink-mid]">
          If nothing appears, use the button below.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (mode === "sign-up") {
                clerk.openSignUp({ fallbackRedirectUrl });
                return;
              }

              clerk.openSignIn({ fallbackRedirectUrl });
            }}
            className="btn-tactile inline-flex min-h-11 items-center justify-center rounded-xl bg-[--color-blue-brand] px-5 py-2.5 text-sm font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[--color-blue-dark] active:scale-[0.98]"
          >
            {mode === "sign-up" ? "Open Sign Up" : "Open Sign In"}
          </button>
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[--color-border] px-5 py-2.5 text-sm font-semibold text-[--color-ink] transition-colors hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

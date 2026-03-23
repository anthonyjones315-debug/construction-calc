"use client";

import { SignIn, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { routes } from "@routes";
import { safeAppRedirectPath } from "@/lib/auth/safe-redirect";
import { useEffect, useState } from "react";

function SignInFallback() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[--color-blue-brand] border-t-transparent" />
      <p className="text-sm text-[--color-ink-mid]">Loading sign-in…</p>
    </div>
  );
}

function SignInError() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[--color-border] bg-[--color-surface] p-8 shadow-xl text-center max-w-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-[--color-ink]">Sign-in is loading</h2>
      <p className="text-sm text-[--color-ink-mid]">
        The sign-in form is taking longer than expected. This can happen on slow connections or in certain browsers.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-[--color-blue-brand] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[--color-blue-dark]"
      >
        Retry
      </button>
    </div>
  );
}

export function SignInClient() {
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const [timedOut, setTimedOut] = useState(false);

  const next =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirect_url") ??
    searchParams.get("next");
  const fallback = safeAppRedirectPath(next, routes.commandCenter);

  // Clerk can take a while to hydrate its JS; show an error state after 8s
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const clerkLoaded = clerk?.loaded;

  if (timedOut && !clerkLoaded) {
    return <SignInError />;
  }

  if (!clerkLoaded) {
    return <SignInFallback />;
  }

  return <SignIn fallbackRedirectUrl={fallback} />;
}

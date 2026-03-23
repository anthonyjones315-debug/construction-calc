"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@routes";
import { useClerkAuthFlow } from "@/components/auth/useClerkAuthFlow";

/**
 * Full‑screen splash shown to visitors who are not logged in.
 * It encourages them to sign up before accessing any calculator or estimate functionality.
 */
export function AuthSplash() {
  const { status } = useSession();
  const router = useRouter();
  const { openSignIn, openSignUp } = useClerkAuthFlow();

  // If the user is signed in we redirect to the home page (or keep the caller's page).
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // If the session is still loading we render nothing to avoid flicker.
  if (status === "loading") return null;

  const currentPath =
    typeof window === "undefined"
      ? routes.home
      : `${window.location.pathname}${window.location.search}` || routes.home;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--color-surface] p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold text-[--color-ink]">
        Welcome to Pro Construction Calc
      </h1>
      <p className="mb-6 max-w-lg text-lg text-[--color-ink-mid]">
        Our powerful calculators are built for contractors. Sign up to start creating estimates and unlock the full suite of tools.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void openSignIn(currentPath)}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[--color-ink] transition-colors hover:border-blue-700 hover:text-blue-700"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => void openSignUp(currentPath)}
          className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Sign Up &amp; Get Started
        </button>
        <Link
          href={routes.home}
          className="px-2 py-3 text-sm font-medium text-[--color-ink-mid] transition-colors hover:text-[--color-ink]"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

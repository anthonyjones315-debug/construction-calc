"use client";

import type { Route } from "next";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Full‑screen splash shown to visitors who are not logged in.
 * It encourages them to sign up before accessing any calculator or estimate functionality.
 */
export function AuthSplash() {
  const { status } = useSession();
  const router = useRouter();

  // If the user is signed in we redirect to the home page (or keep the caller's page).
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // If the session is still loading we render nothing to avoid flicker.
  if (status === "loading") return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--color-surface] p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold text-[--color-ink]">
        Welcome to Pro Construction Calc
      </h1>
      <p className="mb-6 max-w-lg text-lg text-[--color-ink-mid]">
        Our powerful calculators are built for contractors. Sign up to start creating estimates and unlock the full suite of tools.
      </p>
      <Link
        href={"/sign-up" as Route}
        className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        Sign Up &amp; Get Started
      </Link>
    </div>
  );
}

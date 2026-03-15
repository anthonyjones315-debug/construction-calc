"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-brand rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">P</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-wide">
            Pro Construction Calc
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-brand/10">
            <svg
              className="w-7 h-7 text-orange-brand"
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
          <h1 className="text-white font-semibold text-xl mb-2">
            Something went wrong
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            An unexpected error occurred. Your calculation data is safe. Try
            refreshing the page.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-4 py-2.5 bg-orange-brand hover:bg-orange-dark text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              Go to Home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-4 text-xs text-slate-600">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

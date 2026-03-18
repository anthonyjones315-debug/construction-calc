"use client";

import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const lowerMessage = error.message.toLowerCase();
    const isMathIntegrityError =
      lowerMessage.includes("check constraint") ||
      lowerMessage.includes("check violation") ||
      lowerMessage.includes("total_cents");

    Sentry.captureException(error, {
      tags: {
        global_boundary: "true",
        math_integrity: String(isMathIntegrityError),
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  const userFacing = getUserFacingErrorDetails(error, {
    title: "The app hit a system error",
    message:
      "We couldn’t finish loading the app. Try again, and if the problem sticks around send us a backup report.",
  });

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="flex flex-col items-center text-center max-w-md">
            <TriangleAlert className="h-12 w-12 text-red-500 mb-4" aria-hidden />
            <h1 className="text-xl font-black uppercase tracking-wide">
              {userFacing.title}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              {userFacing.message}
            </p>
            {error.digest ? (
              <p className="mt-2 text-xs text-slate-500">
                Reference: {error.digest}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Try Again
              </button>
              <ManualErrorReportButton
                error={error}
                source="global-error-boundary"
                buttonLabel="Report Issue"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-500"
              />
            </div>
            <a
              href="/"
              className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition"
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

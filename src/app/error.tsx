"use client";

import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const eventIdRef = useRef<string | null>(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    if (id) eventIdRef.current = id;
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-950 text-slate-200 px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <TriangleAlert className="h-12 w-12 text-red-500 mb-4" aria-hidden />
        <h1 className="text-xl font-black uppercase tracking-wide">
          System Error Detected
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          An unexpected error occurred in the calculation engine. Our engineering
          team has been notified.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() =>
              Sentry.showReportDialog(
                eventIdRef.current
                  ? { eventId: eventIdRef.current }
                  : undefined,
              )
            }
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-500"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const userFacing = getUserFacingErrorDetails(error, {
    title: "Something went wrong",
    message:
      "We hit a problem loading this part of the app. Try again, and if it keeps happening send us a report.",
  });

  return (
    <div className="animated-gradient-bg flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-copy-primary">
      <div className="glass-container-elevated relative max-w-lg overflow-hidden p-8 text-center">
        <div
          aria-hidden
          className="glass-decorative absolute inset-x-0 top-0 h-32"
          style={{
            background:
              "radial-gradient(circle at top, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 56%)",
          }}
        />
        <div className="relative flex flex-col items-center">
          <TriangleAlert className="mb-4 h-12 w-12 text-red-400" aria-hidden />
          <h1 className="text-xl font-black uppercase tracking-wide text-copy-primary">
            {userFacing.title}
          </h1>
          <p className="mt-3 text-sm text-copy-secondary">
            {userFacing.message}
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-copy-tertiary">
              Reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="glass-button px-4 py-2 text-sm font-medium"
            >
              Try Again
            </button>
            <ManualErrorReportButton
              error={error}
              source="app-error-boundary"
              buttonLabel="Report Issue"
              className="glass-button-primary px-4 py-2 text-sm font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

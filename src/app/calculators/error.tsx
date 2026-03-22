"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";

export default function CalcError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const userFacing = getUserFacingErrorDetails(error, {
    title: "Calculator error",
    message:
      "The calculator hit a problem finishing the math. Your data is safe, so try again or send us a report if it keeps happening.",
  });

  return (
    <div className="glass-container-elevated mx-auto flex max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-600" />
      </div>
      <h2 className="mb-2 text-lg font-bold text-copy-primary">
        {userFacing.title}
      </h2>
      <p className="mb-6 max-w-xs text-sm text-copy-secondary">
        {userFacing.message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="glass-button-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <ManualErrorReportButton
          error={error}
          source="calculator-route-error"
          className="px-5 py-2.5 text-sm font-bold"
        />
      </div>
      <a
        href="/calculators"
        className="mt-4 inline-block rounded-xl border border-[--color-border] px-5 py-2.5 text-sm font-medium text-[--color-ink-dim] hover:text-[--color-ink] transition"
      >
        Back to Calculators
      </a>
    </div>
  );
}

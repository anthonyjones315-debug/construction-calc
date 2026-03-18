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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-[--color-ink] mb-2">
        {userFacing.title}
      </h2>
      <p className="text-sm text-[--color-ink-dim] mb-6 max-w-xs">
        {userFacing.message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[--color-orange-brand] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <ManualErrorReportButton
          error={error}
          source="calculator-route-error"
          className="rounded-xl border border-[--color-orange-brand]/40 px-5 py-2.5 text-sm font-bold text-[--color-orange-brand]"
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

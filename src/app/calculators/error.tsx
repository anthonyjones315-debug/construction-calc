"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function CalcError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  void error;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-[--color-ink] mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-[--color-ink-dim] mb-6 max-w-xs">
        The calculator hit an error. Your data is safe — try refreshing.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-[--color-orange-brand] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}

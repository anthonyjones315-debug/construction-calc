"use client";

import type { ReactNode } from "react";

type Result = {
  label: string;
  value: string;
  unit: string;
};

type ProResultProps = {
  primary: Result;
  secondary: Result[];
  primaryUnitDisplay: string;
  localTip?: string | null;
  materialList: string[];
  onCopyOrder?: () => void;
  onFinalize?: () => void;
  finalizeLabel?: string;
  finalizeIcon?: ReactNode;
};

export function ProResult({
  primary,
  secondary,
  primaryUnitDisplay,
  localTip,
  materialList,
  onCopyOrder,
  onFinalize,
  finalizeLabel = "Finalize & Send",
  finalizeIcon,
}: ProResultProps) {
  return (
    <section className="flex min-h-[180px] flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
          Results
        </h2>
        {primary.label === "Total Yards" ? (
          <span className="text-xs text-[--color-nav-text]/80">
            (Length × Width × Depth) ÷ 27
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-[--color-orange-brand]/40 bg-black/40 p-3 shadow-[0_10px_22px_rgba(247,148,29,0.14)]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
            {primary.label}
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-orange-500">
            {primary.value}{" "}
            <span className="font-black tabular-nums tracking-tight text-white">
              {primaryUnitDisplay}
            </span>
          </p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
            {primary.unit}
          </p>
        </div>

        {secondary.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {secondary.map((result) => (
              <div
                key={result.label}
                className="rounded-xl border border-white/15 bg-black/30 p-3"
              >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
                  {result.label}
                </p>
                <p className="mt-1 text-lg font-black tabular-nums tracking-tight text-orange-400">
                  {result.value}
                </p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-[--color-nav-text]/80">
                  {result.unit}
                </p>
              </div>
            ))}
          </div>
        )}

        {localTip ? (
          <div className="rounded-xl border border-[--color-orange-brand]/35 bg-[--color-orange-brand]/10 p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
              Pro Tip
            </h3>
            <p className="mt-1 text-sm text-[--color-nav-text]/92">{localTip}</p>
          </div>
        ) : null}

        <div className="rounded-xl border border-white/15 bg-black/25 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">
              Material List
            </h3>
            {onCopyOrder ? (
              <button
                type="button"
                onClick={onCopyOrder}
                className="inline-flex min-h-7 items-center gap-1 rounded-lg border border-white/25 px-2 py-1 text-xs font-bold uppercase tracking-widest text-[--color-nav-text] transition-all duration-200 hover:border-orange-400 hover:text-white active:scale-[0.98]"
              >
                Copy
              </button>
            ) : null}
          </div>
          <ul className="mt-1.5 space-y-1 text-xs text-[--color-nav-text]/90">
            {materialList.map((line) => (
              <li key={line} className="font-medium tabular-nums tracking-tight">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {onFinalize ? (
        <button
          type="button"
          onClick={onFinalize}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-orange-400/80 bg-transparent px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-orange-400 hover:text-white active:scale-[0.98]"
        >
          {finalizeIcon}
          {finalizeLabel}
        </button>
      ) : null}
    </section>
  );
}


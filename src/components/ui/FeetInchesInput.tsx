"use client";

import * as React from "react";

export type FeetInchesInputProps = {
  label: string;
  subLabel?: string;
  helpText?: string;
  id?: string;
  autoFocus?: boolean;
} & (
  | {
      /** Legacy decimal-feet API used by most calculators */
      value: string | number;
      onChange: (next: string) => void;
      min?: number;
      max?: number;
      feet?: never;
      inches?: never;
      onFeetChange?: never;
      onInchesChange?: never;
      minFeet?: never;
      maxFeet?: never;
      minInches?: never;
      maxInches?: never;
    }
  | {
      /** Explicit feet/inches API used by slab calculator */
      feet: number | "";
      inches: number | "";
      onFeetChange: (feet: number | "") => void;
      onInchesChange: (inches: number | "") => void;
      minFeet?: number;
      maxFeet?: number;
      minInches?: number;
      maxInches?: number;
      value?: never;
      onChange?: never;
      min?: never;
      max?: never;
    }
);

/** Standard construction fractions in sixteenths */
const FRACTION_OPTIONS: { label: string; value: number }[] = [
  { label: "–",     value: 0 },
  { label: "1/16",  value: 1 / 16 },
  { label: "1/8",   value: 1 / 8 },
  { label: "3/16",  value: 3 / 16 },
  { label: "1/4",   value: 1 / 4 },
  { label: "5/16",  value: 5 / 16 },
  { label: "3/8",   value: 3 / 8 },
  { label: "7/16",  value: 7 / 16 },
  { label: "1/2",   value: 1 / 2 },
  { label: "9/16",  value: 9 / 16 },
  { label: "5/8",   value: 5 / 8 },
  { label: "11/16", value: 11 / 16 },
  { label: "3/4",   value: 3 / 4 },
  { label: "13/16", value: 13 / 16 },
  { label: "7/8",   value: 7 / 8 },
  { label: "15/16", value: 15 / 16 },
];

/** Snap a decimal inch remainder to the nearest 1/16 fraction option index */
function nearestFractionIndex(remainder: number): number {
  let bestIdx = 0;
  let bestDist = Math.abs(remainder);
  for (let i = 1; i < FRACTION_OPTIONS.length; i++) {
    const dist = Math.abs(remainder - FRACTION_OPTIONS[i].value);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function toFeetInchesFraction(decimal: number): {
  feet: number;
  wholeInches: number;
  fractionIndex: number;
} {
  if (!Number.isFinite(decimal) || decimal <= 0)
    return { feet: 0, wholeInches: 0, fractionIndex: 0 };
  const feet = Math.floor(decimal);
  const totalInches = (decimal - feet) * 12;
  const wholeInches = Math.floor(totalInches);
  const remainder = totalInches - wholeInches;
  const fractionIndex = nearestFractionIndex(remainder);
  // If fraction rounds up to 1, carry over
  if (fractionIndex === 0 && remainder > 0.96875) {
    return { feet, wholeInches: wholeInches + 1, fractionIndex: 0 };
  }
  return { feet, wholeInches, fractionIndex };
}

export function FeetInchesInput(props: FeetInchesInputProps) {
  const { label, subLabel, helpText, id, autoFocus } = props;

  const reactGeneratedId = React.useId();
  const fieldId = id ?? reactGeneratedId;
  const labelId = `${fieldId}-label`;

  // Determine which API is in use
  const isExplicitMode = "feet" in props && props.feet !== undefined;

  let feet: number;
  let wholeInches: number;
  let fractionIndex: number;
  let isValid: boolean;
  let handleFeetChange: (val: number) => void;
  let handleWholeInchesChange: (val: number) => void;
  let handleFractionChange: (idx: number) => void;

  if (isExplicitMode) {
    const p = props as Extract<FeetInchesInputProps, { feet: number | "" }>;
    feet = p.feet === "" ? 0 : p.feet;
    const rawInches = p.inches === "" ? 0 : p.inches;
    wholeInches = Math.floor(rawInches);
    fractionIndex = nearestFractionIndex(rawInches - wholeInches);
    isValid = true;

    handleFeetChange = (val) => p.onFeetChange(val);
    handleWholeInchesChange = (val) => {
      p.onInchesChange(val + FRACTION_OPTIONS[fractionIndex].value);
    };
    handleFractionChange = (idx) => {
      p.onInchesChange(wholeInches + FRACTION_OPTIONS[idx].value);
    };
  } else {
    const p = props as Extract<FeetInchesInputProps, { value: string | number }>;
    const numericValue =
      typeof p.value === "number"
        ? p.value
        : Number.parseFloat(String(p.value));
    const parsed = toFeetInchesFraction(numericValue);
    feet = parsed.feet;
    wholeInches = parsed.wholeInches;
    fractionIndex = parsed.fractionIndex;
    isValid = Number.isFinite(numericValue) && numericValue > 0;

    const emitCombined = (
      nextFeet: number,
      nextWholeInches: number,
      nextFracIdx: number,
    ) => {
      const totalInches =
        Math.max(0, nextWholeInches) + FRACTION_OPTIONS[nextFracIdx].value;
      let total = Math.max(0, nextFeet) + totalInches / 12;
      if (p.min != null && total < p.min) total = p.min;
      if (p.max != null && total > p.max) total = p.max;
      p.onChange(String(Math.round(total * 10000) / 10000));
    };
    handleFeetChange = (val) =>
      emitCombined(val, wholeInches, fractionIndex);
    handleWholeInchesChange = (val) =>
      emitCombined(feet, val, fractionIndex);
    handleFractionChange = (idx) =>
      emitCombined(feet, wholeInches, idx);
  }

  return (
    <label
      className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary"
      htmlFor={`${fieldId}-ft`}
    >
      <span className="flex items-center justify-between gap-2">
        <span id={labelId} className="truncate">
          {label}
        </span>
        {subLabel ? (
          <span className="text-[10px] font-normal normal-case text-copy-tertiary lg:hidden">
            {subLabel}
          </span>
        ) : null}
      </span>
      {helpText ? (
        <span className="text-[10px] font-normal normal-case text-copy-tertiary lg:hidden">
          {helpText}
        </span>
      ) : null}
      <div
        data-valid={isValid ? "true" : "false"}
        className="glass-input-shell relative flex min-h-[3.5rem] items-stretch overflow-hidden rounded-xl p-0"
      >
        {/* ── Feet ── */}
        <input
          id={`${fieldId}-ft`}
          type="number"
          value={feet}
          onChange={(e) => {
            handleFeetChange(Number.parseInt(e.target.value, 10) || 0);
          }}
          min={0}
          step={1}
          autoFocus={autoFocus}
          inputMode="numeric"
          enterKeyHint="next"
          aria-labelledby={labelId}
          aria-label={`${label} feet`}
          className="glass-input flex-1 rounded-none border-0 bg-transparent px-3 text-sm tabular-nums tracking-tight text-field-input shadow-none"
        />
        <div className="flex items-center border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary">
          ft
        </div>

        {/* ── Whole Inches ── */}
        <input
          id={`${fieldId}-in`}
          type="number"
          value={wholeInches}
          onChange={(e) => {
            handleWholeInchesChange(
              Number.parseInt(e.target.value, 10) || 0,
            );
          }}
          min={0}
          step={1}
          inputMode="numeric"
          enterKeyHint="next"
          aria-labelledby={labelId}
          aria-label={`${label} inches`}
          className="glass-input flex-1 rounded-none border-0 border-l border-[--color-border] bg-transparent px-3 text-sm tabular-nums tracking-tight text-field-input shadow-none"
        />
        <div className="flex items-center border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary">
          in
        </div>

        {/* ── Fractional Inches ── */}
        <select
          id={`${fieldId}-frac`}
          value={fractionIndex}
          onChange={(e) => {
            handleFractionChange(Number.parseInt(e.target.value, 10));
          }}
          aria-labelledby={labelId}
          aria-label={`${label} fractional inches`}
          className="glass-input w-16 min-w-0 shrink-0 appearance-none rounded-none border-0 border-l border-[--color-border] bg-transparent px-1.5 text-center text-xs tabular-nums tracking-tight text-field-input shadow-none"
        >
          {FRACTION_OPTIONS.map((opt, i) => (
            <option key={i} value={i}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex shrink-0 items-center border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary">
          &quot;
        </div>
      </div>
    </label>
  );
}

// Utility to convert feet/inches to decimal feet
export function feetInchesToDecimal(feet: number, inches: number): number {
  return feet + inches / 12;
}

// Utility to split decimal feet to feet/inches
export function decimalToFeetInches(decimal: number): {
  feet: number;
  inches: number;
} {
  const f = Math.floor(decimal);
  const i = Math.round((decimal - f) * 12);
  return { feet: f, inches: i };
}

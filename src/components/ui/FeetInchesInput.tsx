"use client";

import * as React from "react";

type FeetInchesInputProps = {
  label: string;
  subLabel?: string;
  helpText?: string;
  value: string | number;
  onChange: (next: string) => void;
  min?: number;
  max?: number;
  id?: string;
  autoFocus?: boolean;
};

function decimalToFeetInches(decimal: number): { feet: number; inches: number } {
  if (!Number.isFinite(decimal) || decimal <= 0) return { feet: 0, inches: 0 };
  const feet = Math.floor(decimal);
  const inches = Math.round((decimal - feet) * 12 * 10) / 10;
  // Handle rounding to 12 inches
  if (inches >= 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}

export function FeetInchesInput({
  label,
  subLabel,
  helpText,
  value,
  onChange,
  min,
  max,
  id,
  autoFocus,
}: FeetInchesInputProps) {
  const reactGeneratedId = React.useId();
  const fieldId = id ?? reactGeneratedId;
  const labelId = `${fieldId}-label`;

  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  const { feet, inches } = decimalToFeetInches(numericValue);
  const isValid = Number.isFinite(numericValue) && numericValue > 0;

  function emitCombined(nextFeet: number, nextInches: number) {
    const clampedInches = Math.min(Math.max(0, nextInches), 11.99);
    let total = Math.max(0, nextFeet) + clampedInches / 12;
    if (min != null && total < min) total = min;
    if (max != null && total > max) total = max;
    // Round to avoid floating point noise
    onChange(String(Math.round(total * 10000) / 10000));
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
        {/* Feet input */}
        <input
          id={`${fieldId}-ft`}
          type="number"
          value={feet}
          onChange={(e) => {
            const nextFeet = Number.parseInt(e.target.value, 10) || 0;
            emitCombined(nextFeet, inches);
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

        {/* Inches input */}
        <input
          id={`${fieldId}-in`}
          type="number"
          value={inches}
          onChange={(e) => {
            const nextInches = Number.parseFloat(e.target.value) || 0;
            emitCombined(feet, nextInches);
          }}
          min={0}
          max={11.99}
          step={0.5}
          inputMode="decimal"
          enterKeyHint="done"
          aria-labelledby={labelId}
          aria-label={`${label} inches`}
          className="glass-input flex-1 rounded-none border-0 border-l border-[--color-border] bg-transparent px-3 text-sm tabular-nums tracking-tight text-field-input shadow-none"
        />
        <div className="flex items-center border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary">
          in
        </div>
      </div>
    </label>
  );
}

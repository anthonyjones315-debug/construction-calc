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

function toFeetInches(decimal: number): { feet: number; inches: number } {
  if (!Number.isFinite(decimal) || decimal <= 0) return { feet: 0, inches: 0 };
  const feet = Math.floor(decimal);
  const inches = Math.round((decimal - feet) * 12 * 10) / 10;
  if (inches >= 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}

export function FeetInchesInput(props: FeetInchesInputProps) {
  const {
    label,
    subLabel,
    helpText,
    id,
    autoFocus,
  } = props;

  const reactGeneratedId = React.useId();
  const fieldId = id ?? reactGeneratedId;
  const labelId = `${fieldId}-label`;

  // Determine which API is in use
  const isExplicitMode = "feet" in props && props.feet !== undefined;

  let feet: number;
  let inches: number;
  let isValid: boolean;
  let handleFeetChange: (val: number) => void;
  let handleInchesChange: (val: number) => void;

  if (isExplicitMode) {
    const p = props as Extract<FeetInchesInputProps, { feet: number | "" }>;
    feet = p.feet === "" ? 0 : p.feet;
    inches = p.inches === "" ? 0 : p.inches;
    isValid = true;
    handleFeetChange = (val) => p.onFeetChange(val);
    handleInchesChange = (val) => p.onInchesChange(val);
  } else {
    const p = props as Extract<FeetInchesInputProps, { value: string | number }>;
    const numericValue =
      typeof p.value === "number" ? p.value : Number.parseFloat(String(p.value));
    const parsed = toFeetInches(numericValue);
    feet = parsed.feet;
    inches = parsed.inches;
    isValid = Number.isFinite(numericValue) && numericValue > 0;

    const emitCombined = (nextFeet: number, nextInches: number) => {
      const safeInches = Math.max(0, nextInches);
      let total = Math.max(0, nextFeet) + safeInches / 12;
      if (p.min != null && total < p.min) total = p.min;
      if (p.max != null && total > p.max) total = p.max;
      p.onChange(String(Math.round(total * 10000) / 10000));
    };
    handleFeetChange = (val) => emitCombined(val, inches);
    handleInchesChange = (val) => emitCombined(feet, val);
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
        <input
          id={`${fieldId}-in`}
          type="number"
          value={inches}
          onChange={(e) => {
            handleInchesChange(Number.parseFloat(e.target.value) || 0);
          }}
          min={0}
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

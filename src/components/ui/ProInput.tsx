"use client";

import * as React from "react";

type ProInputProps = {
  label: string;
  subLabel?: string;
  helpText?: string;
  type?: "number" | "text";
  value: string | number;
  onChange: (next: string) => void;
  min?: number;
  max?: number;
  step?: number;
  unitSuffix?: string;
  unitSelectOptions?: { value: string; label: string }[];
  unitSelectValue?: string;
  onUnitSelectChange?: (next: string) => void;
  /** Optional explicit id for the underlying input/select. */
  id?: string;
};

export function ProInput({
  label,
  subLabel,
  helpText,
  type = "number",
  value,
  onChange,
  min,
  max,
  step,
  unitSuffix,
  unitSelectOptions,
  unitSelectValue,
  onUnitSelectChange,
  id,
}: ProInputProps) {
  const hasSelect = unitSelectOptions && unitSelectOptions.length > 0;
  const reactGeneratedId = React.useId();
  const fieldId = id ?? reactGeneratedId;
  const labelId = `${fieldId}-label`;

  return (
    <label
      className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80"
      htmlFor={fieldId}
    >
      <span className="flex items-center justify-between gap-2">
        <span id={labelId} className="truncate">
          {label}
        </span>
        {subLabel ? (
          <span className="text-[10px] font-normal normal-case text-[--color-nav-text]/70">
            {subLabel}
          </span>
        ) : null}
      </span>
      {helpText ? (
        <span className="text-[10px] font-normal normal-case text-[--color-nav-text]/65">
          {helpText}
        </span>
      ) : null}
      <div className="relative flex h-14 min-h-[56px] items-stretch overflow-hidden rounded-xl border border-slate-500 bg-slate-900 text-sm text-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500">
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          max={max}
          step={step}
          aria-labelledby={labelId}
          className="flex-1 bg-transparent px-3 text-sm tabular-nums tracking-tight outline-none"
        />
        {hasSelect ? (
          <select
            aria-labelledby={labelId}
            value={unitSelectValue}
            onChange={(event) => onUnitSelectChange?.(event.target.value)}
            className="h-full border-l border-slate-700 bg-slate-900 px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-[--color-nav-text]/80 outline-none"
          >
            {unitSelectOptions!.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : unitSuffix ? (
          <div className="flex items-center border-l border-slate-700 bg-slate-900 px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-[--color-nav-text]/80">
            {unitSuffix}
          </div>
        ) : null}
      </div>
    </label>
  );
}


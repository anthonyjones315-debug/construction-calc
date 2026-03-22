import React from "react";

export interface FeetInchesInputProps {
  label: string;
  feet: number | "";
  inches: number | "";
  onFeetChange: (feet: number | "") => void;
  onInchesChange: (inches: number | "") => void;
  minFeet?: number;
  maxFeet?: number;
  minInches?: number;
  maxInches?: number;
  helpText?: string;
  id?: string;
}

export function FeetInchesInput({
  label,
  feet,
  inches,
  onFeetChange,
  onInchesChange,
  minFeet = 0,
  maxFeet = 1000,
  minInches = 0,
  maxInches = 11,
  helpText,
  id,
}: FeetInchesInputProps) {
  const feetId = id ? `${id}-feet` : undefined;
  const inchesId = id ? `${id}-inches` : undefined;
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary">
      <span>{label}</span>
      {helpText ? (
        <span className="text-[10px] font-normal normal-case text-copy-tertiary">
          {helpText}
        </span>
      ) : null}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          id={feetId}
          min={minFeet}
          max={maxFeet}
          value={feet}
          onChange={(e) => {
            const val =
              e.target.value === "" ? "" : parseInt(e.target.value, 10);
            onFeetChange(val);
          }}
          className="glass-input w-16 rounded-xl border border-[--color-border] bg-transparent px-2 text-sm tabular-nums tracking-tight text-field-input"
          placeholder="ft"
          aria-label="Feet"
        />
        <span className="text-xs">ft</span>
        <input
          type="number"
          id={inchesId}
          min={minInches}
          max={maxInches}
          value={inches}
          onChange={(e) => {
            const val =
              e.target.value === "" ? "" : parseInt(e.target.value, 10);
            if (
              val !== "" &&
              typeof val === "number" &&
              (val < minInches || val > maxInches)
            )
              return;
            onInchesChange(val);
          }}
          className="glass-input w-12 rounded-xl border border-[--color-border] bg-transparent px-2 text-sm tabular-nums tracking-tight text-field-input"
          placeholder="in"
          aria-label="Inches"
        />
        <span className="text-xs">in</span>
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
  const feet = Math.floor(decimal);
  const inches = Math.round((decimal - feet) * 12);
  return { feet, inches };
}

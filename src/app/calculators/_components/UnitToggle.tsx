"use client";

import { triggerHaptic } from "@/hooks/useHaptic";

type UnitToggleOption<T extends string> = {
  value: T;
  label: string;
};

type UnitToggleProps<T extends string> = {
  label: string;
  value: T;
  options: UnitToggleOption<T>[];
  onChange: (next: T) => void;
};

export function UnitToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: UnitToggleProps<T>) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/75">
        {label}
      </p>
      <div className="inline-flex rounded-full border border-[--color-border] bg-[--color-surface-alt] p-0.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                triggerHaptic([10]);
                onChange(option.value);
              }}
              className={`min-h-8 rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
                active
                  ? "border-[--color-blue-brand] bg-[--color-blue-soft] text-[--color-blue-brand]"
                  : "border-transparent text-[--color-ink-mid] hover:border-[--color-border-strong] hover:text-[--color-ink]"
              }`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

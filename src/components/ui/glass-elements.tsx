"use client";

import * as React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

/**
 * Cache Intl.NumberFormat instances to avoid expensive re-allocation
 * during high-frequency animation frames.
 */
const formatterCache = new Map<number, Intl.NumberFormat>();

function getFormatter(decimals: number) {
  if (!formatterCache.has(decimals)) {
    formatterCache.set(
      decimals,
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    );
  }
  return formatterCache.get(decimals)!;
}

function getAnimatedNumberMeta(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?[\d,.]+)(.*)$/);

  if (!match) return null;

  const numericPart = match[1].replaceAll(",", "");
  const parsed = Number(numericPart);

  if (!Number.isFinite(parsed)) return null;

  const decimalPart = numericPart.split(".")[1];

  return {
    parsed,
    decimals: decimalPart ? decimalPart.length : 0,
    suffix: match[2] ?? "",
  };
}

function useAnimatedDisplayValue(value: string, duration = 320) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValueRef = React.useRef(value);

  React.useEffect(() => {
    const previousMeta = getAnimatedNumberMeta(previousValueRef.current);
    const nextMeta = getAnimatedNumberMeta(value);

    if (!previousMeta || !nextMeta || previousMeta.suffix !== nextMeta.suffix) {
      previousValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = previousMeta.parsed;
    const to = nextMeta.parsed;
    const decimals = Math.max(previousMeta.decimals, nextMeta.decimals);

    if (from === to) {
      previousValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      const current = from + (to - from) * eased;
      const formatted = getFormatter(decimals).format(current);

      setDisplayValue(`${formatted}${nextMeta.suffix}`);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
        previousValueRef.current = value;
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, value]);

  return displayValue;
}

function AnimatedResultValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const animatedValue = useAnimatedDisplayValue(value);

  return (
    <span
      className={cx("result-counter", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {animatedValue}
    </span>
  );
}

type GlassSurfaceTone = "default" | "elevated" | "deep";

type GlassSurfaceProps = ComponentPropsWithoutRef<"div"> & {
  tone?: GlassSurfaceTone;
};

export function GlassSurface({
  tone = "default",
  className,
  ...props
}: GlassSurfaceProps) {
  return (
    <div
      className={cx(
        tone === "default" && "glass-container",
        tone === "elevated" && "glass-container-elevated",
        tone === "deep" && "glass-container-deep",
        className,
      )}
      {...props}
    />
  );
}

type GlassButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "secondary" | "primary";
};

export function GlassButton({
  variant = "secondary",
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cx(
        variant === "primary" ? "glass-button-primary" : "glass-button",
        className,
      )}
      {...props}
    />
  );
}

type GlassIconBadgeProps = ComponentPropsWithoutRef<"div"> & {
  tone?: "primary" | "surface";
};

export function GlassIconBadge({
  tone = "primary",
  className,
  ...props
}: GlassIconBadgeProps) {
  return (
    <div
      className={cx(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        tone === "primary" && "bg-primary/12 text-primary",
        tone === "surface" && "glass-panel-deep text-primary",
        className,
      )}
      {...props}
    />
  );
}

export function GlassFeatureItem({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cx(
        "glass-panel flex items-center gap-2 px-3 py-2 text-xs text-[--color-ink-mid]",
        className,
      )}
      {...props}
    />
  );
}

export function GlassDialogFrame({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cx("glass-modal relative", className)} {...props}>
      {children}
    </div>
  );
}

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
  id?: string;
  autoFocus?: boolean;
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
  autoFocus,
}: ProInputProps) {
  const hasSelect = unitSelectOptions && unitSelectOptions.length > 0;
  const reactGeneratedId = React.useId();
  const fieldId = id ?? reactGeneratedId;
  const labelId = `${fieldId}-label`;
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  const isValid =
    type === "number" && Number.isFinite(numericValue) && numericValue > 0;

  return (
    <label
      className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary"
      htmlFor={fieldId}
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
          id={fieldId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          inputMode={type === "number" ? "decimal" : undefined}
          enterKeyHint="done"
          aria-labelledby={labelId}
          className="glass-input flex-1 rounded-none border-0 bg-transparent px-3 text-sm tabular-nums tracking-tight text-field-input shadow-none"
        />
        {hasSelect ? (
          <select
            aria-labelledby={labelId}
            value={unitSelectValue}
            onChange={(event) => onUnitSelectChange?.(event.target.value)}
            className="border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary outline-none"
          >
            {unitSelectOptions!.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : unitSuffix ? (
          <div className="flex items-center border-l border-[--color-border] bg-[--color-surface-alt] px-2 text-[11px] font-semibold uppercase tabular-nums tracking-tight text-copy-secondary">
            {unitSuffix}
          </div>
        ) : null}
      </div>
    </label>
  );
}

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
  containerClassName?: string;
};

export function ProResult({
  primary,
  secondary,
  primaryUnitDisplay,
  localTip,
  materialList,
  onCopyOrder,
  onFinalize,
  finalizeLabel = "Finalize Estimate",
  finalizeIcon,
  containerClassName = "glass-container-elevated",
}: ProResultProps) {
  return (
    <section
      className={`${containerClassName} relative flex min-h-[180px] flex-col gap-2 p-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-[0.12em] text-display-heading">
          Results
        </h2>
        {primary.label === "Total Yards" ? (
          <span className="text-xs text-copy-secondary">
            (Length × Width × Depth) ÷ 27
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="glass-panel border-primary/30 bg-[--color-blue-soft] shadow-[0_10px_22px_rgb(var(--color-primary-rgb)/0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-copy-secondary">
            {primary.label}
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-primary">
            <AnimatedResultValue value={primary.value} />{" "}
            <span className="font-black tabular-nums tracking-tight text-[--color-ink]">
              {primaryUnitDisplay}
            </span>
          </p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary">
            {primary.unit}
          </p>
        </div>

        {secondary.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {secondary.map((result) => (
              <div
                key={result.label}
                className="glass-panel bg-[--color-surface-alt] p-3"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-copy-secondary">
                  {result.label}
                </p>
                <p className="mt-1 text-lg font-black tabular-nums tracking-tight text-primary">
                  <AnimatedResultValue value={result.value} />
                </p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-copy-secondary">
                  {result.unit}
                </p>
              </div>
            ))}
          </div>
        )}

        {localTip ? (
          <div className="glass-panel border-primary/25 bg-[--color-blue-soft] p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Pro Tip
            </h3>
            <p className="mt-1 text-sm text-[--color-ink-mid]">{localTip}</p>
          </div>
        ) : null}

        <div className="glass-panel bg-[--color-surface-alt] p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[--color-ink-mid]">
              Material List
            </h3>
            {onCopyOrder ? (
              <GlassButton
                type="button"
                onClick={onCopyOrder}
                className="min-h-7 rounded-lg border-[--color-border] px-2 py-1 text-xs font-bold uppercase tracking-widest text-copy-secondary hover:border-primary/40"
              >
                Copy
              </GlassButton>
            ) : null}
          </div>
          <ul className="mt-1.5 space-y-1 text-xs text-[--color-ink]">
            {materialList.map((line) => (
              <li
                key={line}
                className="font-medium tabular-nums tracking-tight"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {onFinalize ? (
        <GlassButton
          type="button"
          variant="primary"
          onClick={onFinalize}
          className="min-h-10 w-full rounded-xl text-[11px] font-bold uppercase tracking-[0.12em]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {finalizeIcon}
            {finalizeLabel}
          </span>
        </GlassButton>
      ) : null}
    </section>
  );
}

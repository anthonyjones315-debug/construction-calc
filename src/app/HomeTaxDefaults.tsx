"use client";

import Link from "next/link";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
import { useStore } from "@/lib/store";
import { routes } from "@routes";

const TRI_COUNTY_TAX_RATES = ["Oneida", "Madison", "Herkimer"]
  .map((county) => {
    const match = NYS_COUNTY_TAX_RATES.find((entry) => entry.county === county);
    return {
      county,
      combinedRate: match?.combinedRate ?? 0,
    };
  })
  .filter((entry) => entry.combinedRate > 0);

export function HomeTaxDefaults() {
  const taxRate = useStore((state) => state.taxRate);
  const setTaxRate = useStore((state) => state.setTaxRate);

  return (
    <div className="home-tax-panel mt-4 rounded-2xl border border-[--color-orange-rim] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-orange-brand)_12%,transparent),var(--color-surface)_55%)] px-4 py-4 lg:mt-3.5 lg:px-3.5 lg:py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[--color-orange-brand]">
            Tri-County Tax Defaults
          </p>
          <p className="home-tax-copy mt-1 text-sm text-[--color-ink-mid]">
            Configure default regional tax rates for automatic application to new estimates and invoices.
          </p>
        </div>
        <Link
          href={routes.guide}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[--color-orange-brand]/35 bg-[--color-surface] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[--color-orange-brand] transition hover:border-[--color-orange-brand]/55 hover:bg-[--color-orange-soft]"
        >
          Tax Compliance Guide
        </Link>
      </div>
      <div className="home-tax-grid mt-3 grid gap-2 sm:grid-cols-3">
        {TRI_COUNTY_TAX_RATES.map((entry) => {
          const isActive = Math.abs(entry.combinedRate - taxRate) < 0.0001;

          return (
            <button
              key={entry.county}
              type="button"
              onClick={() => setTaxRate(entry.combinedRate)}
              className={`home-tax-card flex flex-col items-start rounded-xl border px-3 py-3 text-left transition ${
                isActive
                  ? "border-[--color-orange-brand]/50 bg-[--color-orange-soft]"
                  : "border-[--color-border] bg-[--color-surface] hover:border-[--color-orange-rim] hover:bg-[--color-surface-alt]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-mid]">
                  {entry.county}
                </p>
                {isActive ? (
                  <span className="rounded-full bg-[--color-orange-soft] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[--color-orange-brand]">
                    Default
                  </span>
                ) : null}
              </div>
              <p className="home-tax-rate mt-1 text-xl font-black text-[--color-ink]">
                {entry.combinedRate.toFixed(2)}%
              </p>
              <p className="home-tax-copy mt-1 text-xs text-[--color-ink-dim]">
                Combined NYS + local sales tax
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

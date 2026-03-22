"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  ChevronDown,
  Home,
  Layout,
  Sparkles,
  BrickWall,
  Hammer,
  Triangle,
  Thermometer,
  BarChart3,
  Trees,
  Fence,
} from "lucide-react";
import { JsonLD } from "@/seo";
import {
  getTradeCalculators,
  getTradeLandingSchema,
  type TradePageDefinition,
} from "../_lib/trade-pages";
import { getTileCopy } from "../_lib/trade-tile-copy";
import { DefaultGlyph, tradeGlyphMap } from "./TradeGlyphs";

type TradeLandingProps = {
  page: TradePageDefinition;
};

const TILE_ICON_MAP: Record<TradePageDefinition["category"], LucideIcon> = {
  concrete: BrickWall,
  framing: Hammer,
  roofing: Triangle,
  mechanical: Thermometer,
  finish: Layout,
  business: BarChart3,
  insulation: Thermometer,
  management: BarChart3,
  interior: Layout,
  landscape: Trees,
  outdoor: Fence,
};

function usePrefetch(href: Route) {
  const router = useRouter();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            router.prefetch(href);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [href, router]);

  const handlePrefetch = () => router.prefetch(href);
  return { ref, handlePrefetch };
}

function TradeTile({ calculator }: { calculator: TradePageDefinition }) {
  const calculatorHref = calculator.canonicalPath as Route;
  const { ref, handlePrefetch } = usePrefetch(calculatorHref);
  const copy = getTileCopy(calculator.key, calculator);
  const Icon =
    TILE_ICON_MAP[calculator.category as TradePageDefinition["category"]] ??
    Sparkles;

  return (
    <article
      ref={ref}
      className="group relative z-0 flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition-all duration-200 hover:z-10 hover:border-[--color-orange-rim] hover:bg-[--color-orange-soft] hover:-translate-y-0.5 focus-within:z-10 focus-within:-translate-y-0.5"
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      aria-label={`${calculator.title} calculator tile`}
    >
      {/* Header row: icon + kicker/title + open button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
            <Icon
              className="h-5 w-5 text-orange-brand"
              strokeWidth={2.3}
              aria-hidden
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {calculator.heroKicker}
            </p>
            <h3 className="mt-0.5 text-sm font-bold leading-snug text-slate-900">
              {calculator.title}
            </h3>
          </div>
        </div>
        <Link
          href={calculatorHref}
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[--color-orange-rim] bg-[--color-orange-soft] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-orange-dark] transition-colors hover:border-[--color-orange-brand] hover:bg-[--color-orange-brand]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-orange-brand]"
          prefetch={false}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {/* Summary — full text, no clamp */}
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {copy.summary}
      </p>

      {/* Details accordion — pushed to bottom of card */}
      <details className="group/details mt-auto pt-3">
        <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-700 transition-colors hover:border-[--color-orange-rim] hover:bg-[--color-orange-soft] hover:text-[--color-orange-dark]">
          Details
          <ChevronDown
            className="h-3.5 w-3.5 shrink-0 transition-transform group-open/details:rotate-180"
            aria-hidden
          />
        </summary>
        <ul className="mt-2 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-snug text-slate-600">
          <li><span className="font-semibold text-slate-700">Inputs:</span> {copy.bullets.inputs}</li>
          <li><span className="font-semibold text-slate-700">Outputs:</span> {copy.bullets.outputs}</li>
          <li><span className="font-semibold text-slate-700">Compliance:</span> {copy.bullets.compliance}</li>
        </ul>
      </details>
    </article>
  );
}

export function TradeLanding({ page }: TradeLandingProps) {
  const calculators = useMemo(
    () => getTradeCalculators(page.category),
    [page.category],
  );
  const schema = useMemo(
    () => getTradeLandingSchema(page, calculators),
    [page, calculators],
  );

  const Glyph =
    tradeGlyphMap[page.category as keyof typeof tradeGlyphMap] ?? DefaultGlyph;

  const breadcrumbs = useMemo(
    (): Array<{ label: string; href: Route }> => [
      { label: "Home", href: "/" as Route },
      { label: "All Calculators", href: "/calculators" as Route },
      { label: page.title, href: page.canonicalPath as Route },
    ],
    [page.canonicalPath, page.title],
  );

  return (
    <main className="light command-theme page-shell flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg)]">
      <JsonLD schema={schema} />

      <header className="sticky top-[var(--shell-header-h,52px)] z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] text-slate-600">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li
                    key={crumb.href}
                    className="inline-flex items-center gap-2"
                  >
                    {index > 0 ? (
                      <span className="text-slate-400">/</span>
                    ) : null}
                    <Link
                      href={crumb.href}
                      className={`transition-colors ${
                        isLast
                          ? "font-semibold text-slate-900"
                          : "text-slate-500 hover:text-[--color-orange-brand]"
                      }`}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          <Link
            href={"/calculators" as Route}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[--color-orange-rim] hover:bg-[--color-orange-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-orange-brand]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            All Calculators
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-6 lg:pt-4 lg:pb-5">
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:gap-6 sm:px-6">
          <Glyph className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-brand">
              Trade Calculators
            </p>
            <h1 className="text-[clamp(22px,3vw,30px)] font-black leading-tight text-slate-900">
              {page.title}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              {page.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-rim] bg-[--color-orange-soft] px-3 py-1 text-[--color-orange-dark]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {page.heroKicker}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {page.localFocus}
              </span>
            </div>
          </div>
          <div className="hidden max-w-[220px] shrink-0 text-xs leading-relaxed text-slate-600 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-brand">
              Pro Tip
            </p>
            <p className="mt-1 leading-relaxed">{page.proTip}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pick a calculator
          </p>

          {/* Card grid — tiles size independently, details expand in-place */}
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calculator) => (
              <TradeTile key={calculator.key} calculator={calculator} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

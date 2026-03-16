"use client";

import Link from "next/link";
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
};

function usePrefetch(href: string) {
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
  const { ref, handlePrefetch } = usePrefetch(calculator.canonicalPath);
  const copy = getTileCopy(calculator.key, calculator);
  const Icon =
    TILE_ICON_MAP[calculator.category as TradePageDefinition["category"]] ??
    Sparkles;

  return (
    <article
      ref={ref}
      className="group relative snap-start rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(247,148,29,0.14),transparent_55%),linear-gradient(160deg,#0d0f16,#0b101a)] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus-within:-translate-y-0.5"
      style={{ minHeight: "228px", minWidth: "18rem" }}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      aria-label={`${calculator.title} calculator tile`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 shadow-inner">
            <Icon
              className="h-6 w-6 text-[--color-orange-brand]"
              strokeWidth={2.3}
              aria-hidden
            />
            <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(247,148,29,0.16),transparent_60%)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
              {calculator.heroKicker}
            </p>
            <h3 className="text-sm font-bold leading-snug text-white line-clamp-1">
              {calculator.title}
            </h3>
          </div>
        </div>
        <Link
          href={calculator.canonicalPath}
          className="inline-flex items-center gap-1 rounded-full border border-[--color-orange-brand]/40 bg-[--color-orange-brand]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-[--color-orange-brand] hover:bg-[--color-orange-brand]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-orange-brand]"
          prefetch={false}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          Open Calculator
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <p className="mt-2 text-sm leading-snug text-[--color-nav-text] line-clamp-1">
        {copy.summary}
      </p>

      <details className="group/details mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[--color-nav-text]">
        <summary className="flex cursor-pointer items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
          Details
          <ChevronDown className="h-4 w-4 transition-transform group-open/details:rotate-180" aria-hidden />
        </summary>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-[--color-nav-text]">
          <li>{copy.bullets.inputs}</li>
          <li>{copy.bullets.outputs}</li>
          <li>{copy.bullets.compliance}</li>
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
    tradeGlyphMap[
      page.category as keyof typeof tradeGlyphMap
    ] ?? DefaultGlyph;

  const breadcrumbs = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "All Calculators", href: "/calculators" },
      { label: page.title, href: page.canonicalPath },
    ],
    [page.canonicalPath, page.title],
  );

  return (
    <main className="command-theme min-h-screen bg-[--color-bg] text-white">
      <JsonLD schema={schema} />

      <header className="sticky top-10 z-30 border-b border-white/10 bg-[--color-bg]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] text-[--color-nav-text]">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.href} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <span className="text-[--color-nav-text]/50">/</span>
                    ) : null}
                    <Link
                      href={crumb.href}
                      className={`transition-colors ${
                        isLast
                          ? "font-semibold text-white"
                          : "text-[--color-nav-text] hover:text-[--color-orange-brand]"
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
            href="/calculators"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[--color-orange-brand]/50 hover:bg-[--color-orange-brand]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-orange-brand]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            All Calculators
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-6 lg:pt-6">
        <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(247,148,29,0.14),transparent_50%),linear-gradient(120deg,#0d1020,#0b1226)] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.32)] sm:gap-6 sm:px-6">
          <Glyph className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[--color-orange-brand]">
              Trade Calculators
            </p>
            <h1 className="text-[clamp(22px,3vw,30px)] font-black leading-tight text-white">
              {page.title}
            </h1>
            <p className="text-sm leading-snug text-[--color-nav-text] line-clamp-2">
              {page.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/40 bg-[--color-orange-brand]/12 px-3 py-1 text-[--color-orange-brand]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {page.heroKicker}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[--color-nav-text]">
                {page.localFocus}
              </span>
            </div>
          </div>
          <div className="hidden max-w-[220px] text-xs leading-relaxed text-[--color-nav-text]/90 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[--color-orange-brand]">
              Pro Tip
            </p>
            <p className="mt-1 line-clamp-4">{page.proTip}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[--color-nav-text]">
              Pick a calculator — everything fits above the fold
            </p>
            <p className="text-[10px] text-[--color-nav-text]/80">
              Hover or tab to prefetch · keyboard order is linear
            </p>
          </div>

          <div
            className="grid gap-3 md:grid-cols-2 lg:grid-rows-2 lg:grid-flow-col lg:overflow-x-auto lg:pb-3 lg:snap-x lg:snap-mandatory max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory"
            style={{ gridAutoColumns: "minmax(17.5rem,1fr)" }}
          >
            {calculators.map((calculator) => (
              <TradeTile key={calculator.key} calculator={calculator} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

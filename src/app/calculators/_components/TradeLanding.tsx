"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
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
      className="group relative flex h-full min-h-0 flex-col rounded-2xl border border-[--color-border] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[--color-blue-brand]/40 hover:bg-[--color-blue-soft]/20 hover:shadow-md"
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      aria-label={`${calculator.title} calculator tile`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
            {calculator.heroKicker}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-black tracking-tight text-[--color-ink]">
            {calculator.title}
          </h3>
        </div>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[--color-ink-dim]" aria-hidden />
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-[--color-ink-mid]">
        {copy.summary}
      </p>

      <div className="mt-auto pt-5">
        <Link
          href={calculatorHref}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[--color-blue-brand] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[--color-blue-dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-blue-brand]"
          prefetch={false}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          Open Calculator
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
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

  return (
    <main className="light command-theme page-shell flex min-h-0 flex-1 flex-col bg-[var(--color-bg)]">
      <JsonLD schema={schema} />

      <header className="sticky top-0 z-30 border-b border-[--color-border] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <Link
              href={"/calculators" as Route}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-2 text-[--color-ink-dim] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
              aria-label="Back to All Calculators"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <div className="h-4 w-px bg-[--color-border]" aria-hidden />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="hidden rounded-md border border-[--color-blue-brand]/25 bg-[--color-blue-soft] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[--color-blue-brand] sm:inline-block">
                  {page.heroKicker}
                </span>
                <h1 className="truncate text-sm font-black uppercase tracking-tight text-[--color-ink]">
                  {page.title}
                </h1>
              </div>
            </div>
          </div>
          <div className="hidden shrink-0 text-[11px] font-semibold text-[--color-ink-mid] md:block max-w-[320px] truncate">
            {page.description}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-8 sm:px-6">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[--color-blue-brand]/20 bg-[--color-blue-soft]/50 px-4 py-3 sm:items-center">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[--color-blue-brand] sm:mt-0" />
          <p className="text-xs leading-relaxed text-[--color-blue-dark] sm:text-[13px]">
            <strong className="mr-1 uppercase tracking-widest text-[10px] font-black">Pro Tip:</strong> {page.proTip}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calculator) => (
            <TradeTile key={calculator.key} calculator={calculator} />
          ))}
        </div>
      </section>
    </main>
  );
}

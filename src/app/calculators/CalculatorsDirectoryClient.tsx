"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState, useEffect } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT } from "@/lib/privacy/consent";
import { getRecentPaths } from "@/lib/recommendations/activity";
import {
  HardHat,
  Search,
  BrickWall,
  Hammer,
  Triangle,
  Thermometer,
  Layout,
  BarChart3,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  tradePages,
  type TradePageDefinition,
} from "@/app/calculators/_lib/trade-pages";
import type { TradePageKey } from "@/app/calculators/_lib/trade-pages";

const SplashPopup = dynamic(
  () => import("@/components/ui/SplashPopup").then((mod) => mod.SplashPopup),
  { ssr: false },
);

const DIRECTORY_CATEGORIES: Array<{
  key: TradePageKey;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = [
  { key: "concrete", icon: BrickWall, label: "Concrete & Masonry" },
  { key: "framing", icon: Hammer, label: "Framing & Lumber" },
  { key: "roofing", icon: Triangle, label: "Roofing & Siding" },
  { key: "mechanical", icon: Thermometer, label: "Mechanical & Site" },
  { key: "finish", icon: Layout, label: "Finish Carpentry" },
  { key: "business", icon: BarChart3, label: "Business & Estimating" },
];

type SearchablePage = {
  key: string;
  title: string;
  description: string;
  href: string;
  categoryLabel: string;
  keywords: string[];
};

function buildSearchIndex(): SearchablePage[] {
  const categoryLabelByKey: Record<TradePageDefinition["category"], string> = {
    concrete: "Concrete & Masonry",
    framing: "Framing & Lumber",
    roofing: "Roofing & Siding",
    mechanical: "Mechanical & Site",
    insulation: "HVAC & Insulation",
    finish: "Finish Carpentry",
    management: "Construction Management",
    interior: "Interior Finish",
    business: "Business & Estimating",
  };

  return Object.values(tradePages).map((page) => ({
    key: page.key,
    title: page.title,
    description: page.description,
    href: page.canonicalPath,
    categoryLabel: categoryLabelByKey[page.category],
    keywords: page.keywords,
  }));
}

const SEARCH_INDEX: SearchablePage[] = buildSearchIndex();

type RankedResult = SearchablePage & { score: number };

function searchPages(query: string, limit = 8): RankedResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: RankedResult[] = [];

  for (const page of SEARCH_INDEX) {
    const haystackTitle = page.title.toLowerCase();
    const haystackDescription = page.description.toLowerCase();
    const haystackCategory = page.categoryLabel.toLowerCase();
    const haystackKeywords = page.keywords.join(" ").toLowerCase();

    let score = 0;

    if (haystackTitle === q) score += 80;
    else if (haystackTitle.includes(q)) score += 60;

    if (haystackCategory.includes(q)) score += 20;
    if (haystackKeywords.includes(q)) score += 25;
    if (haystackDescription.includes(q)) score += 10;

    // Small bonus for calculators whose slug or path directly references the query.
    if (page.href.toLowerCase().includes(q)) score += 15;

    if (score > 0) {
      results.push({ ...page, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

const RECOMMENDED_KEYS: string[] = [
  "concrete-slab",
  "framing-wall-studs",
  "roofing-shingle-bundles",
  "business-profit-margin",
  "business-labor-rate",
  "mechanical-btu-estimator",
];

const RECOMMENDED: SearchablePage[] = RECOMMENDED_KEYS.map(
  (key) => tradePages[key],
)
  .filter(Boolean)
  .map((page) => ({
    key: page.key,
    title: page.title,
    description: page.description,
    href: page.canonicalPath,
    categoryLabel: page.category,
    keywords: page.keywords,
  }));

function suggestedFromActivity(
  searchIndex: SearchablePage[],
  limit = 4,
): SearchablePage[] {
  const paths = getRecentPaths(limit);
  const seen = new Set<string>();
  const out: SearchablePage[] = [];
  for (const path of paths) {
    const page = searchIndex.find((p) => p.href === path);
    if (page && !seen.has(page.key)) {
      seen.add(page.key);
      out.push(page);
    }
  }
  return out;
}

function getCategoryPage(key: TradePageKey): TradePageDefinition | undefined {
  const page = tradePages[key];
  return page?.type === "category" ? page : undefined;
}

export function CalculatorsDirectoryClient() {
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState<SearchablePage[]>([]);

  const results = useMemo(() => searchPages(query), [query]);
  const showRecommended = !query.trim();

  useEffect(() => {
    const refresh = () => setSuggested(suggestedFromActivity(SEARCH_INDEX, 4));
    refresh();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, refresh);
    return () =>
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, refresh);
  }, []);

  const recommendedToShow = useMemo(() => {
    if (suggested.length === 0) return RECOMMENDED;
    const suggestedKeys = new Set(suggested.map((p) => p.key));
    return [
      ...suggested,
      ...RECOMMENDED.filter((p) => !suggestedKeys.has(p.key)),
    ];
  }, [suggested]);

  const totalCalculators = SEARCH_INDEX.length;

  return (
    <>
      <main
        id="main-content"
        className="flex-1 bg-[--color-bg]"
        tabIndex={-1}
      >
        {/* ── Hero strip ──────────────────────────────────────── */}
        <div className="border-b-2 border-orange-100 bg-white px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="flex items-center justify-center gap-2 text-[--color-orange-brand]">
              <HardHat className="h-5 w-5" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
                Pro Construction Calc
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-black text-slate-900 sm:text-3xl">
              Professional Estimating Calculators
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Oneida · Madison · Herkimer County, NY
            </p>
            <div className="mx-auto mt-3 max-w-2xl">
              <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:border-[--color-orange-brand] focus-within:ring-1 focus-within:ring-[--color-orange-brand]">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  autoComplete="off"
                  placeholder={
                    'Search: "concrete slab", "roof pitch", "profit margin"\u2026'
                  }
                  className="ml-2 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search construction calculators by trade, task, or name"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {totalCalculators} professional calculators · 6 trade modules
            </p>
          </div>
        </div>

        {/* ── Recent/suggested chip strip — 1 row max ──────────── */}
        {showRecommended && recommendedToShow.length > 0 && (
          <div className="border-b border-[--color-border] bg-[--color-surface-alt] px-4 py-2 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Recent:
              </span>
              {recommendedToShow.slice(0, 6).map((page) => (
                <Link
                  key={page.key}
                  href={page.href as Route}
                  prefetch={false}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[--color-orange-brand]/60 hover:text-[--color-orange-brand]"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Search results (replaces chip strip when active) ─── */}
        {!showRecommended && (
          <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
            {results.length === 0 ? (
              <p className="text-xs text-slate-500">
                No calculators match that search. Try a different trade or task
                name.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((page) => (
                  <Link
                    key={page.key}
                    href={page.href as Route}
                    prefetch={false}
                    className="group flex flex-col rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-700 transition-colors hover:border-[--color-orange-brand]/60 hover:bg-orange-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 group-hover:text-[--color-orange-brand]">
                        {page.title}
                      </p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {page.categoryLabel}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-600">
                      {page.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trade Module Directory Grid */}
        <div className="safe-area-pb mx-auto w-full max-w-5xl px-4 py-4 pb-6 sm:px-6 sm:py-5 sm:pb-8 lg:py-5 lg:pb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DIRECTORY_CATEGORIES.map(({ key, icon: Icon, label }) => {
              const page = getCategoryPage(key);
              const links = page?.relatedLinks ?? [];
              const href = page?.canonicalPath ?? `/calculators/${key}`;
              const calcCount = links.length;
              const sampleCalcs = links.slice(0, 3);

              return (
                <Link
                  key={key}
                  href={href as Route}
                  prefetch={false}
                  className="group relative flex flex-col rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[3px] before:rounded-full before:bg-orange-500/0 hover:before:bg-orange-500 before:transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[--color-orange-brand]/12">
                      <Icon
                        className="h-4.5 w-4.5 text-[--color-orange-brand]"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-sm font-bold uppercase tracking-wide text-slate-900 transition-colors group-hover:text-[--color-orange-brand]">
                        {label}
                      </h2>
                      {calcCount > 0 && (
                        <p className="text-[10px] text-slate-500">
                          {calcCount} calc{calcCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  {page && (
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                      {page.description}
                    </p>
                  )}
                  {sampleCalcs.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {sampleCalcs.map((link) => (
                        <span
                          key={link.href}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
                        >
                          {link.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center pt-2 text-[10px] font-semibold text-[--color-orange-brand]">
                    View all
                    <ChevronRight className="h-3 w-3" aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recommended Calculators */}
        <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6 sm:pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
            Recommended Calculators
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED.slice(0, 6).map((calc) => (
              <Link
                key={calc.key}
                href={calc.href as Route}
                prefetch={false}
                className="group flex flex-col rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 group-hover:text-[--color-orange-brand]">
                    {calc.title}
                  </p>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {calc.categoryLabel}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {calc.description}
                </p>
                <div className="mt-auto flex items-center pt-2 text-xs font-semibold text-[--color-orange-brand]">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SplashPopup />
    </>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState, useEffect } from "react";
import { SplashPopup } from "@/components/ui/SplashPopup";
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
} from "lucide-react";
import {
  tradePages,
  type TradePageDefinition,
} from "@/app/calculators/_lib/trade-pages";
import type { TradePageKey } from "@/app/calculators/_lib/trade-pages";

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

const RECOMMENDED: SearchablePage[] = RECOMMENDED_KEYS
  .map((key) => tradePages[key])
  .filter(Boolean)
  .map((page) => ({
    key: page.key,
    title: page.title,
    description: page.description,
    href: page.canonicalPath,
    categoryLabel: page.category,
    keywords: page.keywords,
  }));

function suggestedFromActivity(searchIndex: SearchablePage[], limit = 4): SearchablePage[] {
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
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, refresh);
  }, []);

  const recommendedToShow = useMemo(() => {
    if (suggested.length === 0) return RECOMMENDED;
    const suggestedKeys = new Set(suggested.map((p) => p.key));
    return [...suggested, ...RECOMMENDED.filter((p) => !suggestedKeys.has(p.key))];
  }, [suggested]);

  return (
    <>
      <main
        id="main-content"
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
        tabIndex={-1}
      >
        {/* Hero: full-width dark industrial gradient, no trade image */}
        <section className="dark-feature-panel overflow-hidden text-white">
          <div className="relative w-full bg-[radial-gradient(ellipse_at_top_right,rgba(30,35,45,0.95),#0a0a0b_70%),linear-gradient(180deg,#0d0f14_0%,#0A0A0B_100%)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(247,148,29,0.06),transparent_45%)]" />
            <div className="relative z-10 mx-auto w-full max-w-5xl">
              <div className="flex items-center gap-2 text-[--color-orange-brand]">
                <HardHat className="h-4 w-4" aria-hidden />
                <p className="section-kicker">Trade Modules</p>
              </div>
              <h1 className="mt-3 text-3xl font-display font-bold leading-none sm:text-4xl">
                Trade Modules
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[--color-nav-text]/74 sm:text-base">
                Select a calculator below or use the search cockpit to begin.
              </p>
              <div className="trim-nav-border mt-4 inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
                <Search className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Search cockpit — type a trade, task, or calculator
              </div>
            </div>
          </div>
        </section>

        {/* Search cockpit */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 sm:pt-6 lg:pt-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_14px_32px_rgba(0,0,0,0.35)] sm:p-5">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Search cockpit
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 focus-within:border-[--color-orange-brand] focus-within:ring-1 focus-within:ring-[--color-orange-brand]">
              <Search className="h-4 w-4 text-slate-500" aria-hidden />
              <input
                type="search"
                autoComplete="off"
                placeholder="Start typing: “concrete slab”, “roof pitch”, “profit margin”…"
                className="ml-2 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search construction calculators by trade, task, or name"
              />
            </div>

            <div className="mt-3">
              {showRecommended ? (
                <div>
                  {suggested.length > 0 && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Suggested for you
                    </p>
                  )}
                  {suggested.length === 0 && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Recommended starting points
                    </p>
                  )}
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {recommendedToShow.map((page) => (
                      <Link
                        key={page.key}
                        href={page.href as Route}
                        className="group rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:border-[--color-orange-brand]/60 hover:bg-slate-900"
                      >
                        <p className="font-semibold text-slate-100 group-hover:text-[--color-orange-brand]">
                          {page.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                          {page.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No calculators found. Try a different trade or task name.
                </p>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Matching calculators
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {results.map((page) => (
                      <li key={page.key}>
                        <Link
                          href={page.href as Route}
                          className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-[--color-orange-brand]/60 hover:bg-slate-900"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-100 group-hover:text-[--color-orange-brand]">
                              {page.title}
                            </p>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {page.categoryLabel}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                            {page.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trade Module Directory Grid */}
        <div className="safe-area-pb mx-auto w-full max-w-5xl px-4 py-5 pb-6 sm:px-6 sm:py-6 sm:pb-8 lg:py-6 lg:pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY_CATEGORIES.map(({ key, icon: Icon, label }) => {
              const page = getCategoryPage(key);
              const links = page?.relatedLinks ?? [];
              const href = page?.canonicalPath ?? `/calculators/${key}`;

              return (
                <div
                  key={key}
                  className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-orange-500/50 hover:shadow-[0_14px_32px_rgba(247,148,29,0.12)]"
                >
                  <Link
                    href={href as Route}
                    className="flex items-center gap-2.5 text-[--color-orange-brand]"
                  >
                    <Icon
                      className="h-5 w-5 transition-colors duration-300 group-hover:text-[--color-orange-brand]"
                      aria-hidden
                    />
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white transition-colors group-hover:text-[--color-orange-brand]">
                      {label}
                    </h2>
                  </Link>
                  {page && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[--color-nav-text]/70">
                      {page.description}
                    </p>
                  )}
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {links.slice(0, 4).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href as Route}
                          className="text-xs text-[--color-nav-text]/85 transition-colors duration-300 hover:text-[--color-orange-brand]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {links.length > 4 && (
                      <li>
                        <Link
                          href={href as Route}
                          className="text-[10px] font-semibold uppercase tracking-wider text-[--color-orange-brand]/90 hover:text-[--color-orange-brand]"
                        >
                          +{links.length - 4} more
                        </Link>
                      </li>
                    )}
                  </ul>
                  <Link
                    href={href as Route}
                    className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[--color-orange-brand] opacity-90 transition-opacity group-hover:opacity-100"
                  >
                    Open module
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <SplashPopup />
    </>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SplashPopup } from "@/components/ui/SplashPopup";
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

function getCategoryPage(key: TradePageKey): TradePageDefinition | undefined {
  const page = tradePages[key];
  return page?.type === "category" ? page : undefined;
}

export function CalculatorsDirectoryClient() {
  return (
    <div className="command-theme page-shell flex min-h-screen flex-col bg-[--color-bg]">
      <Header />
      <main
        id="main-content"
        className="min-w-0 flex-1 overflow-visible"
        tabIndex={-1}
      >
        {/* Hero: full-width dark industrial gradient, no trade image */}
        <section className="dark-feature-panel overflow-hidden text-white">
          <div className="relative w-full bg-[radial-gradient(ellipse_at_top_right,rgba(30,35,45,0.95),#0a0a0b_70%),linear-gradient(180deg,#0d0f14_0%,#0A0A0B_100%)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(247,148,29,0.06),transparent_45%)]" />
            <div className="relative z-10 mx-auto max-w-5xl">
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
                Search cockpit
              </div>
            </div>
          </div>
        </section>

        {/* Trade Module Directory Grid */}
        <div className="mx-auto max-w-5xl px-4 py-5 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:py-8 lg:pb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY_CATEGORIES.map(({ key, icon: Icon, label }) => {
              const page = getCategoryPage(key);
              const links = page?.relatedLinks ?? [];
              const href = page?.canonicalPath ?? `/calculators/${key}`;

              return (
                <div
                  key={key}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-[#1A1A1C] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out hover:border-[--color-orange-brand]/50 hover:shadow-[0_14px_32px_rgba(247,148,29,0.12)]"
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
      <Footer />
      <SplashPopup />
    </div>
  );
}

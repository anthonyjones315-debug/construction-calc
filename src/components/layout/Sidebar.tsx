"use client";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { CATEGORIES, CALCULATORS } from "@/data";
import type { CalculatorId } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrickWall,
  Calculator,
  HardHat,
  Hammer,
  Layout,
  PaintBucket,
  Search,
  Shield,
  Triangle,
  Wrench,
} from "lucide-react";
import { routes } from "@routes";

const categoryIcons: Record<string, LucideIcon> = {
  concrete: BrickWall,
  framing: Hammer,
  roofing: Triangle,
  insulation: Shield,
  finishes: PaintBucket,
  labor: BarChart3,
};

const calculatorIcons: Partial<Record<CalculatorId, LucideIcon>> = {
  concrete: BrickWall,
  framing: Hammer,
  rafters: Triangle,
  roofing: Triangle,
  roofPitch: Triangle,
  roofingSquares: Calculator,
  insulation: Shield,
  sprayfoam: Wrench,
  cellulose: Shield,
  flooring: PaintBucket,
  siding: Layout,
  paint: PaintBucket,
  labor: HardHat,
  budget: BarChart3,
  unitConverter: Calculator,
};

export function Sidebar() {
  const { activeCalculator, setActiveCalculator } = useStore();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCalculators = useMemo(() => {
    return CATEGORIES.flatMap((cat) =>
      cat.calculators
        .map((calcId) => {
          const calc = CALCULATORS.find((c) => c.id === calcId);
          if (!calc) return null;
          const matches =
            !normalizedSearch ||
            cat.label.toLowerCase().includes(normalizedSearch) ||
            calc.label.toLowerCase().includes(normalizedSearch);
          return matches ? { calcId, calc, categoryIcon: categoryIcons[cat.id] } : null;
        })
        .filter(Boolean)
    ).filter(Boolean) as Array<{ calcId: CalculatorId; calc: (typeof CALCULATORS)[0]; categoryIcon: LucideIcon }>;
  }, [normalizedSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showPanel = searchFocused;
  const isEmpty = normalizedSearch.length > 0 && filteredCalculators.length === 0;

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col overflow-hidden bg-[--color-nav-bg]"
      aria-label="Calculator navigation"
    >
      {/* Brand logo */}
      <div className="border-b trim-nav-border px-3 pb-3 pt-4">
        <Link
          href={routes.commandCenter}
          className="flex items-center gap-2 text-[--color-nav-text]/90 transition-all duration-300 ease-in-out hover:text-white"
          aria-label="Pro Construction Calc - Command Center"
        >
          <HardHat className="h-5 w-5 text-[--color-orange-brand]" aria-hidden />
          <span className="text-sm font-bold uppercase tracking-wide">Pro Construction Calc</span>
        </Link>
      </div>

      {/* Search with dropdown */}
      <div ref={containerRef} className="relative border-b trim-nav-border px-3 pb-3 pt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-nav-text]/55"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          placeholder="Search calculators..."
          className="h-10 w-full rounded-lg border border-white/10 bg-[#0A0A0B] pl-9 pr-3 text-sm text-white outline-none ring-0 transition-all duration-300 ease-in-out placeholder:text-[--color-nav-text]/50 focus:border-[--color-orange-brand]/80 focus:ring-2 focus:ring-[--color-orange-brand]/50"
          aria-label="Search calculators"
          aria-controls="search-results-panel"
        />

        {/* Dropdown panel - visible only when focused */}
        <div
          id="search-results-panel"
          role="listbox"
          className={`absolute left-3 right-3 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/15 bg-[#0f1521] shadow-[0_16px_34px_rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out ${
            showPanel
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          {isEmpty ? (
            <div className="px-4 py-6 text-center text-sm text-[--color-orange-brand]">
              🚫 0 Results found for Oneida County.
            </div>
          ) : (
            filteredCalculators.map(({ calcId, calc, categoryIcon }) => {
              const Icon = calculatorIcons[calcId] ?? categoryIcon ?? Calculator;
              const isActive = activeCalculator === calcId;
              return (
                <Link
                  key={calcId}
                  href={`/calculators?c=${calcId}`}
                  role="option"
                  onClick={() => {
                    setActiveCalculator(calcId);
                    setSearchFocused(false);
                    setSearch("");
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-300 ease-in-out first:rounded-t-xl last:rounded-b-xl ${
                    isActive
                      ? "bg-[--color-orange-brand]/22 text-[--color-orange-brand]"
                      : "text-[--color-nav-text] hover:bg-white/7 hover:text-white"
                  }`}
                  aria-selected={isActive}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#FF8C00]" aria-hidden />
                  <span className="truncate">{calc.label}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Free PDF promo */}
      <div className="mx-3 mb-3 mt-auto pt-2">
        <div className="rounded-xl border border-[--color-orange-brand]/45 bg-gradient-to-br from-[--color-orange-brand]/28 to-[--color-orange-dark]/24 p-3 shadow-[0_14px_26px_rgba(247,148,29,0.2)] transition-all duration-300 ease-in-out hover:border-[--color-orange-brand]/55">
          <p className="mb-1 text-xs font-bold text-white">📄 Free PDF Export</p>
          <p className="text-xs leading-relaxed text-[--color-nav-text]/92">
            Export any estimate as PDF instantly — no sign-in needed.
          </p>
        </div>
      </div>
    </aside>
  );
}

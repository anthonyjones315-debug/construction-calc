"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { getCalculatorAuditRef, setCalculatorAuditSnapshot } from "../_lib/calculator-audit-ref";
import { useHaptic } from "@/hooks/useHaptic";
import {
  ArrowRight,
  BarChart3,
  BrickWall,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  FileDown,
  FileSpreadsheet,
  FolderKanban,
  HardHat,
  Hammer,
  Layers3,
  Layout,
  Mail,
  Menu,
  MapPin,
  Search,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  ThermometerSnowflake,
  Thermometer,
  Timer,
  Tractor,
  Triangle,
  Wrench,
  X,
} from "lucide-react";
import { EmailEstimateModal, type EstimatePayload } from "@/components/ui/EmailEstimateModal";
import { JsonLD } from "@/seo";
import { getTradePageSchema, type TradePageDefinition } from "../_lib/trade-pages";
import { routes } from "@routes";


type TradeModule = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

type TradeModuleGroup = {
  label: string;
  icon: LucideIcon;
  modules: TradeModule[];
};

const tradeNav: TradeModule[] = [
  {
    label: "Concrete & Masonry",
    href: "/calculators/concrete" as Route,
    icon: BrickWall,
  },
  {
    label: "Framing & Lumber",
    href: "/calculators/framing" as Route,
    icon: Hammer,
  },
  {
    label: "Roofing & Siding",
    href: "/calculators/roofing" as Route,
    icon: Triangle,
  },
  {
    label: "Mechanical & Site",
    href: "/calculators/mechanical" as Route,
    icon: Thermometer,
  },
  {
    label: "Finish & Interior",
    href: "/calculators/interior" as Route,
    icon: Layout,
  },
  {
    label: "Business/Sales",
    href: "/calculators/business" as Route,
    icon: BarChart3,
  },
];

const tradeModuleGroups: TradeModuleGroup[] = [
  {
    label: "Concrete",
    icon: BrickWall,
    modules: [
      { label: "Category", href: "/calculators/concrete" as Route, icon: SquareStack },
      { label: "Slab", href: "/calculators/concrete/slab" as Route, icon: Layers3 },
      { label: "Footing", href: "/calculators/concrete/footing" as Route, icon: Tractor },
      { label: "Block", href: "/calculators/concrete/block" as Route, icon: ClipboardList },
      { label: "Block Wall", href: "/calculators/concrete/block-wall" as Route, icon: Building2 },
    ],
  },
  {
    label: "Framing",
    icon: Hammer,
    modules: [
      { label: "Category", href: "/calculators/framing" as Route, icon: FolderKanban },
      { label: "Wall", href: "/calculators/framing/wall" as Route, icon: Layout },
      { label: "Wall Studs", href: "/calculators/framing/wall-studs" as Route, icon: Layout },
      { label: "Headers", href: "/calculators/framing/headers" as Route, icon: ShieldCheck },
      { label: "Rafters", href: "/calculators/framing/rafters" as Route, icon: Triangle },
      { label: "Rafter Length", href: "/calculators/framing/rafter-length" as Route, icon: SlidersHorizontal },
      { label: "Deck Joists", href: "/calculators/framing/deck-joists" as Route, icon: ClipboardList },
    ],
  },
  {
    label: "Roofing",
    icon: Triangle,
    modules: [
      { label: "Category", href: "/calculators/roofing" as Route, icon: FolderKanban },
      { label: "Shingles", href: "/calculators/roofing/shingles" as Route, icon: Gauge },
      { label: "Shingle Bundles", href: "/calculators/roofing/shingle-bundles" as Route, icon: SquareStack },
      { label: "Pitch", href: "/calculators/roofing/pitch" as Route, icon: SlidersHorizontal },
      { label: "Pitch & Slope", href: "/calculators/roofing/pitch-slope" as Route, icon: Timer },
      { label: "Siding", href: "/calculators/roofing/siding" as Route, icon: Wrench },
      { label: "Siding Squares", href: "/calculators/roofing/siding-squares" as Route, icon: FileSpreadsheet },
    ],
  },
  {
    label: "Mechanical",
    icon: ThermometerSnowflake,
    modules: [
      { label: "Category", href: "/calculators/mechanical" as Route, icon: FolderKanban },
      { label: "BTU Estimator", href: "/calculators/mechanical/btu-estimator" as Route, icon: Thermometer },
      { label: "Ventilation", href: "/calculators/mechanical/ventilation-calc" as Route, icon: Gauge },
      { label: "Drywall Sheets", href: "/calculators/mechanical/drywall-sheets" as Route, icon: Layout },
    ],
  },
  {
    label: "Finish",
    icon: Layout,
    modules: [
      { label: "Category", href: "/calculators/finish" as Route, icon: FolderKanban },
      { label: "Trim", href: "/calculators/finish/trim" as Route, icon: Wrench },
      { label: "Flooring", href: "/calculators/finish/flooring" as Route, icon: Layers3 },
      { label: "Stairs", href: "/calculators/finish/stairs" as Route, icon: SlidersHorizontal },
    ],
  },
  {
    label: "Business",
    icon: CircleDollarSign,
    modules: [
      { label: "Category", href: "/calculators/business" as Route, icon: FolderKanban },
      { label: "Profit Margin", href: "/calculators/business/profit-margin" as Route, icon: BarChart3 },
      { label: "Labor Rate", href: "/calculators/business/labor-rate" as Route, icon: Calculator },
      { label: "Lead Estimator", href: "/calculators/business/lead-estimator" as Route, icon: ClipboardList },
      { label: "Tax Save", href: "/calculators/business/tax-save" as Route, icon: FileDown },
    ],
  },
];

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Maps calculator category/slug to known SVG assets in /public/images. No image = gradient-only fallback. */
const HERO_IMAGE_MAP: Record<string, string> = {
  concrete: "/images/concrete-slab.svg",
  framing: "/images/wall-framing.svg",
  roofing: "/images/roof-pitch.svg",
  mechanical: "/images/spray-foam.svg",
  insulation: "/images/cellulose-insulation.svg",
  finish: "/images/wall-framing.svg",
  interior: "/images/wall-framing.svg",
  management: "/images/pricebook-materials.svg",
  business: "/images/pricebook-materials.svg",
};

function getHeroImage(page: TradePageDefinition): string | null {
  const byCategory = HERO_IMAGE_MAP[page.category];
  if (byCategory) return byCategory;
  const byKey = HERO_IMAGE_MAP[page.key];
  return byKey ?? null;
}

/** Shorten long SEO titles for the visual h1; full title remains in metadata. */
function displayTitle(fullTitle: string): string {
  if (fullTitle.length <= 40) return fullTitle;
  const atCalculator = fullTitle.indexOf(" Calculator");
  if (atCalculator !== -1) return fullTitle.slice(0, atCalculator).trim();
  return fullTitle;
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: Route }> = [{ label: "Home", href: "/" as Route }];

  let current = "";
  segments.forEach((segment) => {
    current += `/${segment}`;
    const label = segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    crumbs.push({ label, href: current as Route });
  });

  return crumbs;
}

export function CalculatorPage({ page }: { page: TradePageDefinition }) {
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crmModalOpen, setCrmModalOpen] = useState(false);
  const [baseMeasurement, setBaseMeasurement] = useState(10);
  const [widthSpan, setWidthSpan] = useState(10);
  const [depthThickness, setDepthThickness] = useState(4);
  const [wasteFactor, setWasteFactor] = useState(10);
  const [saveLocked, setSaveLocked] = useState(false);

  const haptic = useHaptic();
  const hapticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstCalcRender = useRef(true);
  const resultsCardRef = useRef<HTMLElement | null>(null);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(page.canonicalPath),
    [page.canonicalPath],
  );

  // Calculator Audit: keep Sentry context updated with current inputs for reproduction
  useEffect(() => {
    setCalculatorAuditSnapshot({
      inputs: {
        baseMeasurement,
        widthSpan,
        depthThickness,
        wasteFactor,
        canonicalPath: page.canonicalPath,
      },
      trade: page.category,
      canonicalPath: page.canonicalPath,
    });
  }, [baseMeasurement, widthSpan, depthThickness, wasteFactor, page.category, page.canonicalPath]);

  const volumeCubicFeet =
    clampValue(baseMeasurement, 1, 10000) *
    clampValue(widthSpan, 1, 10000) *
    (clampValue(depthThickness, 1, 96) / 12);
  const adjustedVolume =
    volumeCubicFeet * (1 + clampValue(wasteFactor, 0, 25) / 100);
  const materialQty = Math.ceil(adjustedVolume * 1.7);

  // Debounced haptic — fires 300 ms after inputs settle so the user feels a
  // physical "click" when the live calculation stabilises on a new result.
  // Skipped on the very first render to avoid a buzz on page load.
  // When haptic fires, scroll the results card into view if it's not fully visible.
  useEffect(() => {
    if (isFirstCalcRender.current) {
      isFirstCalcRender.current = false;
      return;
    }
    if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
    hapticTimerRef.current = setTimeout(() => {
      haptic(10);
      resultsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 300);
    return () => {
      if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeCubicFeet, adjustedVolume, materialQty]);

  function handleSaveEstimate() {
    if (saveLocked) return;
    setSaveLocked(true);
    haptic(10);
    // 1-second button lock prevents double-tap duplicates
    setTimeout(() => setSaveLocked(false), 1000);
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredGroups = useMemo(
    () =>
      tradeModuleGroups
        .map((group) => ({
          ...group,
          modules: group.modules.filter((module) =>
            `${group.label} ${module.label}`
              .toLowerCase()
              .includes(normalizedSearch),
          ),
        }))
        .filter((group) => group.modules.length > 0),
    [normalizedSearch],
  );

  const localTip =
    page.category === "concrete" &&
    !page.proTip.includes("Oneida") &&
    !page.proTip.includes("frost")
      ? `${page.proTip} For Oneida County, NY slab and footing work, verify frost protection against local depth expectations that can approach 48 inches.`
      : page.proTip;

  function parseAndSet(
    nextValue: string,
    setter: (value: number) => void,
    min: number,
    max: number,
  ) {
    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      setter(min);
      return;
    }
    setter(clampValue(parsed, min, max));
  }

  function handleExportPdf() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const auditRef = getCalculatorAuditRef();

  const emailEstimatePayload: EstimatePayload = useMemo(
    () => ({
      title: page.title,
      calculatorLabel: page.heroKicker,
      results: [
        { label: "Volume", value: volumeCubicFeet.toFixed(2), unit: "cu ft", description: "" },
        { label: "Adjusted Volume", value: adjustedVolume.toFixed(2), unit: "cu ft", description: "" },
        { label: "Material Qty", value: materialQty, unit: "units", description: "" },
      ],
      generatedAt: new Date().toISOString().slice(0, 10),
    }),
    [page.title, page.heroKicker, volumeCubicFeet, adjustedVolume, materialQty],
  );

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const message = error instanceof Error ? error.message : String(error);
        return (
        <main id="main-content" className="command-theme bg-[--color-bg] text-white min-h-[40vh] flex items-center justify-center p-6">
          <div className="rounded-2xl border border-white/20 bg-black/25 p-6 max-w-lg text-center">
            <h2 className="text-lg font-bold text-white">Calculator error</h2>
            <p className="mt-2 text-sm text-[--color-nav-text]/90">
              Something went wrong. The exact inputs have been reported so we can fix it.
            </p>
            <p className="mt-2 text-xs text-[--color-nav-text]/60 font-mono truncate" title={message}>
              {message}
            </p>
            <button
              type="button"
              onClick={resetError}
              className="mt-4 rounded-xl border border-[--color-orange-brand]/50 bg-[--color-orange-brand]/20 px-4 py-2 text-sm font-bold uppercase tracking-wide text-[--color-orange-brand]"
            >
              Try again
            </button>
          </div>
        </main>
        );
      }}
      onError={() => {
        const snapshot = auditRef.current;
        Sentry.setTag("trade", page.category);
        if (snapshot?.inputs) {
          Sentry.setContext("calculator_inputs", snapshot.inputs);
        }
        Sentry.setContext("calculator_audit", {
          trade: page.category,
          canonicalPath: page.canonicalPath,
        });
      }}
    >
    <main
      id="main-content"
      className="command-theme bg-[--color-bg] text-white"
    >
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <JsonLD schema={getTradePageSchema(page)} />

        <div className="mb-4 flex items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-[--color-nav-text]/70"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={crumb.href} className="inline-flex items-center gap-2">
                  {index > 0 ? <span className="text-[--color-nav-text]/45">&gt;</span> : null}
                  <Link
                    href={crumb.href}
                    className={`transition-all duration-300 ease-in-out ${
                      isLast
                        ? "font-semibold text-white"
                        : "text-[--color-nav-text]/75 hover:text-[--color-orange-brand]"
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 active:scale-[0.98] lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <Menu className="h-4 w-4" aria-hidden />
            )}
            Tools
          </button>
        </div>

        {mobileMenuOpen ? (
          <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-colors lg:hidden">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-nav-text]/60"
                aria-hidden
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search trade tools"
                className="h-10 w-full rounded-xl border border-white/15 bg-black/20 pl-9 pr-3 text-sm text-white outline-none transition focus:border-[--color-orange-brand]/60"
              />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.label}
                  className="rounded-xl border border-white/10 bg-black/25 p-3"
                >
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                    {group.label}
                  </p>
                  <ul className="space-y-1.5">
                    {group.modules.map((module) => (
                      <li key={module.href}>
                        <Link
                          href={module.href}
                          className="inline-flex items-center gap-2 text-xs text-[--color-nav-text] transition-all duration-300 ease-in-out hover:text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <module.icon className="h-3.5 w-3.5" aria-hidden />
                          {module.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="overflow-hidden rounded-3xl border trim-nav-border bg-[--color-nav-bg] shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
          <div
            className={`grid grid-cols-1 gap-8 px-5 py-7 sm:px-7 sm:py-9 lg:grid-cols-2 lg:items-center ${
              getHeroImage(page)
                ? ""
                : "bg-[radial-gradient(ellipse_at_top_right,rgba(30,35,45,0.95),#0a0a0b_70%),linear-gradient(180deg,#0d0f14_0%,#0A0A0B_100%)]"
            }`}
            style={
              getHeroImage(page)
                ? {
                    background:
                      "radial-gradient(circle_at_top_left,rgba(247,148,29,0.18),transparent_50%),linear-gradient(180deg,#141a26_0%,#101622_100%)",
                  }
                : undefined
            }
          >
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/45 bg-[--color-orange-brand]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-500">
                <HardHat className="h-3.5 w-3.5" aria-hidden />
                {page.heroKicker}
              </div>

              <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
                {displayTitle(page.title)}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[--color-nav-text]/82 sm:text-base">
                {page.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[--color-orange-brand]/30 bg-[--color-orange-brand]/10 px-3 py-2 text-sm text-[--color-orange-brand]">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {page.localFocus}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex h-11 min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 text-xs font-bold uppercase tracking-[0.12em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setCrmModalOpen(true)}
                  className="inline-flex h-11 min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 text-xs font-bold uppercase tracking-[0.12em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  Email Estimate
                </button>
                <button
                  type="button"
                  onClick={handleSaveEstimate}
                  disabled={saveLocked}
                  className={`inline-flex h-11 min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 text-xs font-bold uppercase tracking-[0.12em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${saveLocked ? "scale-95" : ""}`}
                >
                  {saveLocked ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                      Synced
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" aria-hidden />
                      Save Estimate
                    </>
                  )}
                </button>
              </div>
            </div>

            {getHeroImage(page) ? (
              <div className="relative hidden w-full max-h-48 overflow-hidden rounded-xl border border-white/10 shadow-inner lg:flex lg:items-center lg:justify-center lg:bg-black/20">
                <Image
                  src={getHeroImage(page)!}
                  alt={page.altText}
                  width={800}
                  height={450}
                  priority
                  className="h-full max-h-48 w-full object-contain"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4 bg-[--color-nav-bg] p-5 sm:p-7">

            <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr,1fr]">
              <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-colors lg:block">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Tool Navigator
                </h2>
                <div className="relative mt-3">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-nav-text]/60"
                    aria-hidden
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search 25+ trade tools"
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/20 pl-9 pr-3 text-sm text-white outline-none transition focus:border-[--color-orange-brand]/60"
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {filteredGroups.map((group) => (
                    <div key={group.label} className="group relative">
                      <button
                        type="button"
                        className="flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[--color-nav-text] transition-all duration-200 ease-in-out hover:border-[--color-orange-brand]/50 hover:text-white active:scale-[0.98]"
                      >
                        <group.icon className="h-4 w-4 text-[--color-orange-brand]" aria-hidden />
                        {group.label}
                        <ChevronDown className="h-3 w-3 text-[--color-nav-text]/75" aria-hidden />
                      </button>

                      <div className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-white/15 bg-[#0f1521] p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-300 ease-in-out group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                        {group.modules.map((module) => (
                          <Link
                            key={module.href}
                            href={module.href}
                            className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition last:mb-0 ${
                              page.canonicalPath === module.href
                                ? "bg-[--color-orange-brand]/25 text-[--color-orange-brand]"
                                : "text-[--color-nav-text] hover:bg-white/7 hover:text-white"
                            }`}
                          >
                            <module.icon className="h-3.5 w-3.5" aria-hidden />
                            {module.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Inputs
                </h2>

                <div className="mt-4 space-y-4">
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                    Base Measurement
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={baseMeasurement}
                      onChange={(event) => parseAndSet(event.target.value, setBaseMeasurement, 1, 10000)}
                      className="h-11 rounded-xl border border-white/20 bg-[--color-nav-bg] px-3 text-sm text-white outline-none transition focus:border-[--color-orange-brand]/70"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                    Width / Span
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={widthSpan}
                      onChange={(event) => parseAndSet(event.target.value, setWidthSpan, 1, 10000)}
                      className="h-11 rounded-xl border border-white/20 bg-[--color-nav-bg] px-3 text-sm text-white outline-none transition focus:border-[--color-orange-brand]/70"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                    Depth / Thickness
                    <input
                      type="number"
                      min={1}
                      max={96}
                      value={depthThickness}
                      onChange={(event) => parseAndSet(event.target.value, setDepthThickness, 1, 96)}
                      className="h-11 rounded-xl border border-white/20 bg-[--color-nav-bg] px-3 text-sm text-white outline-none transition focus:border-[--color-orange-brand]/70"
                    />
                  </label>

                  <div className="rounded-xl border border-white/15 bg-[--color-nav-bg] p-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                      <span>Waste Factor</span>
                      <span>{wasteFactor}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={wasteFactor}
                      onChange={(event) =>
                        setWasteFactor(clampValue(Number(event.target.value), 0, 25))
                      }
                      className="w-full accent-[--color-orange-brand]"
                    />
                  </div>
                </div>
              </section>

              <aside ref={resultsCardRef} className="space-y-3">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors">
                  <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                    Results
                  </h2>

                  <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-[--color-orange-brand]/30 bg-black/35 p-4 shadow-[0_12px_24px_rgba(247,148,29,0.12)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
                        Total Estimate
                      </p>
                      <p className="mt-1 text-3xl font-black text-white">
                        {adjustedVolume.toFixed(2)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/15 bg-black/25 p-3 shadow-[0_8px_18px_rgba(247,148,29,0.08)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
                          Volume
                        </p>
                        <p className="mt-1 text-xl font-black text-white">
                          {volumeCubicFeet.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-black/25 p-3 shadow-[0_8px_18px_rgba(247,148,29,0.08)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
                          Material Qty
                        </p>
                        <p className="mt-1 text-xl font-black text-white">{materialQty}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[--color-orange-brand]/35 bg-[--color-orange-brand]/10 p-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                        Pro Tip
                      </h3>
                      <p className="mt-1 text-sm text-[--color-nav-text]/92">
                        {localTip}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-[--color-orange-brand] p-1.5 text-black">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          AI Material Optimizer
                        </p>
                        <p className="text-xs text-[--color-nav-text]/75">
                          Cost savings & best practices
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                    >
                      Optimize
                    </button>
                  </div>
                </section>
              </aside>
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                Trade Module Paths
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {tradeNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[--color-nav-text] transition-all duration-200 hover:border-orange-500/50 hover:text-[--color-orange-brand] active:scale-[0.98]"
                  >
                    <item.icon className="h-3.5 w-3.5 transition-all duration-200 group-hover:text-[--color-orange-brand]" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>

              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {page.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as Route}
                      className="inline-flex items-center gap-2 text-sm text-[--color-nav-text]/85 transition-all duration-300 ease-in-out hover:text-white"
                    >
                      <ArrowRight
                        className="h-3.5 w-3.5 text-[--color-orange-brand]"
                        aria-hidden
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl border border-[--color-orange-brand]/35 bg-[--color-orange-brand]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                  Field Notes
                </p>
                <p className="mt-2 text-sm text-[--color-nav-text]/90">
                  Regional guides and contractor tips — 100% on-site, no
                  external links.
                </p>
                <Link
                  href={routes.fieldNotes}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[--color-orange-brand] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-black transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                >
                  Open Field Notes
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </section>
          </div>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex min-h-12 items-center justify-between border-t trim-nav-border bg-[--color-nav-bg]/95 px-4 py-2 backdrop-blur-xl lg:hidden"
          aria-label="Mobile tool actions"
        >
          <Link
            href={routes.commandCenter}
            className="inline-flex min-h-11 items-center gap-1.5 px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[--color-nav-text] transition-all duration-200 active:scale-[0.98]"
          >
            <HardHat className="h-3.5 w-3.5" aria-hidden />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[--color-orange-brand] transition-all duration-200 active:scale-[0.98]"
          >
            <Menu className="h-3.5 w-3.5" aria-hidden />
            Modules
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex min-h-11 items-center gap-1.5 px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[--color-nav-text] transition-all duration-200 active:scale-[0.98]"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden />
            Export
          </button>
        </nav>
      </section>

      <EmailEstimateModal
        open={crmModalOpen}
        onClose={() => setCrmModalOpen(false)}
        estimate={emailEstimatePayload}
      />
    </main>
    </Sentry.ErrorBoundary>
  );
}

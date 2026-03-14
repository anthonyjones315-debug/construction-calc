"use client";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SplashPopup } from "@/components/ui/SplashPopup";
import { useStore } from "@/lib/store";
import { CALCULATORS } from "@/data";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { CalculatorId } from "@/types";

const ConcreteCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.ConcreteCalc,
  })),
);
const FramingCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.FramingCalc,
  })),
);
const RoofingCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.RoofingCalc,
  })),
);
const RoofPitchCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.RoofPitchCalc,
  })),
);
const RoofingSquaresCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.RoofingSquaresCalc,
  })),
);
const RaftersCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.RaftersCalc,
  })),
);
const FlooringCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.FlooringCalc,
  })),
);
const InsulationCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.InsulationCalc,
  })),
);
const SprayFoamCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.SprayFoamCalc,
  })),
);
const CelluloseCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.CelluloseCalc,
  })),
);
const SidingCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.SidingCalc,
  })),
);
const PaintCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.PaintCalc,
  })),
);
const WireGaugeCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.WireGaugeCalc,
  })),
);
const LaborCalc = dynamic(() =>
  import("@/components/calculator/Calculators").then((m) => ({
    default: m.LaborCalc,
  })),
);
const BudgetCalc = dynamic(() =>
  import("@/components/calculator/BudgetCalc").then((m) => ({
    default: m.BudgetCalc,
  })),
);
const UnitConverter = dynamic(() =>
  import("@/components/calculator/UnitConverter").then((m) => ({
    default: m.UnitConverter,
  })),
);

const calcMap: Record<string, React.ComponentType> = {
  concrete: ConcreteCalc,
  framing: FramingCalc,
  roofing: RoofingCalc,
  roofPitch: RoofPitchCalc,
  roofingSquares: RoofingSquaresCalc,
  rafters: RaftersCalc,
  flooring: FlooringCalc,
  insulation: InsulationCalc,
  sprayfoam: SprayFoamCalc,
  cellulose: CelluloseCalc,
  siding: SidingCalc,
  paint: PaintCalc,
  wireGauge: WireGaugeCalc,
  labor: LaborCalc,
  budget: BudgetCalc,
  unitConverter: UnitConverter,
};

const CALCULATOR_VISUALS: Partial<
  Record<CalculatorId, { src: string; alt: string }>
> = {
  concrete: {
    src: "/images/concrete-slab.svg",
    alt: "Concrete slab form and finishing layout",
  },
  framing: {
    src: "/images/wall-framing.svg",
    alt: "Wall framing studs and on-center spacing layout",
  },
  rafters: {
    src: "/images/roof-pitch.svg",
    alt: "Roof framing pitch geometry and layout",
  },
  roofing: {
    src: "/images/roof-pitch.svg",
    alt: "Roof pitch and material takeoff planning visual",
  },
  roofPitch: {
    src: "/images/roof-pitch.svg",
    alt: "Rise and run roof pitch reference",
  },
  roofingSquares: {
    src: "/images/roof-pitch.svg",
    alt: "Roof area and slope conversion visual",
  },
  insulation: {
    src: "/images/cellulose-insulation.svg",
    alt: "Insulation material planning visual for bags and coverage",
  },
  sprayfoam: {
    src: "/images/cellulose-insulation.svg",
    alt: "Insulation coverage planning for wall and attic applications",
  },
  cellulose: {
    src: "/images/cellulose-insulation.svg",
    alt: "Cellulose insulation bags staged for installation",
  },
  budget: {
    src: "/images/pricebook-materials.svg",
    alt: "Material pricing and estimate planning board",
  },
};

const FALLBACK_VISUAL = {
  src: "/images/wall-framing.svg",
  alt: "Construction planning visual",
};

function getCalculatorVisual(id: CalculatorId) {
  return CALCULATOR_VISUALS[id] ?? FALLBACK_VISUAL;
}

function CalcRouter() {
  const { activeCalculator, setActiveCalculator } = useStore();
  const params = useSearchParams();

  useEffect(() => {
    const c = params.get("c") as CalculatorId | null;
    if (c && calcMap[c]) setActiveCalculator(c);
  }, [params, setActiveCalculator]);

  const Component = calcMap[activeCalculator];
  return Component ? <Component /> : <ConcreteCalc />;
}

function AppShell() {
  const { activeCalculator } = useStore();
  const visual = getCalculatorVisual(activeCalculator);
  const activeCalc = CALCULATORS.find((c) => c.id === activeCalculator);

  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto shrink-0 flex-col">
          <Sidebar />
        </div>
        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto min-w-0"
          tabIndex={-1}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <section className="mb-5 rounded-2xl border border-gray-200/80 bg-[--color-surface] overflow-hidden shadow-sm">
              <Image
                src={visual.src}
                alt={visual.alt}
                width={1200}
                height={700}
                className="w-full h-32 sm:h-40 object-cover"
              />
              <div className="px-4 py-2.5">
                <p className="text-xs uppercase tracking-widest font-bold text-[--color-ink-dim]">
                  Current Calculator
                </p>
                <p className="text-sm font-semibold text-[--color-ink]">
                  {activeCalc?.label ?? "Construction Calculator"}
                </p>
              </div>
            </section>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <CalcRouter />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
      <Footer />
      <SplashPopup />
    </div>
  );
}

function MobileNav() {
  const { activeCalculator, setActiveCalculator } = useStore();
  const categories = [
    { id: "concrete" as CalculatorId, emoji: "🧱", label: "Concrete" },
    { id: "framing" as CalculatorId, emoji: "🔩", label: "Framing" },
    { id: "roofing" as CalculatorId, emoji: "🏠", label: "Roofing" },
    { id: "insulation" as CalculatorId, emoji: "🧶", label: "Insulate" },
    { id: "flooring" as CalculatorId, emoji: "🪵", label: "More" },
  ];

  return (
    <nav
      className="md:hidden sticky bottom-0 bg-[--color-nav-bg] border-t border-white/10 flex items-center justify-around px-2 py-2 z-40 safe-area-pb"
      aria-label="Quick calculator navigation"
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCalculator(cat.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
            activeCalculator === cat.id
              ? "text-[--color-orange-brand]"
              : "text-[#9ca3af]"
          }`}
          aria-current={activeCalculator === cat.id ? "page" : undefined}
        >
          <span className="text-lg" aria-hidden>
            {cat.emoji}
          </span>
          <span className="text-xs font-medium">{cat.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function CalculatorsPage() {
  return <AppShell />;
}

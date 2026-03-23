"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import Autocomplete from "react-google-autocomplete";
import { RoofingGlyph } from "@/app/calculators/_components/TradeGlyphs";
import {
  getCalculatorAuditRef,
  setCalculatorAuditSnapshot,
} from "@/app/calculators/_lib/calculator-audit-ref";
import { useHaptic } from "@/hooks/useHaptic";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrickWall,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  DraftingCompass,
  Gauge,
  FileDown,
  FileSpreadsheet,
  HardHat,
  Hammer,
  Layers,
  Layers3,
  Layout,
  Mail,
  Menu,
  MapPin,
  PenSquare,
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
  Trees,
  Triangle,
  Fence,
  Wind,
  Wrench,
  X,
} from "lucide-react";
import type { EstimatePayload } from "@/components/ui/EmailEstimateModal";
import { ManualErrorReportButton } from "@/components/support/ManualErrorReportButton";
import { JsonLD } from "@/seo";
import { ArticleMarkdown } from "@/components/content/ArticleMarkdown";
import {
  getTradePageSchema,
  type TradePageDefinition,
} from "@/app/calculators/_lib/trade-pages";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
// Business identity imports removed – not used in this component
import {
  getFinancialCalculatorCopy,
  getFinancialTermDefinition,
  getFinancialTermLabel,
} from "@/data/financial-terms";
import { calculateNysSalesTax } from "@/services/taxEngine";
import { routes } from "@routes";
import { UnitToggle } from "@/app/calculators/_components/UnitToggle";
import { ProInput, ProResult } from "@/components/ui/glass-elements";
import {
  FeetInchesInput,
  feetInchesToDecimal,
  decimalToFeetInches,
} from "@/components/ui/FeetInchesInput";
import { useProMode } from "@/hooks/useProMode";
import { triggerHaptic } from "@/hooks/useHaptic";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { centsToDollars, toCents } from "@/utils/money";
import {
  divideCentsByBasisPoints,
  scaleCentsByBasisPoints,
  toBasisPoints,
} from "@/utils/rates";
import { useContractorProfile } from "@/components/pdf/useContractorProfile";
import { getConcreteInputLabelsFromCopy } from "@/data/construction-terms";
import { useStore } from "@/lib/store";
import { recordVisit } from "@/lib/recommendations/activity";
import { getUserFacingErrorDetails } from "@/lib/errors/user-facing";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";

const EmailEstimateModal = dynamic(
  () =>
    import("@/components/ui/EmailEstimateModal").then(
      (mod) => mod.EmailEstimateModal,
    ),
  { ssr: false },
);

const CalculatorAuditPanel = dynamic(
  () =>
    import("@/app/calculators/_components/CalculatorAuditPanel").then((mod) => mod.CalculatorAuditPanel),
  {
    ssr: false,
    loading: () => (
      <section className="glass-panel p-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-3 w-10" />
        </div>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="glass-panel-deep rounded-lg px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  },
);

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

type CalculatorResult = {
  label: string;
  value: string;
  unit: string;
};

type CalculatorResultsBundle = {
  primary: CalculatorResult;
  secondary: CalculatorResult[];
  materialList: string[];
};

type FramingMaterialKind =
  | "wall-studs"
  | "floor-joists"
  | "roof-rafters"
  | "ceiling-joists"
  | "decking"
  | "headers";

type AreaInputMode = "dimensions" | "total-sq-ft";
type VolumeInputMode = "dimensions" | "total-cu-yd" | "total-cu-ft";
type WallInputMode = "lineal-feet" | "total-studs";
type TrimInputMode = "dimensions" | "total-lf";
type FlooringBoxMode = "20" | "24" | "30" | "custom";
type WallStudSpacingMode = "16" | "24" | "custom";
type WallStudHeightMode = "8-precut" | "9-precut" | "10" | "12" | "custom";
type RoofingPitchPreset =
  | "flat"
  | "3"
  | "4"
  | "6"
  | "8"
  | "10"
  | "12"
  | "custom";
type RoofingInputMode = "dimensions" | "direct-squares";

function getFramingMaterialFromPath(path: string): FramingMaterialKind {
  const p = path.toLowerCase();
  if (p.includes("/decking") || p.includes("deck-joists")) return "decking";
  if (p.includes("/framing/floor")) return "floor-joists";
  if (p.includes("/framing/ceiling")) return "ceiling-joists";
  if (p.includes("/framing/roof") || p.includes("rafter"))
    return "roof-rafters";
  if (p.includes("/framing/headers")) return "headers";
  return "wall-studs";
}

function getLockedFramingMaterial(path: string): FramingMaterialKind | null {
  const p = path.toLowerCase();
  if (p.includes("/decking")) return "decking";
  if (p.includes("/framing/floor")) return "floor-joists";
  if (p.includes("/framing/ceiling")) return "ceiling-joists";
  if (p.includes("/framing/roof")) return "roof-rafters";
  if (p.includes("/framing/wall")) return "wall-studs";
  if (p.includes("/framing/headers")) return "headers";
  return null;
}

function getFramingInputLabels(material: FramingMaterialKind): {
  first: string;
  second: string;
  third: string;
} {
  if (material === "floor-joists") {
    return {
      first: "Floor Length (ft)",
      second: "Joist Spacing (OC, in)",
      third: "Floor Width (ft)",
    };
  }

  if (material === "roof-rafters") {
    return {
      first: "Roof Width (ft)",
      second: "Rafter Spacing (OC)",
      third: "Rafter Length (ft)",
    };
  }

  if (material === "ceiling-joists") {
    return {
      first: "Ceiling Width (ft)",
      second: "Joist Spacing (OC)",
      third: "Joist Length (ft)",
    };
  }
  if (material === "decking") {
    return {
      first: "Deck Run (ft)",
      second: "Joist Spacing (OC)",
      third: "Decking Width (in)",
    };
  }

  if (material === "headers") {
    return {
      first: "Rough Opening Width (ft)",
      second: "Unused",
      third: "Unused",
    };
  }

  return {
    first: "Wall Length (ft)",
    second: "Stud Spacing (OC)",
    third: "Stud Height (ft)",
  };
}

const tradeNav: TradeModule[] = [
  {
    label: "Concrete",
    href: "/calculators/concrete/slab" as Route,
    icon: BrickWall,
  },
  {
    label: "Framing",
    href: "/calculators/framing/wall" as Route,
    icon: Hammer,
  },
  {
    label: "Roofing",
    href: "/calculators/roofing/shingles" as Route,
    icon: Triangle,
  },
  {
    label: "Mechanical",
    href: "/calculators/mechanical/btu-estimator" as Route,
    icon: Thermometer,
  },
  { label: "Finish", href: "/calculators/finish/trim" as Route, icon: Layout },
  {
    label: "Business",
    href: "/calculators/business/profit-margin" as Route,
    icon: BarChart3,
  },
];

const tradeModuleGroups: TradeModuleGroup[] = [
  {
    label: "Concrete",
    icon: BrickWall,
    modules: [
      {
        label: "Slab",
        href: "/calculators/concrete/slab" as Route,
        icon: Layers3,
      },
      {
        label: "Footing",
        href: "/calculators/concrete/footing" as Route,
        icon: Tractor,
      },
      {
        label: "Block",
        href: "/calculators/concrete/block" as Route,
        icon: ClipboardList,
      },
      {
        label: "Block Wall",
        href: "/calculators/concrete/block-wall" as Route,
        icon: Building2,
      },
    ],
  },
  {
    label: "Framing",
    icon: Hammer,
    modules: [
      {
        label: "Wall",
        href: "/calculators/framing/wall" as Route,
        icon: Layout,
      },
      {
        label: "Floor",
        href: "/calculators/framing/floor" as Route,
        icon: Layout,
      },
      {
        label: "Roof",
        href: "/calculators/framing/roof" as Route,
        icon: Triangle,
      },
      {
        label: "Wall Studs",
        href: "/calculators/framing/wall-studs" as Route,
        icon: Layout,
      },
      {
        label: "Headers",
        href: "/calculators/framing/headers" as Route,
        icon: ShieldCheck,
      },
      {
        label: "Rafters",
        href: "/calculators/framing/rafters" as Route,
        icon: Triangle,
      },
      {
        label: "Rafter Length",
        href: "/calculators/framing/rafter-length" as Route,
        icon: SlidersHorizontal,
      },
      {
        label: "Deck Joists",
        href: "/calculators/framing/deck-joists" as Route,
        icon: ClipboardList,
      },
      {
        label: "Decking",
        href: "/calculators/decking" as Route,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Roofing",
    icon: Triangle,
    modules: [
      {
        label: "Shingles",
        href: "/calculators/roofing/shingles" as Route,
        icon: Gauge,
      },
      {
        label: "Shingle Bundles",
        href: "/calculators/roofing/shingle-bundles" as Route,
        icon: SquareStack,
      },
      {
        label: "Pitch",
        href: "/calculators/roofing/pitch" as Route,
        icon: SlidersHorizontal,
      },
      {
        label: "Pitch & Slope",
        href: "/calculators/roofing/pitch-slope" as Route,
        icon: Timer,
      },
      {
        label: "Siding",
        href: "/calculators/roofing/siding" as Route,
        icon: Wrench,
      },
      {
        label: "Siding Squares",
        href: "/calculators/roofing/siding-squares" as Route,
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    label: "Mechanical",
    icon: ThermometerSnowflake,
    modules: [
      {
        label: "BTU Estimator",
        href: "/calculators/mechanical/btu-estimator" as Route,
        icon: Thermometer,
      },
      {
        label: "Ventilation",
        href: "/calculators/mechanical/ventilation-calc" as Route,
        icon: Gauge,
      },

    ],
  },
  {
    label: "Finish",
    icon: Layout,
    modules: [
      {
        label: "Trim",
        href: "/calculators/finish/trim" as Route,
        icon: Wrench,
      },
      {
        label: "Flooring",
        href: "/calculators/finish/flooring" as Route,
        icon: Layers3,
      },
      {
        label: "Stairs",
        href: "/calculators/finish/stairs" as Route,
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "Business",
    icon: CircleDollarSign,
    modules: [
      {
        label: "Profit Margin",
        href: "/calculators/business/profit-margin" as Route,
        icon: BarChart3,
      },
      {
        label: "Labor Rate",
        href: "/calculators/business/labor-rate" as Route,
        icon: Calculator,
      },
      {
        label: "Lead Estimator",
        href: "/calculators/business/lead-estimator" as Route,
        icon: ClipboardList,
      },
      {
        label: "Tax Save",
        href: "/calculators/business/tax-save" as Route,
        icon: FileDown,
      },
    ],
  },
  {
    label: "Landscape",
    icon: Trees,
    modules: [
      {
        label: "Mulch",
        href: "/calculators/landscape/mulch" as Route,
        icon: Trees,
      },
      {
        label: "Topsoil",
        href: "/calculators/landscape/topsoil" as Route,
        icon: Layers,
      },
      {
        label: "Sod & Seed",
        href: "/calculators/landscape/sod" as Route,
        icon: Trees,
      },
      {
        label: "Gravel & Stone",
        href: "/calculators/landscape/gravel" as Route,
        icon: Layers3,
      },
    ],
  },
  {
    label: "Outdoor",
    icon: Fence,
    modules: [
      {
        label: "Fence",
        href: "/calculators/outdoor/fence" as Route,
        icon: Fence,
      },
      {
        label: "Paver Patio",
        href: "/calculators/outdoor/paver-patio" as Route,
        icon: Layout,
      },
      {
        label: "Asphalt Driveway",
        href: "/calculators/outdoor/asphalt-driveway" as Route,
        icon: Tractor,
      },
    ],
  },
];

function clampValue(value: number, min: number, max: number) {
  const n = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, n));
}

const MAX_WASTE_FACTOR = 30;

/** Category icon — trade-specific Lucide icons, centered large on every card. */
const CATEGORY_ICON_MAP: Record<TradePageDefinition["category"], LucideIcon> = {
  concrete: Layers,
  framing: DraftingCompass,
  roofing: Triangle,
  mechanical: Wind,
  insulation: Layers3,
  finish: Layout,
  interior: Layout,
  management: ClipboardList,
  business: BarChart3,
  landscape: Trees,
  outdoor: Fence,
};

function getCategoryIcon(page: TradePageDefinition): LucideIcon {
  return CATEGORY_ICON_MAP[page.category] ?? HardHat;
}

/** Shorten long SEO titles for the visual h1; full title remains in metadata. */
function displayTitle(fullTitle: string): string {
  if (fullTitle.length <= 40) return fullTitle;
  const atCalculator = fullTitle.indexOf(" Calculator");
  if (atCalculator !== -1) return fullTitle.slice(0, atCalculator).trim();
  return fullTitle;
}

function inferUnitFromLabel(
  label: string,
  fallback?: string,
): string | undefined {
  const l = label.toLowerCase();
  if (label.includes("$")) return "$";
  if (
    l.includes("%") ||
    l.includes("rate") ||
    l.includes("margin") ||
    l.includes("markup") ||
    l.includes("burden")
  )
    return "%";
  if (l.includes("sq ft")) return "sq ft";
  if (l.includes("lf") || l.includes("lineal")) return "lf";
  if (l.includes("ft") || l.includes("foot") || l.includes("span")) return "ft";
  if (l.includes("hour")) return "hr";
  return fallback;
}

/** Trade-specific input labels using professional field terminology. */
function getInputLabels(
  path: string,
  selectedFramingMaterial: FramingMaterialKind,
): { first: string; second: string; third: string } {
  const p = path.toLowerCase();

  const financialCopy = getFinancialCalculatorCopy(path);
  if (financialCopy) {
    const [first, second, third] = financialCopy.inputs;
    return {
      first: first.label ?? getFinancialTermLabel(first.term),
      second: second.label ?? getFinancialTermLabel(second.term),
      third: third.label ?? getFinancialTermLabel(third.term),
    };
  }

  const concreteCopy = getConcreteInputLabelsFromCopy(path);
  if (concreteCopy) return concreteCopy;

  if (p.includes("framing") || p.includes("decking")) {
    return getFramingInputLabels(selectedFramingMaterial);
  }
  if (p.includes("slab"))
    return {
      first: "Linear Feet (LF)",
      second: "Slab Width (ft)",
      third: "Slab Depth (Inches)",
    };
  if (p.includes("footing"))
    return {
      first: "Linear Feet (LF)",
      second: "Footing Width (ft)",
      third: "Sub-base Depth (in)",
    };
  if (p.includes("block-wall"))
    return {
      first: "Wall Length (ft)",
      second: "Wall Height (ft)",
      third: "Block Size (in, face height)",
    };
  if (p.includes("block") || p.includes("concrete"))
    return {
      first: "Linear Feet (LF)",
      second: "Width (ft)",
      third: "Bag Yield Depth (in)",
    };
  if (p.includes("shingle"))
    return {
      first: "Squares (Roof Area)",
      second: "Bundle Overlap Factor",
      third: "Pitch Ratio",
    };
  if (p.includes("pitch"))
    return {
      first: "Roof Run (ft)",
      second: "Roof Rise (ft)",
      third: "Pitch Ratio",
    };
  if (p.includes("siding"))
    return {
      first: "Wall Length (ft)",
      second: "Wall Height (ft)",
      third: "Piece Coverage (sq ft)",
    };
  if (p.includes("roofing"))
    return {
      first: "Roof Area (sq ft)",
      second: 'Pitch (rise per 12")',
      third: "Unused",
    };
  if (p.includes("trim") || p.includes("baseboard"))
    return {
      first: "Room Length (ft)",
      second: "Room Width (ft)",
      third: "Stock Length (ft)",
    };
  if (p.includes("flooring"))
    return {
      first: "Floor Length (ft)",
      second: "Floor Width (ft)",
      third: "Sq Ft per Box",
    };
  if (p.includes("drywall"))
    return {
      first: "Total Area (sq ft)",
      second: "Unused",
      third: "Unused",
    };
  if (p.includes("r-value") || p.includes("insulation"))
    return {
      first: "Total Square Footage",
      second: "Cavity Depth (in)",
      third: "R-Value Target",
    };
  if (p.includes("btu"))
    return {
      first: "Area (sq ft)",
      second: "Ceiling Height (ft)",
      third: "Temp Rise (°F)",
    };
  if (p.includes("ventilation"))
    return {
      first: "Space Area (sq ft)",
      second: "Ceiling Height (ft)",
      third: "Target Air Changes",
    };
  if (p.includes("duct"))
    return {
      first: "Duct Static Pressure (in w.c.)",
      second: "Ventilation CFM",
      third: "Duct Run (ft)",
    };
  if (p.includes("mechanical"))
    return {
      first: "BTU Load (sq ft)",
      second: "Ventilation CFM",
      third: "Duct Static Pressure",
    };
  if (p.includes("profit") || p.includes("margin"))
    return {
      first: "Job Cost ($)",
      second: "Markup Rate (%)",
      third: "Overhead (%)",
    };
  if (p.includes("labor"))
    return {
      first: "Hourly Rate ($)",
      second: "Burden Rate (%)",
      third: "Crew Size",
    };
  if (p.includes("lead"))
    return {
      first: "Cost Per Lead ($)",
      second: "Close Rate (%)",
      third: "Monthly Leads",
    };
  if (p.includes("tax"))
    return {
      first: "Gross Revenue ($)",
      second: "Tax Rate (%)",
      third: "Deductions ($)",
    };
  if (p.includes("business"))
    return {
      first: "Base Amount ($)",
      second: "Rate / Factor (%)",
      third: "Quantity / Units",
    };
  // Landscape calculators
  if (p.includes("sod"))
    return {
      first: "Area Length (ft)",
      second: "Area Width (ft)",
      third: "Unused",
    };
  if (p.includes("mulch") || p.includes("topsoil") || p.includes("gravel"))
    return {
      first: "Area Length (ft)",
      second: "Area Width (ft)",
      third: "Depth (in)",
    };
  // Outdoor calculators
  if (p.includes("fence"))
    return {
      first: "Total Linear Feet (LF)",
      second: "Fence Height (ft)",
      third: "Post Spacing (ft)",
    };
  if (p.includes("paver"))
    return {
      first: "Patio Length (ft)",
      second: "Patio Width (ft)",
      third: "Base Depth (in)",
    };
  if (p.includes("asphalt"))
    return {
      first: "Driveway Length (ft)",
      second: "Driveway Width (ft)",
      third: "Thickness (in)",
    };
  return {
    first: "Primary Measurement",
    second: "Secondary Measurement",
    third: "Tertiary Measurement",
  };
}

function getPrimaryDisplayUnit(result: CalculatorResult): string {
  if (
    result.label === "Floor Joists" ||
    result.label === "Rafters" ||
    result.label === "Ceiling Joists" ||
    result.label === "Studs" ||
    result.label === "Deck Joists" ||
    result.label.startsWith("Total ")
  ) {
    return result.label.replace(/^Total\s+/, "");
  }
  if (result.label === "Squares") return "Squares";
  if (result.label === "Pieces") return "Pieces";
  if (result.label.toLowerCase().includes("box")) return "Boxes";
  return result.unit;
}

function isMonetaryResult(result: CalculatorResult): boolean {
  const label = result.label.toLowerCase();
  const monetaryLabels = ["cost", "price", "profit", "tax", "revenue", "rate"];
  return (
    result.unit.includes("$") ||
    result.unit.includes("$/") ||
    monetaryLabels.some((word) => label.includes(word))
  );
}

function normalizeDisplayedLabel(label: string, path: string): string {
  if (!path.toLowerCase().includes("/framing/floor")) return label;
  return label.replace(/\bStuds?\b/g, (match) =>
    match.toLowerCase() === "studs" ? "Joists" : "Joist",
  );
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: Route }> = [
    { label: "Home", href: "/" as Route },
  ];

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

type CalculatorPageProps = {
  page: TradePageDefinition;
  closeModal?: () => void;
};

function getHeroImageForKey(key: string): string {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('concrete') || lowerKey.includes('block')) return 'concrete';
  if (lowerKey.includes('rafter')) return 'rafters';
  if (lowerKey.includes('pitch')) return 'roofPitch';
  if (lowerKey.includes('square')) return 'roofingSquares';
  if (lowerKey.includes('shingle') || lowerKey.includes('roof')) return 'roofing';
  if (lowerKey.includes('framing') || lowerKey.includes('stud') || lowerKey.includes('header') || lowerKey.includes('joist') || lowerKey.includes('deck')) return 'framing';
  if (lowerKey.includes('sprayfoam')) return 'sprayfoam';
  if (lowerKey.includes('cellulose')) return 'cellulose';
  if (lowerKey.includes('insulation') || lowerKey.includes('r-value')) return 'insulation';
  if (lowerKey.includes('floor')) return 'flooring';
  if (lowerKey.includes('siding')) return 'siding';
  if (lowerKey.includes('paint')) return 'paint';
  if (lowerKey.includes('labor') || lowerKey.includes('lead') || lowerKey.includes('margin') || lowerKey.includes('manage') || lowerKey.includes('business')) return 'labor';
  if (lowerKey.includes('budget') || lowerKey.includes('tax')) return 'budget';
  if (lowerKey.includes('unit') || lowerKey.includes('convert')) return 'unitConverter';
  if (lowerKey.includes('finish') || lowerKey.includes('trim') || lowerKey.includes('stair') || lowerKey.includes('interior')) return 'flooring';
  if (lowerKey.includes('mechanical') || lowerKey.includes('duct') || lowerKey.includes('vent') || lowerKey.includes('btu')) return 'unitConverter';
  return 'framing';
}

export function CommandCenterCalculator({ page, closeModal }: CalculatorPageProps) {
  const calculatorShellRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const contractorProfile = useContractorProfile();
  const { proMode, mounted } = useProMode();
  const effectiveProMode = mounted && proMode;
  const lockedFramingMaterial = getLockedFramingMaterial(page.canonicalPath);
  const canShowPricing = Boolean(session?.user?.id);
  const financialCopy = useMemo(
    () => getFinancialCalculatorCopy(page.canonicalPath),
    [page.canonicalPath],
  );
  const terminologyTerms = useMemo(() => {
    if (!financialCopy) return [];
    const seen = new Set<string>();
    return financialCopy.inputs
      .map((input) => {
        const label = getFinancialTermLabel(input.term);
        const definition =
          getFinancialTermDefinition(label) ??
          getFinancialTermDefinition(input.term);
        if (!definition || seen.has(label)) return null;
        seen.add(label);
        return {
          key: input.term,
          label,
          definition,
          unit: input.unit ?? "",
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          key: import("@/data/financial-terms").FinancialTermKey;
          label: string;
          definition: string;
          unit: string;
        } => Boolean(entry),
      );
  }, [financialCopy]);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFramingMaterial, setSelectedFramingMaterial] =
    useState<FramingMaterialKind>(
      () =>
        lockedFramingMaterial ?? getFramingMaterialFromPath(page.canonicalPath),
    );
  const [openModuleGroup, setOpenModuleGroup] = useState<string | null>(null);
  const [crmModalOpen, setCrmModalOpen] = useState(false);
  // For feet/inches input support
  const [baseMeasurement, setBaseMeasurement] = useState(10);
  const [baseFeet, setBaseFeet] = useState(10);
  const [baseInches, setBaseInches] = useState(0);
  const [widthSpan, setWidthSpan] = useState(10);
  const [widthFeet, setWidthFeet] = useState(10);
  const [widthInches, setWidthInches] = useState(0);
  const [depthThickness, setDepthThickness] = useState(4);
  const [wasteFactor, setWasteFactor] = useState(10);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "corrected" | "downloaded"
  >("idle");
  const [areaInputMode, setAreaInputMode] =
    useState<AreaInputMode>("dimensions");
  const [volumeInputMode, setVolumeInputMode] =
    useState<VolumeInputMode>("dimensions");
  const [wallInputMode, setWallInputMode] =
    useState<WallInputMode>("lineal-feet");
  const [wallStudSpacingMode, setWallStudSpacingMode] =
    useState<WallStudSpacingMode>("16");
  const [wallStudCustomSpacingInches, setWallStudCustomSpacingInches] =
    useState(16);
  const [wallStudHeightMode, setWallStudHeightMode] =
    useState<WallStudHeightMode>("8-precut");
  const [wallStudCustomHeightFeet, setWallStudCustomHeightFeet] = useState(8);
  const [staggeredStudWall, setStaggeredStudWall] = useState(false);
  const [roofingInputMode, setRoofingInputMode] =
    useState<RoofingInputMode>("dimensions");
  const [roofSquaresInput, setRoofSquaresInput] = useState(20);
  const [roofOverhangInches, setRoofOverhangInches] = useState(12);
  const [roofPitchPreset, setRoofPitchPreset] =
    useState<RoofingPitchPreset>("6");
  const [roofPitchRiseCustom, setRoofPitchRiseCustom] = useState(6);
  const [totalSquareFeetInput, setTotalSquareFeetInput] = useState(100);
  const [totalCubicYardsInput, setTotalCubicYardsInput] = useState(1);
  const [totalCubicFeetInput, setTotalCubicFeetInput] = useState(27);
  const [totalStudsInput, setTotalStudsInput] = useState(16);
  const [trimInputMode, setTrimInputMode] =
    useState<TrimInputMode>("dimensions");
  const [totalLinealFeetInput, setTotalLinealFeetInput] = useState(100);
  const [openingDeductionSqFt, setOpeningDeductionSqFt] = useState(0);
  const [flooringBoxMode, setFlooringBoxMode] =
    useState<FlooringBoxMode>("custom");
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalizeBusy, setFinalizeBusy] = useState<"pdf" | "sign" | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeSuccess, setFinalizeSuccess] = useState<string | null>(null);
  const [createdSignUrl, setCreatedSignUrl] = useState<string | null>(null);
  /** Re-finalizing updates this row instead of inserting a duplicate. */
  const [finalizeEstimateId, setFinalizeEstimateId] = useState<string | null>(
    null,
  );
  const [aiOptimizeBusy, setAiOptimizeBusy] = useState(false);
  const [aiOptimizeError, setAiOptimizeError] = useState<string | null>(null);
  const [aiOptimizeContent, setAiOptimizeContent] = useState<string | null>(
    null,
  );
  const [estimateName, setEstimateName] = useState(
    `${displayTitle(page.title)} Estimate`,
  );
  const [estimateClientName, setEstimateClientName] = useState("");
  const [estimateClientEmail, setEstimateClientEmail] = useState("");
  const [estimateJobName, setEstimateJobName] = useState("");
  const [estimateJobAddress, setEstimateJobAddress] = useState("");
  const [estimateQuoteNote, setEstimateQuoteNote] = useState("");
  const [estimateInternalNote, setEstimateInternalNote] = useState("");

  const haptic = useHaptic();
  const hapticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstCalcRender = useRef(true);
  const userInteracted = useRef(false);
  const didAutoFocusRef = useRef(false);
  const hasReportedError = useRef(false);
  const resultsCardRef = useRef<HTMLElement | null>(null);
  const moduleDropdownRef = useRef<HTMLDivElement | null>(null);
  const [iconPulse, setIconPulse] = useState(false);
  const isBusinessTaxSave =
    page.canonicalPath === "/calculators/business/tax-save" ||
    page.key === "business-tax-save";
  const [taxRegion, setTaxRegion] = useState<"NYS" | "Other">("NYS");
  const [taxCounty, setTaxCounty] = useState<string>("Oneida");
  const deviceProfile = useDeviceProfile();
  const [capitalImprovement, setCapitalImprovement] = useState(false);

  // Collapsible section states
  const [wasteFactorOpen, setWasteFactorOpen] = useState(true);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(page.canonicalPath),
    [page.canonicalPath],
  );

  useEffect(() => {
    setSelectedFramingMaterial(
      lockedFramingMaterial ?? getFramingMaterialFromPath(page.canonicalPath),
    );
  }, [lockedFramingMaterial, page.canonicalPath]);

  useEffect(() => {
    setAreaInputMode("dimensions");
    setVolumeInputMode("dimensions");
    setWallInputMode("lineal-feet");
    setWallStudSpacingMode("16");
    setWallStudCustomSpacingInches(16);
    setWallStudHeightMode("8-precut");
    setWallStudCustomHeightFeet(8);
    setStaggeredStudWall(false);
    setRoofingInputMode("dimensions");
    setRoofSquaresInput(20);
    setRoofOverhangInches(12);
    setRoofPitchPreset("6");
    setRoofPitchRiseCustom(6);
    setTrimInputMode("dimensions");
    setOpeningDeductionSqFt(0);
    setFlooringBoxMode("custom");
    setCapitalImprovement(false);

    if (financialCopy) {
      setBaseMeasurement(financialCopy.inputs[0].defaultValue);
      setWidthSpan(financialCopy.inputs[1].defaultValue);
      setDepthThickness(financialCopy.inputs[2].defaultValue);
      // Sync feet/inches for slab calculators
      if (page.canonicalPath === "/calculators/concrete/slab") {
        const { feet: bf, inches: bi } = decimalToFeetInches(
          financialCopy.inputs[0].defaultValue,
        );
        setBaseFeet(bf);
        setBaseInches(bi);
        const { feet: wf, inches: wi } = decimalToFeetInches(
          financialCopy.inputs[1].defaultValue,
        );
        setWidthFeet(wf);
        setWidthInches(wi);
      }
    } else {
      setBaseMeasurement(10);
      setWidthSpan(10);
      setDepthThickness(4);
      if (page.canonicalPath === "/calculators/concrete/slab") {
        setBaseFeet(10);
        setBaseInches(0);
        setWidthFeet(10);
        setWidthInches(0);
      }
    }
  }, [financialCopy, page.canonicalPath]);

  useEffect(() => {
    setEstimateName(`${displayTitle(page.title)} Estimate`);
    setEstimateClientName("");
    setEstimateClientEmail("");
    setEstimateJobName("");
    setEstimateJobAddress("");

    setFinalizeOpen(false);
    setFinalizeError(null);
    setFinalizeSuccess(null);
    setCreatedSignUrl(null);
  }, [page.title]);

  useEffect(() => {
    if (!deviceProfile.isMobile || didAutoFocusRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      calculatorShellRef.current
        ?.querySelectorAll<HTMLInputElement>('input[type="number"]')
        .forEach((input) => {
          input.inputMode = "decimal";
          input.enterKeyHint = "done";
        });

      const firstNumericInput =
        calculatorShellRef.current?.querySelector<HTMLInputElement>(
          'input[type="number"]',
        );

      if (!firstNumericInput) return;
      if (
        document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body
      ) {
        return;
      }

      firstNumericInput.focus({ preventScroll: true });
      didAutoFocusRef.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [deviceProfile.isMobile, page.canonicalPath]);

  useEffect(() => {
    didAutoFocusRef.current = false;
  }, [page.canonicalPath]);

  useEffect(() => {
    if (
      !deviceProfile.isMobile ||
      typeof window === "undefined" ||
      !window.visualViewport
    ) {
      return;
    }

    const viewport = window.visualViewport;
    const syncKeyboardInset = () => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${inset}px`,
      );
    };

    syncKeyboardInset();
    viewport.addEventListener("resize", syncKeyboardInset);
    viewport.addEventListener("scroll", syncKeyboardInset);

    return () => {
      viewport.removeEventListener("resize", syncKeyboardInset);
      viewport.removeEventListener("scroll", syncKeyboardInset);
      document.documentElement.style.setProperty("--keyboard-inset", "0px");
    };
  }, [deviceProfile.isMobile]);

  // Personalization: record calculator visit for "recommended starting points" (cookie-gated)
  useEffect(() => {
    recordVisit(page.canonicalPath);
  }, [page.canonicalPath]);

  // Calculator Audit: keep Sentry context updated with current inputs for reproduction
  useEffect(() => {
    setCalculatorAuditSnapshot({
      inputs: {
        baseMeasurement,
        widthSpan,
        depthThickness,
        wasteFactor,
        areaInputMode,
        volumeInputMode,
        wallInputMode,
        totalSquareFeetInput,
        totalCubicYardsInput,
        totalCubicFeetInput,
        totalStudsInput,
        totalLinealFeetInput,
        openingDeductionSqFt,
        trimInputMode,
        flooringBoxMode,
        canonicalPath: page.canonicalPath,
      },
      trade: page.category,
      canonicalPath: page.canonicalPath,
    });
  }, [
    areaInputMode,
    baseMeasurement,
    depthThickness,
    page.canonicalPath,
    page.category,
    totalCubicFeetInput,
    totalCubicYardsInput,
    totalSquareFeetInput,
    totalLinealFeetInput,
    totalStudsInput,
    trimInputMode,
    volumeInputMode,
    wallInputMode,
    wasteFactor,
    widthSpan,
    openingDeductionSqFt,
    flooringBoxMode,
  ]);

  const isFlooringRoute = page.canonicalPath.includes("flooring");
  const isSidingRoute = page.canonicalPath.includes("siding");
  const isTrimRoute =
    page.canonicalPath.includes("trim") ||
    page.canonicalPath.includes("baseboard");

  const supportsAreaToggle =
    page.type === "calculator" &&
    (isFlooringRoute ||
      (page.category === "roofing" && !page.canonicalPath.includes("pitch")));
  const supportsConcreteVolumeToggle =
    page.type === "calculator" &&
    page.category === "concrete" &&
    !page.canonicalPath.includes("block-wall");
  const activeFramingMaterial =
    lockedFramingMaterial ?? selectedFramingMaterial;
  const supportsWallStudToggle =
    page.type === "calculator" &&
    page.category === "framing" &&
    activeFramingMaterial === "wall-studs";
  const supportsTrimLfToggle = page.type === "calculator" && isTrimRoute;
  const isAreaTotalMode = supportsAreaToggle && areaInputMode === "total-sq-ft";
  const isConcreteTotalVolumeMode =
    supportsConcreteVolumeToggle && volumeInputMode !== "dimensions";
  const isWallStudTotalMode =
    supportsWallStudToggle && wallInputMode === "total-studs";
  const isTrimTotalLfMode =
    supportsTrimLfToggle && trimInputMode === "total-lf";
  const canUseSignAndReturn = effectiveProMode && Boolean(session?.user?.id);

  const dimensionsAreaSquareFeet =
    clampValue(baseMeasurement, 0, 10000) * clampValue(widthSpan, 0, 10000);
  const dimensionsLinealFeet =
    clampValue(baseMeasurement, 0, 10000) * 2 +
    clampValue(widthSpan, 0, 10000) * 2;
  const dimensionsVolumeCubicFeet =
    clampValue(baseMeasurement, 0, 10000) *
    clampValue(widthSpan, 0, 10000) *
    (clampValue(depthThickness, 0, 96) / 12);
  const grossAreaSquareFeet = isAreaTotalMode
    ? clampValue(totalSquareFeetInput, 0, 100000000)
    : dimensionsAreaSquareFeet;
  const totalLinealFeet = isTrimTotalLfMode
    ? clampValue(totalLinealFeetInput, 0, 100000000)
    : dimensionsLinealFeet;
  const deductionSqFt = isSidingRoute
    ? clampValue(openingDeductionSqFt, 0, 100000000)
    : 0;
  const areaSquareFeet = Math.max(1, grossAreaSquareFeet - deductionSqFt);
  const volumeCubicFeet = isConcreteTotalVolumeMode
    ? volumeInputMode === "total-cu-yd"
      ? clampValue(totalCubicYardsInput, 0.01, 1000000) * 27
      : clampValue(totalCubicFeetInput, 0, 100000000)
    : dimensionsVolumeCubicFeet;
  const adjustedVolume =
    volumeCubicFeet * (1 + clampValue(wasteFactor, 0, MAX_WASTE_FACTOR) / 100);
  const materialQty = Math.ceil(adjustedVolume * 1.7);
  const adjustedCubicYards = adjustedVolume / 27;
  const wasteMultiplier =
    1 + clampValue(wasteFactor, 0, MAX_WASTE_FACTOR) / 100;
  const adjustedAreaSquareFeet = areaSquareFeet * wasteMultiplier;
  const showFramingMaterialSelector =
    page.category === "framing" &&
    lockedFramingMaterial === null &&
    page.canonicalPath === "/calculators/framing";

  function handleAreaInputModeChange(nextMode: AreaInputMode) {
    if (nextMode === "total-sq-ft" && areaInputMode === "dimensions") {
      setTotalSquareFeetInput(Number(dimensionsAreaSquareFeet.toFixed(2)));
    }
    setAreaInputMode(nextMode);
  }

  function handleVolumeInputModeChange(nextMode: VolumeInputMode) {
    if (nextMode === volumeInputMode) return;

    if (nextMode === "total-cu-ft") {
      if (volumeInputMode === "dimensions") {
        setTotalCubicFeetInput(Number(dimensionsVolumeCubicFeet.toFixed(2)));
      } else if (volumeInputMode === "total-cu-yd") {
        setTotalCubicFeetInput(Number((totalCubicYardsInput * 27).toFixed(2)));
      }
    }

    if (nextMode === "total-cu-yd") {
      if (volumeInputMode === "dimensions") {
        setTotalCubicYardsInput(
          Number((dimensionsVolumeCubicFeet / 27).toFixed(2)),
        );
      } else if (volumeInputMode === "total-cu-ft") {
        setTotalCubicYardsInput(Number((totalCubicFeetInput / 27).toFixed(2)));
      }
    }

    setVolumeInputMode(nextMode);
  }

  function handleWallInputModeChange(nextMode: WallInputMode) {
    if (nextMode === "total-studs" && wallInputMode === "lineal-feet") {
      const spacingOcInches = clampValue(widthSpan, 8, 48);
      const spacingFeet = spacingOcInches / 12;
      const runFeet = clampValue(baseMeasurement, 0, 10000);
      const currentStuds = Math.max(8, Math.ceil(runFeet / spacingFeet) + 1);
      setTotalStudsInput(currentStuds);
    }
    setWallInputMode(nextMode);
  }

  function handleTrimInputModeChange(nextMode: TrimInputMode) {
    if (nextMode === "total-lf" && trimInputMode === "dimensions") {
      setTotalLinealFeetInput(Number(dimensionsLinealFeet.toFixed(2)));
    }
    setTrimInputMode(nextMode);
  }

  function handleFlooringBoxModeChange(nextMode: FlooringBoxMode) {
    setFlooringBoxMode(nextMode);
    if (nextMode === "20") setDepthThickness(20);
    if (nextMode === "24") setDepthThickness(24);
    if (nextMode === "30") setDepthThickness(30);
  }

  const calculatorResults: CalculatorResultsBundle = useMemo(() => {
    const isFlooringCalculator = page.canonicalPath.includes("flooring");
    const isSidingCalculator = page.canonicalPath.includes("siding");
    const isTrimCalculator =
      page.canonicalPath.includes("trim") ||
      page.canonicalPath.includes("baseboard");
    const isDrywallCalculator = page.canonicalPath.includes("drywall");
    const isWallFramingCalculator =
      page.category === "framing" &&
      activeFramingMaterial === "wall-studs" &&
      page.canonicalPath.includes("/framing/wall");
    const wallSpacingOcInches =
      wallStudSpacingMode === "custom"
        ? clampValue(wallStudCustomSpacingInches, 8, 48)
        : Number(wallStudSpacingMode);
    const spacingOcInches = isWallFramingCalculator
      ? wallSpacingOcInches
      : clampValue(widthSpan, 8, 48);
    const runFeet = clampValue(baseMeasurement, 0, 10000);
    const wallStudLengthFeet = (() => {
      if (!isWallFramingCalculator) return null;
      if (wallStudHeightMode === "8-precut") return 92.625 / 12;
      if (wallStudHeightMode === "9-precut") return 104.625 / 12;
      if (wallStudHeightMode === "10") return 10;
      if (wallStudHeightMode === "12") return 12;
      return clampValue(wallStudCustomHeightFeet, 0, 20);
    })();
    const framingLengthFeet = isWallFramingCalculator
      ? (wallStudLengthFeet ?? 8)
      : clampValue(depthThickness, 0, 10000);
    const nominalLength = Math.max(8, Math.ceil(framingLengthFeet));
    const wallStudTargetCount = Math.max(
      2,
      Math.round(clampValue(totalStudsInput, 2, 50000)),
    );
    const wallDerivedSpacingOcInches =
      (runFeet / Math.max(wallStudTargetCount - 1, 1)) * 12;
    const effectiveSpacingOcInches =
      activeFramingMaterial === "wall-studs" && isWallStudTotalMode
        ? wallDerivedSpacingOcInches
        : spacingOcInches;
    const spacingFeet = effectiveSpacingOcInches / 12;
    const getBoardFeet = (
      pieces: number,
      thicknessInches: number,
      widthInches: number,
      lengthFeet: number,
    ) => (pieces * thicknessInches * widthInches * lengthFeet) / 12;

    if (page.category === "business" || page.category === "management") {
      const currency = (cents: number) => centsToDollars(cents).toFixed(2);

      if (
        page.canonicalPath.includes("profit-margin") ||
        page.canonicalPath.includes("management/margin")
      ) {
        const directCost = clampValue(baseMeasurement, 0, 100000000);
        const overheadPct = clampValue(widthSpan, 0, 100);
        const targetMarginPct = clampValue(depthThickness, 0, 95);
        const directCostCents = toCents(directCost);
        const overheadBasisPoints = toBasisPoints(overheadPct);
        const targetMarginBasisPoints = toBasisPoints(targetMarginPct);
        const overheadCents = scaleCentsByBasisPoints(
          directCostCents,
          overheadBasisPoints,
        );
        const breakEvenPriceCents = directCostCents + overheadCents;
        const sellPriceCents =
          targetMarginPct >= 95
            ? breakEvenPriceCents
            : divideCentsByBasisPoints(
                breakEvenPriceCents,
                10_000 - targetMarginBasisPoints,
              );
        const grossProfitCents = sellPriceCents - breakEvenPriceCents;
        const grossMarginPct =
          sellPriceCents === 0 ? 0 : (grossProfitCents / sellPriceCents) * 100;
        const markupPct =
          directCostCents === 0
            ? 0
            : ((sellPriceCents - directCostCents) / directCostCents) * 100;

        return {
          primary: {
            label: "Bid / Selling Price",
            value: currency(sellPriceCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Break-even Price",
              value: currency(breakEvenPriceCents),
              unit: "$",
            },
            {
              label: "Gross Profit",
              value: currency(grossProfitCents),
              unit: "$",
            },
            {
              label: "Gross Margin",
              value: grossMarginPct.toFixed(1),
              unit: "%",
            },
            {
              label: "Markup on Cost",
              value: markupPct.toFixed(1),
              unit: "%",
            },
          ],
          materialList: [
            `Break-even covers $${currency(overheadCents)} overhead at ${overheadPct.toFixed(1)}%.`,
            `Bid price targets ${targetMarginPct.toFixed(1)}% gross margin (${markupPct.toFixed(1)}% markup).`,
          ],
        };
      }

      if (
        page.canonicalPath.includes("labor-rate") ||
        page.canonicalPath.includes("management/labor")
      ) {
        const baseWage = clampValue(baseMeasurement, 0, 1000000);
        const burdenPct = clampValue(widthSpan, 0, 200);
        const overheadPct = clampValue(depthThickness, 0, 200);
        const baseWageCents = toCents(baseWage);
        const burdenBasisPoints = toBasisPoints(burdenPct);
        const overheadBasisPoints = toBasisPoints(overheadPct);
        const burdenedRateCents = scaleCentsByBasisPoints(
          baseWageCents,
          10_000 + burdenBasisPoints,
        );
        const loadedRateCents = scaleCentsByBasisPoints(
          baseWageCents,
          10_000 + burdenBasisPoints + overheadBasisPoints,
        );
        const profitTargetPct = 15;
        const profitTargetBasisPoints = toBasisPoints(profitTargetPct);
        const billableRateCents = divideCentsByBasisPoints(
          loadedRateCents,
          10_000 - profitTargetBasisPoints,
        );
        const profitPerHourCents = billableRateCents - loadedRateCents;

        return {
          primary: {
            label: "Billable Rate (target 15% profit)",
            value: currency(billableRateCents),
            unit: "$/hr",
          },
          secondary: [
            {
              label: "Loaded Cost Rate",
              value: currency(loadedRateCents),
              unit: "$/hr",
            },
            {
              label: "Burdened Labor Rate",
              value: currency(burdenedRateCents),
              unit: "$/hr",
            },
            {
              label: "Profit per Hour",
              value: currency(profitPerHourCents),
              unit: "$/hr",
            },
          ],
          materialList: [
            `Loaded labor includes ${burdenPct.toFixed(1)}% burden and ${overheadPct.toFixed(1)}% overhead.`,
            `Charge ~$${currency(billableRateCents)} per hour to hold ~${profitTargetPct}% profit after overhead.`,
          ],
        };
      }

      if (
        page.canonicalPath.includes("lead-estimator") ||
        page.canonicalPath.includes("management/leads")
      ) {
        const costPerLead = clampValue(baseMeasurement, 0, 100000000);
        const closeRatePct = clampValue(widthSpan, 0.01, 100);
        const avgJobValue = clampValue(depthThickness, 0, 1_000_000_000);
        const costPerLeadCents = toCents(costPerLead);
        const avgJobValueCents = toCents(avgJobValue);
        const closeRateBasisPoints = toBasisPoints(closeRatePct);
        const customerAcquisitionCostCents =
          closeRateBasisPoints === 0
            ? 0
            : divideCentsByBasisPoints(costPerLeadCents, closeRateBasisPoints);
        const revenuePerLeadCents = scaleCentsByBasisPoints(
          avgJobValueCents,
          closeRateBasisPoints,
        );
        const paybackMultiple =
          customerAcquisitionCostCents === 0
            ? 0
            : avgJobValueCents / customerAcquisitionCostCents;

        return {
          primary: {
            label: "Customer Acquisition Cost (CAC)",
            value: currency(customerAcquisitionCostCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Revenue per Lead",
              value: currency(revenuePerLeadCents),
              unit: "$",
            },
            {
              label: "Close Rate",
              value: closeRatePct.toFixed(1),
              unit: "%",
            },
            {
              label: "Payback Ratio",
              value: paybackMultiple.toFixed(2),
              unit: "x",
            },
          ],
          materialList: [
            `CAC assumes ${closeRatePct.toFixed(1)}% close rate on $${currency(costPerLeadCents)} CPL.`,
            `Avg job value $${currency(avgJobValueCents)} yields ${paybackMultiple.toFixed(2)}x payback.`,
          ],
        };
      }

      if (page.canonicalPath.includes("tax-save")) {
        const grossRevenue = clampValue(baseMeasurement, 0, 1_000_000_000);
        const taxRatePct = clampValue(widthSpan, 0, 100);
        const deductionsValue = clampValue(depthThickness, 0, 1_000_000_000);
        const grossRevenueCents = toCents(grossRevenue);
        const deductionsCents = toCents(deductionsValue);
        const taxableIncomeCents = Math.max(
          0,
          grossRevenueCents - deductionsCents,
        );
        const rateSourceCounty =
          taxRegion === "NYS" ? taxCounty : "Custom / Other";
        const taxResult = calculateNysSalesTax({
          county: rateSourceCounty,
          taxableAmount: centsToDollars(taxableIncomeCents),
          projectType: capitalImprovement
            ? "capital-improvement"
            : "repair-maintenance",
          customCombinedRate: taxRegion === "NYS" ? undefined : taxRatePct,
        });
        const rateApplied = taxResult.rateApplied || taxRatePct;
        const rateAppliedBasisPoints = toBasisPoints(rateApplied);
        const taxOwedCents = toCents(taxResult.taxDue);
        const netIncomeCents = Math.max(0, grossRevenueCents - taxOwedCents);
        const effectiveTaxRate =
          grossRevenueCents === 0
            ? 0
            : (taxOwedCents / grossRevenueCents) * 100;
        const taxSavingsCents = capitalImprovement
          ? 0
          : scaleCentsByBasisPoints(
              grossRevenueCents - taxableIncomeCents,
              rateAppliedBasisPoints,
            );

        return {
          primary: {
            label: "Projected Tax",
            value: currency(taxOwedCents),
            unit: "$",
          },
          secondary: [
            {
              label: "Taxable Income",
              value: currency(taxableIncomeCents),
              unit: "$",
            },
            {
              label: "Net Income After Tax",
              value: currency(netIncomeCents),
              unit: "$",
            },
            {
              label: "Effective Tax Rate",
              value: effectiveTaxRate.toFixed(2),
              unit: "%",
            },
            ...(capitalImprovement
              ? [
                  {
                    label: "Capital Improvement",
                    value: "ST-124 on file",
                    unit: "",
                  },
                ]
              : [
                  {
                    label: "State Portion",
                    value: currency(toCents(taxResult.statePortion)),
                    unit: "$",
                  },
                  {
                    label: "Local Portion",
                    value: currency(toCents(taxResult.localPortion)),
                    unit: "$",
                  },
                ]),
            {
              label: "Tax Savings From Deductions",
              value: currency(taxSavingsCents),
              unit: "$",
            },
          ],
          materialList: [
            capitalImprovement
              ? "Capital Improvement: collect NYS Form ST-124; do not charge sales tax on labor."
              : `${rateApplied.toFixed(2)}% blended tax on $${currency(taxableIncomeCents)} taxable income.`,
            capitalImprovement
              ? "Pay sales tax on materials at purchase; retain ST-124 for audit trail."
              : `State: $${currency(toCents(taxResult.statePortion))} · Local: $${currency(toCents(taxResult.localPortion))}`,
            `Deductions reduce tax by $${currency(taxSavingsCents)}.`,
            ...taxResult.notes,
          ],
        };
      }
    }

    if (isDrywallCalculator) {
      const rawAreaSqFt = clampValue(baseMeasurement, 0, 100000000);
      const adjustedArea = rawAreaSqFt * wasteMultiplier;
      const sheets4x8 = Math.max(1, Math.ceil(adjustedArea / 32));
      const sheets4x12 = Math.max(1, Math.ceil(adjustedArea / 48));
      const jointBuckets = Math.max(1, Math.ceil(adjustedArea / 500));
      return {
        primary: {
          label: "Total Sheets (4x8)",
          value: sheets4x8.toString(),
          unit: "sheets",
        },
        secondary: [
          {
            label: "Total Sheets (4x12)",
            value: sheets4x12.toString(),
            unit: "sheets",
          },
          {
            label: "Joint Compound (Buckets)",
            value: jointBuckets.toString(),
            unit: "buckets",
          },
        ],
        materialList: [
          `${sheets4x8} sheets of 4x8 Fire-Rated Drywall (Type X / 5/8").`,
          `Includes ${jointBuckets} buckets of Ready-Mixed All-Purpose Joint Compound.`,
        ],
      };
    }

    if (isTrimCalculator) {
      const stockLengthFeet = clampValue(depthThickness, 4, 20);
      const adjustedLinealFeet = totalLinealFeet * wasteMultiplier;
      const stickCount = Math.max(
        1,
        Math.ceil(adjustedLinealFeet / stockLengthFeet),
      );
      return {
        primary: {
          label: "Linear Feet (LF)",
          value: adjustedLinealFeet.toFixed(2),
          unit: "lf",
        },
        secondary: [
          {
            label: "Stock Length",
            value: stockLengthFeet.toFixed(0),
            unit: "ft",
          },
          {
            label: "Full Sticks",
            value: stickCount.toString(),
            unit: "pcs",
          },
        ],
        materialList: [
          `${stickCount} full sticks @ ${stockLengthFeet.toFixed(0)}'`,
        ],
      };
    }

    if (isFlooringCalculator) {
      const sqFtPerBox = clampValue(depthThickness, 0, 250);
      const boxCount = Math.max(
        1,
        Math.ceil(adjustedAreaSquareFeet / sqFtPerBox),
      );
      return {
        primary: {
          label: "Total Boxes",
          value: boxCount.toString(),
          unit: "boxes",
        },
        secondary: [
          {
            label: "Coverage Area",
            value: adjustedAreaSquareFeet.toFixed(2),
            unit: "sq ft",
          },
          {
            label: "Sq Ft per Box",
            value: sqFtPerBox.toFixed(2),
            unit: "sq ft",
          },
        ],
        materialList: [
          `${boxCount} Flooring Boxes`,
          `Coverage planned: ${adjustedAreaSquareFeet.toFixed(2)} sq ft`,
        ],
      };
    }

    if (page.category === "framing") {
      if (activeFramingMaterial === "floor-joists") {
        const floorLength = runFeet;
        const floorWidth = framingLengthFeet;
        const totalJoists = Math.max(
          2,
          Math.ceil(floorLength / spacingFeet) + 1,
        );
        const rimJoistsLf = Math.max(1, floorLength * 2 + floorWidth * 2);
        const floorAreaSqFt = floorLength * floorWidth;
        const adjustedFloorArea = floorAreaSqFt * wasteMultiplier;
        const subfloorSheets = Math.max(1, Math.ceil(adjustedFloorArea / 32));
        return {
          primary: {
            label: "Total Joists",
            value: totalJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Rim Joists (LF)",
              value: rimJoistsLf.toFixed(1),
              unit: "lf",
            },
            {
              label: "Subfloor Sheets (4x8)",
              value: subfloorSheets.toString(),
              unit: "sheets",
            },
          ],
          materialList: [
            `${totalJoists} Engineered I-Joists / Solid Sawn Floor Joists @ ${floorWidth.toFixed(2)}' span`,
            `${rimJoistsLf.toFixed(1)} LF Engineered Rim Board / LSL Rim Joist`,
            `${subfloorSheets} Sheets 3/4" Advantech / Premium T&G Subflooring`,
          ],
        };
      }

      if (activeFramingMaterial === "headers") {
        const roughOpeningFeet = clampValue(baseMeasurement, 1, 16);
        let lumberType = "2x4";
        const plies = "Double";
        let jackStuds = 1;

        if (roughOpeningFeet <= 4) {
          lumberType = "2x6";
        } else if (roughOpeningFeet <= 6) {
          lumberType = "2x8";
        } else if (roughOpeningFeet <= 8) {
          lumberType = "2x10";
        } else if (roughOpeningFeet <= 10) {
          lumberType = "2x12";
        } else {
          lumberType = "LVL Engineered";
        }

        if (roughOpeningFeet > 8) {
          jackStuds = 2; // Generally openings > 8ft require 2 jack studs
        }

        return {
          primary: {
            label: "Header Size",
            value: lumberType,
            unit: plies,
          },
          secondary: [
            {
              label: "Rough Opening",
              value: roughOpeningFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Jack Studs",
              value: jackStuds.toString(),
              unit: "per side",
            },
          ],
          materialList: [
            `Recommended Size: ${plies} ${lumberType} (Based on standard residential load)`,
            `Requires ${jackStuds} jack stud(s) on each side to support the header.`,
            `* Verify with local building codes, as point loads or multiple stories may require LVL or larger sawn lumber.`,
          ],
        };
      }

      if (activeFramingMaterial === "roof-rafters") {
        const totalRafters = Math.max(
          2,
          (Math.ceil(runFeet / spacingFeet) + 1) * 2,
        );
        const boardFeet = getBoardFeet(totalRafters, 2, 10, framingLengthFeet);
        return {
          primary: {
            label: "Total Rafters",
            value: totalRafters.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Rafter Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Rafter Length",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Board Feet (BF)",
              value: boardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `${totalRafters} - 2x10x${nominalLength} KD Doug Fir Premium Roof Rafters`,
          ],
        };
      }

      if (activeFramingMaterial === "ceiling-joists") {
        const totalCeilingJoists = Math.max(
          2,
          Math.ceil(runFeet / spacingFeet) + 1,
        );
        const boardFeet = getBoardFeet(
          totalCeilingJoists,
          2,
          10,
          framingLengthFeet,
        );
        return {
          primary: {
            label: "Ceiling Joists",
            value: totalCeilingJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Joist Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Joist Length",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Board Feet (BF)",
              value: boardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `${totalCeilingJoists} - 2x10x${nominalLength} KD Doug Fir Premium Ceiling Joists`,
          ],
        };
      }

      if (activeFramingMaterial === "decking") {
        const totalJoists = Math.max(2, Math.ceil(runFeet / spacingFeet) + 1);
        const boardWidthFeet = clampValue(depthThickness, 0, 12) / 12;
        const deckAreaSquareFeet = runFeet * framingLengthFeet;
        const deckBoards = Math.max(
          1,
          Math.ceil(deckAreaSquareFeet / boardWidthFeet / nominalLength),
        );
        const joistBoardFeet = getBoardFeet(
          totalJoists,
          2,
          10,
          framingLengthFeet,
        );
        const boardBoardFeet = getBoardFeet(deckBoards, 1.25, 6, nominalLength);
        const totalBoardFeet = joistBoardFeet + boardBoardFeet;
        return {
          primary: {
            label: "Deck Joists",
            value: totalJoists.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Decking Boards",
              value: deckBoards.toString(),
              unit: "pcs",
            },
            {
              label: "Deck Joist Spacing (OC)",
              value: spacingOcInches.toString(),
              unit: "in OC",
            },
            {
              label: "Board Feet (BF)",
              value: totalBoardFeet.toFixed(1),
              unit: "bf",
            },
          ],
          materialList: [
            `${totalJoists} - 2x10x${nominalLength} Pressure Treated #1 Ground-Contact Deck Joists`,
            `${deckBoards} - 5/4x6x${nominalLength} Premium Composite / Treated Decking Boards`,
          ],
        };
      }

      const derivedStuds = Math.max(2, Math.ceil(runFeet / spacingFeet) + 1);
      // Apply waste to base stud count only (not to the already-rounded-up integer)
      const derivedStudsWithWaste = isWallStudTotalMode
        ? Math.max(2, derivedStuds)
        : Math.ceil(derivedStuds * wasteMultiplier);
      const totalStuds = isWallStudTotalMode
        ? wallStudTargetCount
        : isWallFramingCalculator && staggeredStudWall
          ? Math.max(4, derivedStudsWithWaste * 2)
          : Math.max(8, derivedStudsWithWaste);

      if (page.canonicalPath.includes("/framing/wall")) {
        // Standard framing: 1 bottom plate + 1 top plate = 2 plates total per run foot
        // Staggered wall: 2 bottom + 2 top = 4 plates
        const plateCount = staggeredStudWall ? 4 : 2;
        const totalPlateLf = runFeet * plateCount;
        const studStockLabel = (() => {
          if (!isWallFramingCalculator) {
            return `${framingLengthFeet.toFixed(2)}'`;
          }
          if (wallStudHeightMode === "8-precut") return `8' precut (92 5/8")`;
          if (wallStudHeightMode === "9-precut") return `9' precut (104 5/8")`;
          if (wallStudHeightMode === "10") return "10'";
          if (wallStudHeightMode === "12") return "12'";
          return `${clampValue(wallStudCustomHeightFeet, 0, 20).toFixed(2)}' (custom)`;
        })();
        return {
          primary: {
            label: "Total Studs",
            value: totalStuds.toString(),
            unit: "pcs",
          },
          secondary: [
            {
              label: "Stud Spacing (OC)",
              value: effectiveSpacingOcInches.toFixed(2),
              unit: "in OC",
            },
            {
              label: "Wall Height",
              value: framingLengthFeet.toFixed(2),
              unit: "ft",
            },
            {
              label: "Total Plates (LF)",
              value: totalPlateLf.toFixed(1),
              unit: "lf",
            },
          ],
          materialList: [
            `${totalStuds} - 2x4x${studStockLabel} KD Doug Fir Premium Studs`,
            staggeredStudWall
              ? `${totalPlateLf.toFixed(1)} LF Pressure Treated / Premium Plate Stock (Staggered Assembly)`
              : `${totalPlateLf.toFixed(1)} LF plates (1 bottom + 1 top)`,
          ],
        };
      }

      const estimatedOpenings = Math.max(1, Math.round(runFeet / 20));
      const jackStuds = estimatedOpenings * 2;
      const kingStuds = estimatedOpenings * 2;
      const commonStuds = Math.max(0, totalStuds - jackStuds - kingStuds);
      const boardFeet = getBoardFeet(totalStuds, 2, 4, framingLengthFeet);
      const totalPlateLf = runFeet * 2;
      const plates16ft = Math.max(1, Math.ceil(totalPlateLf / 16));
      return {
        primary: {
          label: "Total Studs",
          value: totalStuds.toString(),
          unit: "pcs",
        },
        secondary: [
          {
            label: "Common Studs",
            value: commonStuds.toString(),
            unit: "pcs",
          },
          {
            label: "Jack Studs",
            value: jackStuds.toString(),
            unit: "pcs",
          },
          {
            label: "King Studs",
            value: kingStuds.toString(),
            unit: "pcs",
          },
          {
            label: "Stud Spacing (OC)",
            value: effectiveSpacingOcInches.toFixed(2),
            unit: "in OC",
          },
          {
            label: "Board Feet (BF)",
            value: boardFeet.toFixed(1),
            unit: "bf",
          },
          {
            label: "16' Plates",
            value: plates16ft.toString(),
            unit: "pcs",
          },
        ],
        materialList: [
          `${commonStuds} - 2x4x${nominalLength} KD Doug Fir Common Studs`,
          `${jackStuds} - 2x4x${nominalLength} KD Doug Fir Jack Studs`,
          `${kingStuds} - 2x4x${nominalLength} KD Doug Fir King Studs`,
          `(${plates16ft}) 16' Plates`,
        ],
      };
    }

    if (page.category === "concrete") {
      if (page.canonicalPath.includes("block-wall")) {
        const wallAreaSqFt = dimensionsAreaSquareFeet;
        const adjustedArea = wallAreaSqFt * wasteMultiplier;
        const blockFaceHeightInches = clampValue(depthThickness, 4, 16);
        const blockCoverageSqFt = (blockFaceHeightInches / 12) * (16 / 12);
        const totalBlocks = Math.max(
          1,
          Math.ceil(adjustedArea / blockCoverageSqFt),
        );
        const mortarBags = Math.max(1, Math.ceil(totalBlocks / 35));
        const blockSizeLabel = `${blockFaceHeightInches.toFixed(0)}" x 16" CMU`;
        return {
          primary: {
            label: "Total Blocks",
            value: totalBlocks.toString(),
            unit: "blocks",
          },
          secondary: [
            {
              label: "Wall Area",
              value: adjustedArea.toFixed(2),
              unit: "sq ft",
            },
            {
              label: "Bags of Mortar",
              value: mortarBags.toString(),
              unit: "bags",
            },
          ],
          materialList: [
            `${totalBlocks} ${blockSizeLabel} Units`,
            `${mortarBags} Bags Type S Portland Cement/Lime Premium Mortar (70–75 lb)`,
          ],
        };
      }

      const bags80 = Math.ceil(adjustedCubicYards * 45);
      const bags60 = Math.ceil(adjustedCubicYards * 60);
      const estimatedWeightLbs = adjustedCubicYards * 4050;
      const estimatedWeightTons = estimatedWeightLbs / 2000;
      return {
        primary: {
          label: "Total Cubic Yards",
          value: adjustedCubicYards.toFixed(2),
          unit: "yd^3",
        },
        secondary: [
          {
            label: "Bags (80lb)",
            value: bags80.toString(),
            unit: "bags",
          },
          {
            label: "Bags (60lb)",
            value: bags60.toString(),
            unit: "bags",
          },
          {
            label: "Estimated Weight",
            value: estimatedWeightTons.toFixed(2),
            unit: "tons",
          },
        ],
        materialList: [
          `${adjustedCubicYards.toFixed(2)} cu yd Ready-Mix Concrete (3000-4000 PSI)`,
          `${bags80} High-Strength Concrete Bags (80lb)`,
          `${bags60} High-Strength Concrete Bags (60lb)`,
          `Approx payload: ${Math.round(estimatedWeightLbs).toLocaleString()} lbs`,
        ],
      };
    }

    if (page.category === "roofing") {
      if (isSidingCalculator) {
        const pieceCoverageSqFt = clampValue(depthThickness, 0, 50);
        const pieces = Math.max(
          1,
          Math.ceil(adjustedAreaSquareFeet / pieceCoverageSqFt),
        );
        const sidingSquares = adjustedAreaSquareFeet / 100;
        return {
          primary: {
            label: "Squares",
            value: sidingSquares.toFixed(2),
            unit: "sq",
          },
          secondary: [
            {
              label: "Pieces",
              value: pieces.toString(),
              unit: "pcs",
            },
            {
              label: "Window/Door Deduction",
              value: deductionSqFt.toFixed(2),
              unit: "sq ft",
            },
          ],
          materialList: [
            `${sidingSquares.toFixed(2)} Premium Vinyl/Fiber Cement Siding Squares`,
            `${pieces} Premium Vinyl/Fiber Cement Siding Pieces`,
          ],
        };
      }

      const isRoofingShinglesCalculator =
        page.canonicalPath === "/calculators/roofing/shingles";

      const pitchRisePerTwelve =
        isRoofingShinglesCalculator && roofPitchPreset !== "custom"
          ? roofPitchPreset === "flat"
            ? 0
            : Number(roofPitchPreset)
          : clampValue(
              isRoofingShinglesCalculator
                ? roofPitchRiseCustom
                : depthThickness,
              0,
              24,
            );

      const pitchMultiplier =
        pitchRisePerTwelve <= 0
          ? 1
          : Math.sqrt(
              1 + (pitchRisePerTwelve / 12) * (pitchRisePerTwelve / 12),
            );

      const baseRoofArea = (() => {
        if (!isRoofingShinglesCalculator) {
          return supportsAreaToggle && !isAreaTotalMode
            ? dimensionsAreaSquareFeet
            : supportsAreaToggle && isAreaTotalMode
              ? clampValue(totalSquareFeetInput, 0, 100000000)
              : adjustedAreaSquareFeet / wasteMultiplier;
        }

        if (roofingInputMode === "direct-squares") {
          return clampValue(roofSquaresInput, 0.01, 1000000) * 100;
        }

        const lengthFt = clampValue(baseMeasurement, 0, 10000);
        const widthFt = clampValue(widthSpan, 0, 10000);
        const overhangFt = clampValue(roofOverhangInches, 0, 48) / 12;
        const adjustedLength = lengthFt + overhangFt * 2;
        const adjustedWidth = widthFt + overhangFt * 2;
        return adjustedLength * adjustedWidth;
      })();

      const pitchedArea = baseRoofArea * pitchMultiplier;
      const effectiveRoofArea = pitchedArea * wasteMultiplier;
      const squares = effectiveRoofArea / 100;
      const bundles = Math.ceil(squares * 3);

      const starterRidgeBundles = (() => {
        if (!isRoofingShinglesCalculator) return null;

        const overhangFt = clampValue(roofOverhangInches, 0, 48) / 12;
        const perimeterFt =
          roofingInputMode === "dimensions"
            ? (clampValue(baseMeasurement, 0, 10000) + overhangFt * 2) * 2 +
              (clampValue(widthSpan, 0, 10000) + overhangFt * 2) * 2
            : Math.sqrt(baseRoofArea) * 4;

        return Math.max(1, Math.ceil((perimeterFt * 1.1) / 100));
      })();

      const rollsUnderlayment = Math.max(
        1,
        Math.ceil(effectiveRoofArea / 1000),
      );
      const nails = Math.max(1, Math.ceil(squares * 320));
      return {
        primary: {
          label: isRoofingShinglesCalculator
            ? "Bundles"
            : "Total Squares",
          value: isRoofingShinglesCalculator
            ? bundles.toString()
            : squares.toFixed(2),
          unit: isRoofingShinglesCalculator ? "bundles" : "sq",
        },
        secondary: [
          {
            label: "Squares",
            value: squares.toFixed(2),
            unit: "sq",
          },
          {
            label: "Synthetic Underlayment",
            value: rollsUnderlayment.toString(),
            unit: "rolls",
          },
          ...(starterRidgeBundles
            ? [
                {
                  label: "Starter & Ridge (est.)",
                  value: starterRidgeBundles.toString(),
                  unit: "bundles",
                },
              ]
            : []),
          ...(isRoofingShinglesCalculator
            ? [
                {
                  label: "Nails",
                  value: nails.toLocaleString(),
                  unit: "nails",
                },
              ]
            : []),
        ],
        materialList: [
          `${bundles} Architectural Dimensional Shingle Bundles`,
          `${squares.toFixed(2)} HD Architectural Roofing Squares (pitched & waste-adjusted)`,
          ...(starterRidgeBundles
            ? [`${starterRidgeBundles} Starter & Ridge bundles (est.)`]
            : []),
          `${rollsUnderlayment} Rolls Synthetic Underlayment`,
          ...(isRoofingShinglesCalculator
            ? [
                `Allow ~${nails.toLocaleString()} nails (≈320 nails/square @ 4 nails/shingle).`,
              ]
            : []),
        ],
      };
    }

    /* ── Landscape calculators ─────────────────────────────────── */
    if (page.category === "landscape") {
      const p = page.canonicalPath;

      if (p.includes("sod")) {
        // Sod: area only — rolls, pallets, seed lbs
        const areaSqFt = dimensionsAreaSquareFeet;
        const adjusted = areaSqFt * wasteMultiplier;
        const rolls = Math.ceil(adjusted / 10);
        const pallets = Math.ceil(adjusted / 450);
        const seedLbs = Math.ceil((adjusted / 1000) * 4);
        return {
          primary: {
            label: "Sod Rolls",
            value: rolls.toString(),
            unit: "rolls",
          },
          secondary: [
            { label: "Area", value: adjusted.toFixed(0), unit: "sq ft" },
            {
              label: "Pallets (~450 sq ft ea)",
              value: pallets.toString(),
              unit: "pallets",
            },
            {
              label: "Seed Alternative",
              value: seedLbs.toString(),
              unit: "lbs",
            },
          ],
          materialList: [
            `${rolls} sod rolls (10 sq ft ea)`,
            `Or ${pallets} pallets (~450 sq ft ea)`,
            `Seed alternative: ${seedLbs} lbs (4 lbs/1000 sq ft)`,
          ],
        };
      }

      // Mulch, topsoil, gravel: area × depth → cu yd
      const areaSqFt = dimensionsAreaSquareFeet;
      const depthIn = clampValue(depthThickness, 0, 36);
      const volumeCuFt = areaSqFt * (depthIn / 12);
      const cubicYards = (volumeCuFt / 27) * wasteMultiplier;
      const bags2CuFt = Math.ceil((volumeCuFt * wasteMultiplier) / 2);

      const secondary: Array<{ label: string; value: string; unit: string }> = [
        {
          label: "Volume",
          value: (volumeCuFt * wasteMultiplier).toFixed(1),
          unit: "cu ft",
        },
        { label: "2 cu ft Bags", value: bags2CuFt.toString(), unit: "bags" },
      ];

      const matList: string[] = [
        `${cubicYards.toFixed(2)} cu yd bulk`,
        `Alternate: ${bags2CuFt} bags (2 cu ft ea)`,
      ];

      if (p.includes("gravel")) {
        const tons = cubicYards * 1.4;
        secondary.unshift({
          label: "Tons (est.)",
          value: tons.toFixed(2),
          unit: "tons",
        });
        matList[0] = `${tons.toFixed(2)} tons crushed stone`;
        return {
          primary: { label: "Tons", value: tons.toFixed(2), unit: "tons" },
          secondary,
          materialList: matList,
        };
      }

      if (p.includes("topsoil")) {
        const tonsLow = cubicYards * 1.0;
        const tonsHigh = cubicYards * 1.3;
        secondary.push({
          label: "Tons (est.)",
          value: `${tonsLow.toFixed(1)}–${tonsHigh.toFixed(1)}`,
          unit: "tons",
        });
        matList.push(
          `Approx ${tonsLow.toFixed(1)}–${tonsHigh.toFixed(1)} tons (varies by moisture)`,
        );
      }

      return {
        primary: {
          label: "Cubic Yards",
          value: cubicYards.toFixed(2),
          unit: "cu yd",
        },
        secondary,
        materialList: matList,
      };
    }

    /* ── Outdoor calculators ──────────────────────────────────── */
    if (page.category === "outdoor") {
      const p = page.canonicalPath;

      if (p.includes("fence")) {
        const linearFeet = clampValue(baseMeasurement, 0, 10000);
        const height = clampValue(widthSpan, 3, 12);
        const postSpacing = clampValue(depthThickness, 4, 12);
        const posts = Math.ceil(linearFeet / postSpacing) + 1;
        const sections = posts - 1;
        const railsPerSection = height > 6 ? 3 : 2;
        const rails = sections * railsPerSection;
        const picketsPerSection = Math.ceil((postSpacing * 12) / 4);
        const pickets = Math.ceil(
          sections * picketsPerSection * wasteMultiplier,
        );
        return {
          primary: { label: "Posts", value: posts.toString(), unit: "ea" },
          secondary: [
            { label: "Rails", value: rails.toString(), unit: "ea" },
            { label: "Pickets", value: pickets.toString(), unit: "ea" },
            { label: "Sections", value: sections.toString(), unit: "sections" },
          ],
          materialList: [
            `${posts} posts (4×4, set 48 in below grade)`,
            `${rails} rails (2×4)`,
            `${pickets} pickets (includes waste)`,
          ],
        };
      }

      if (p.includes("paver-patio")) {
        const areaSqFt = dimensionsAreaSquareFeet;
        const baseDepthIn = clampValue(depthThickness, 4, 12);
        const paverSqFt = 0.222; // standard 4×8 brick paver
        const pavers = Math.ceil((areaSqFt * wasteMultiplier) / paverSqFt);
        const baseCuYd = (areaSqFt * (baseDepthIn / 12)) / 27;
        const baseTons = baseCuYd * 1.4;
        const sandCuYd = (areaSqFt * (1 / 12)) / 27; // 1 in sand bedding
        const sandTons = sandCuYd * 1.4;
        const perimeter = (baseMeasurement + widthSpan) * 2;
        return {
          primary: { label: "Pavers", value: pavers.toString(), unit: "ea" },
          secondary: [
            { label: "Gravel Base", value: baseTons.toFixed(2), unit: "tons" },
            { label: "Sand Bedding", value: sandTons.toFixed(2), unit: "tons" },
            {
              label: "Edge Restraint",
              value: perimeter.toFixed(0),
              unit: "LF",
            },
          ],
          materialList: [
            `${pavers} pavers (4×8 standard)`,
            `${baseTons.toFixed(2)} tons gravel base (${baseDepthIn} in depth)`,
            `${sandTons.toFixed(2)} tons sand (1 in bedding)`,
            `Edge restraint: ${perimeter.toFixed(0)} LF`,
          ],
        };
      }

      if (p.includes("asphalt")) {
        const areaSqFt = dimensionsAreaSquareFeet;
        const thicknessIn = clampValue(depthThickness, 0, 6);
        const volumeCuFt = areaSqFt * (thicknessIn / 12);
        const tons = ((volumeCuFt * 145) / 2000) * wasteMultiplier; // 145 lbs/cu ft
        return {
          primary: { label: "Tons", value: tons.toFixed(2), unit: "tons" },
          secondary: [
            { label: "Area", value: areaSqFt.toFixed(0), unit: "sq ft" },
            { label: "Thickness", value: thicknessIn.toFixed(1), unit: "in" },
          ],
          materialList: [
            `${tons.toFixed(2)} tons hot mix asphalt`,
            `Coverage: ${areaSqFt.toFixed(0)} sq ft at ${thicknessIn.toFixed(1)} in compacted`,
          ],
        };
      }
    }

    /* ── Mechanical & Drywall calculators ─────────────────────── */
    if (page.canonicalPath.includes("drywall")) {
      const areaSqFt = clampValue(baseMeasurement, 0, 100000);
      const sheetSqFt = 32; // Standard 4x8 sheet
      const grossSheets = areaSqFt / sheetSqFt;
      const netSheets = Math.ceil(grossSheets * wasteMultiplier);
      const screws = netSheets * 32; // Approx 32 screws per 4x8 sheet
      const mudGallons = Math.ceil(netSheets * 0.05); // Approx 5 gallons per 100 sheets
      const tapeFeet = Math.ceil(netSheets * 16.5); // Approx 16.5 ft of tape per sheet

      return {
        primary: {
          label: "4×8 Sheets",
          value: netSheets.toString(),
          unit: "ea",
        },
        secondary: [
          {
            label: "Total Area",
            value: (areaSqFt * wasteMultiplier).toFixed(0),
            unit: "sq ft",
          },
          {
            label: "Screws (est.)",
            value: screws.toString(),
            unit: "ea",
          },
          {
            label: "Joint Tape",
            value: tapeFeet.toString(),
            unit: "ft",
          },
        ],
        materialList: [
          `${netSheets} sheets (4×8 × ¹/₂" standard)`,
          `${screws.toLocaleString()} drywall screws (1¹/₄")`,
          `${Math.ceil(tapeFeet / 250)} rolls of joint tape (250 ft/roll)`,
          `${mudGallons} gallons premixed joint compound`,
        ],
      };
    }

    if (page.category === "mechanical") {
      const p = page.canonicalPath;

      if (p.includes("btu")) {
        const areaSqFt = clampValue(baseMeasurement, 10, 100000);
        const heightFt = clampValue(widthSpan, 7, 30);
        const tempRise = clampValue(depthThickness, 10, 100);
        
        const volumeCuFt = areaSqFt * heightFt;
        
        // Standard insulation heating load approximation:
        // BTU/hr = Volume(cu ft) * TempRise(°F) * 0.133
        const heatingBtu = Math.ceil(volumeCuFt * tempRise * 0.133);
        const coolingBtu = Math.ceil(areaSqFt * 25); // rough residential cooling rule of thumb
        const tonnage = (coolingBtu / 12000).toFixed(1);

        return {
          primary: {
            label: "Heating Load",
            value: heatingBtu.toString(),
            unit: "BTU/hr",
          },
          secondary: [
            {
              label: "Conditioned Vol",
              value: volumeCuFt.toString(),
              unit: "cu ft",
            },
            {
              label: "Est. Cooling Load",
              value: coolingBtu.toString(),
              unit: "BTU/hr",
            },
            {
              label: "Cooling Tonnage",
              value: tonnage.toString(),
              unit: "tons",
            },
          ],
          materialList: [
            `System must produce min. ${heatingBtu.toLocaleString()} BTU/hr for a ${tempRise}°F heat rise.`,
            `Total conditioned space is ${volumeCuFt.toLocaleString()} cu ft.`,
            `Estimated cooling requirement: ${tonnage} tons (${coolingBtu.toLocaleString()} BTU/hr).`,
            `load with Manual J calculation prior to ordering plant equipment.`
          ],
        };
      }

      if (p.includes("ventilation")) {
        const areaSqFt = clampValue(baseMeasurement, 10, 100000);
        const heightFt = clampValue(widthSpan, 7, 30);
        // ACH from the third input (default to 4 if missing/zero)
        const airChangesPerHour = clampValue(depthThickness, 0.5, 20) || 4; 
        const volumeCuFt = areaSqFt * heightFt;
        const requiredCfm = Math.ceil((volumeCuFt * airChangesPerHour) / 60);

        return {
          primary: {
            label: "Exhaust/Supply",
            value: requiredCfm.toLocaleString(),
            unit: "CFM",
          },
          secondary: [
            {
              label: "Conditioned Vol",
              value: volumeCuFt.toLocaleString(),
              unit: "cu ft",
            },
            {
              label: "Air Changes",
              value: airChangesPerHour.toString(),
              unit: "ACH",
            },
          ],
          materialList: [
            `Requires a minimum of ${requiredCfm.toLocaleString()} CFM to achieve ${airChangesPerHour} air changes per hour (ACH).`,
            `Total conditioned space is ${volumeCuFt.toLocaleString()} cu ft.`,
            `actual building code requirements before ordering exhaust fans or ERV units.`,
          ],
        };
      }
    }

    return {
      primary: {
        label: "Estimated Quantity",
        value: adjustedVolume.toFixed(2),
        unit: "units",
      },
      secondary: [
        {
          label: "Material Qty",
          value: materialQty.toString(),
          unit: "units",
        },
      ],
      materialList: [`${materialQty} Material Units`],
    };
  }, [
    adjustedAreaSquareFeet,
    adjustedCubicYards,
    adjustedVolume,
    baseMeasurement,
    depthThickness,
    materialQty,
    page.canonicalPath,
    page.category,
    activeFramingMaterial,
    isWallStudTotalMode,
    totalLinealFeet,
    totalStudsInput,
    totalSquareFeetInput,
    deductionSqFt,
    dimensionsAreaSquareFeet,
    isAreaTotalMode,
    supportsAreaToggle,
    wasteMultiplier,
    widthSpan,
    capitalImprovement,
    taxCounty,
    taxRegion,
    roofOverhangInches,
    roofPitchPreset,
    roofPitchRiseCustom,
    roofSquaresInput,
    roofingInputMode,
    staggeredStudWall,
    wallStudCustomHeightFeet,
    wallStudCustomSpacingInches,
    wallStudHeightMode,
    wallStudSpacingMode,
  ]);

  const displayResults: CalculatorResultsBundle = useMemo(() => {
    if (canShowPricing) return calculatorResults;
    const mask = (result: CalculatorResult): CalculatorResult =>
      isMonetaryResult(result)
        ? { ...result, value: "Sign in to view", unit: "" }
        : result;
    return {
      primary: mask(calculatorResults.primary),
      secondary: calculatorResults.secondary.map(mask),
      materialList: calculatorResults.materialList,
    };
  }, [calculatorResults, canShowPricing]);


  async function runAiOptimizer() {
    if (aiOptimizeBusy) return;
    setAiOptimizeBusy(true);
    setAiOptimizeError(null);
    setAiOptimizeContent(null);

    try {
      const lines: string[] = [];
      lines.push(
        `${displayResults.primary.label}: ${displayResults.primary.value}${
          displayResults.primary.unit ? ` ${displayResults.primary.unit}` : ""
        }`,
      );

      if (displayResults.secondary?.length) {
        lines.push("");
        lines.push("Secondary:");
        displayResults.secondary.forEach((row) => {
          lines.push(
            `- ${row.label}: ${row.value}${row.unit ? ` ${row.unit}` : ""}`,
          );
        });
      }

      if (displayResults.materialList?.length) {
        lines.push("");
        lines.push("Material List:");
        displayResults.materialList.forEach((item) => lines.push(`- ${item}`));
      }

      const response = await fetch(routes.api.aiOptimize, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorId: page.key ?? page.canonicalPath,
          results: lines.join("\n"),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as
        | { content?: string; error?: string }
        | undefined;

      if (!response.ok) {
        throw new Error(payload?.error ?? "AI optimizer failed.");
      }

      const content =
        typeof payload?.content === "string" ? payload.content : "";
      if (!content.trim()) {
        throw new Error("AI optimizer returned an empty response.");
      }

      setAiOptimizeContent(content);
    } catch (error) {
      setAiOptimizeError(
        error instanceof Error ? error.message : "AI optimizer failed.",
      );
    } finally {
      setAiOptimizeBusy(false);
    }
  }

  // Debounced haptic — fires 300 ms after inputs settle so the user feels a
  // physical "click" when the live calculation stabilises on a new result.
  // Skipped on the very first render to avoid a buzz on page load.
  // When haptic fires, scroll the results card into view and trigger icon pulse (100ms).
  useEffect(() => {
    const handlePointerDown = () => {
      userInteracted.current = true;
      window.removeEventListener("pointerdown", handlePointerDown);
    };
    window.addEventListener("pointerdown", handlePointerDown, { once: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (isFirstCalcRender.current) {
      isFirstCalcRender.current = false;
      return;
    }
    if (!userInteracted.current) {
      return;
    }
    if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
    let iconPulseTimeout: ReturnType<typeof setTimeout> | null = null;
    hapticTimerRef.current = setTimeout(() => {
      haptic(10);
      resultsCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      setIconPulse(true);
      iconPulseTimeout = setTimeout(() => setIconPulse(false), 100);
    }, 300);
    return () => {
      if (hapticTimerRef.current) clearTimeout(hapticTimerRef.current);
      if (iconPulseTimeout) clearTimeout(iconPulseTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    adjustedAreaSquareFeet,
    adjustedVolume,
    areaInputMode,
    materialQty,
    totalStudsInput,
    volumeCubicFeet,
    volumeInputMode,
    wallInputMode,
  ]);

  // Auto-open Sentry report dialog for any finalize error
  useEffect(() => {
    if (!finalizeError) {
      hasReportedError.current = false;
      return;
    }
    if (hasReportedError.current) return;
    if (typeof Sentry.showReportDialog === "function") {
      hasReportedError.current = true;
      Sentry.showReportDialog({
        title: "Calculator error",
        subtitle: finalizeError,
        user: {
          email: session?.user?.email ?? undefined,
          name: session?.user?.name ?? undefined,
        },
      });
    }
  }, [finalizeError, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!openModuleGroup) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (moduleDropdownRef.current?.contains(event.target as Node)) return;
      setOpenModuleGroup(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [openModuleGroup]);

  function queueSaveStateReset() {
    window.setTimeout(() => setSaveState("idle"), 1800);
  }

  async function handleSaveEstimate() {
    if (saveState !== "idle") return;


    setSaveState("saving");
    setFinalizeError(null);
    setFinalizeSuccess(null);

    try {
      if (session?.user?.id) {
        const response = await fetch("/api/estimates/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...finalizePayload,
            total_cost: null,
            status: "Draft",
          }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to save estimate.");
        }

        const correctedData =
          payload?.correctedData && typeof payload.correctedData === "object"
            ? payload.correctedData
            : null;

        setSaveState(correctedData ? "corrected" : "saved");
        setFinalizeSuccess(
          correctedData
            ? "Verified & Locked. Server-side math was corrected before save."
            : "Estimate saved to your account.",
        );
        haptic(10);
        queueSaveStateReset();
        return;
      }

      const deviceExport = {
        exportedAt: new Date().toISOString(),
        source: "pro-construction-calc",
        ...finalizePayload,
        type: "device-estimate",
      };
      const blob = new Blob([JSON.stringify(deviceExport, null, 2)], {
        type: "application/json",
      });
      downloadBlob(
        blob,
        `${sanitizeFilename(finalizePayload.name, "estimate")}.json`,
      );
      setSaveState("downloaded");
      setFinalizeSuccess("Estimate downloaded to this device.");
      haptic(10);
    } catch (error) {
      Sentry.captureException(error);
      setSaveState("idle");
      setFinalizeSuccess(null);
      setFinalizeError(
        error instanceof Error ? error.message : "Failed to save estimate.",
      );
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
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
      ? `${page.proTip} For tri-county slab and footing work, verify frost protection against the local depth requirements on the job before you finalize the pour.`
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

  function getInlineSubLabel(label: string): string | undefined {
    const financialDefinition = getFinancialTermDefinition(label);
    if (financialDefinition) return financialDefinition;
    const l = label.toLowerCase();
    if (l.includes("oc"))
      return "Distance from center to center of each board.";
    if (l.includes("running lineal feet"))
      return "The total length of the wall or floor edge.";
    if (l.includes("stock length"))
      return "The board length you buy at the store (8', 12', 16').";
    if (l.includes("slab depth"))
      return "The depth of the concrete (standard is usually 4 inches).";
    if (l.includes("sq ft per box")) return "Found on the product packaging.";
    if (l.includes("total square feet"))
      return "Total surface area for material coverage.";
    if (l.includes("window/door deduction"))
      return "Subtract openings so you do not over-order.";
    if (l.includes("total lineal feet"))
      return "Use the total perimeter length for trim runs.";
    if (l.includes("total yards")) return "Yardage for ready-mix ordering.";
    if (l.includes("total cubic feet"))
      return "Cubic feet before converting to total yards.";
    if (l.includes("waste factor"))
      return "Extra material to cover cuts, scraps, and mistakes.";
    if (l.includes("miter waste"))
      return "Extra trim for corner cuts and angle mistakes.";
    if (l.includes("block size"))
      return 'Face height of the block in inches (standard CMU is 8"). Adjust when using non-standard units.';
    return undefined;
  }

  const primaryMaterialOrder = calculatorResults.materialList[0] ?? null;
  const resolvedEstimateCounty = useMemo(() => {
    // Since estimateCountySelection and estimateCountyCustom are removed,
    // we default to taxCounty for tax-save or null otherwise.
    return isBusinessTaxSave ? taxCounty : null;
  }, [isBusinessTaxSave, taxCounty]);

  const shellClassName = useMemo(() => {
    const tabletShell =
      deviceProfile.tabletTier === "large"
        ? "tablet-shell-large"
        : deviceProfile.tabletTier === "standard"
          ? "tablet-shell-standard"
          : "";

    return [
      "mx-auto w-full px-3 py-4 pb-14 sm:px-5 sm:py-5 lg:px-7 lg:py-4 shell-content",
      deviceProfile.layoutMode === "tablet-shell" ? tabletShell : "max-w-7xl",
      deviceProfile.bottomBufferClass,
      deviceProfile.baseTextClass,
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    deviceProfile.baseTextClass,
    deviceProfile.bottomBufferClass,
    deviceProfile.layoutMode,
    deviceProfile.tabletTier,
  ]);

  const calculatorSurfaceClassName = useMemo(() => {
    if (deviceProfile.layoutMode === "command-center") {
      return "grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)]";
    }

    return "grid gap-6 lg:grid-cols-2";
  }, [deviceProfile.layoutMode]);

  const liveAudit = useMemo(() => {
    const formatCurrency = (cents: number) => centsToDollars(cents).toFixed(2);

    if (!isBusinessTaxSave) {
      return {
        title: "Live Audit Log",
        rows: [
          { label: "County", value: resolvedEstimateCounty ?? "Not selected" },
          { label: "Waste Factor", value: `${wasteFactor}%` },
          {
            label: "Primary Result",
            value: `${displayResults.primary.value} ${getPrimaryDisplayUnit(displayResults.primary)}`,
          },
        ],
      };
    }

    const grossRevenueCents = toCents(Math.max(0, baseMeasurement));
    const deductionsCents = toCents(Math.max(0, depthThickness));
    const subtotalCents = Math.max(0, grossRevenueCents - deductionsCents);
    const basisPoints =
      taxRegion === "NYS"
        ? taxCounty === "Oneida"
          ? 875
          : taxCounty === "Herkimer"
            ? 825
            : taxCounty === "Madison"
              ? 800
              : 0
        : toBasisPoints(widthSpan);
    const taxCents = capitalImprovement
      ? 0
      : scaleCentsByBasisPoints(subtotalCents, basisPoints);
    const totalCents = subtotalCents + taxCents;

    return {
      title: "Live Audit Log",
      rows: [
        {
          label: "County",
          value: taxRegion === "NYS" ? taxCounty : "Custom / Other",
        },
        { label: "Basis Points", value: basisPoints.toString() },
        { label: "Subtotal", value: formatCurrency(subtotalCents) },
        { label: "Tax", value: formatCurrency(taxCents) },
        { label: "Total", value: formatCurrency(totalCents) },
      ],
    };
  }, [
    baseMeasurement,
    capitalImprovement,
    depthThickness,
    displayResults.primary,
    isBusinessTaxSave,
    resolvedEstimateCounty,
    taxCounty,
    taxRegion,
    wasteFactor,
    widthSpan,
  ]);

  const finalizePayload = useMemo(
    () => ({
      name: estimateName.trim() || `${displayTitle(page.title)} Estimate`,
      calculator_id: page.canonicalPath,
      client_name: estimateClientName.trim() || null,
      job_site_address: estimateJobAddress.trim() || null,
      total_cost: null,
      results: [calculatorResults.primary, ...calculatorResults.secondary].map(
        (result) => ({
          label: result.label,
          value: result.value,
          unit: result.unit,
        }),
      ),
      material_list: calculatorResults.materialList,
      inputs: {
        calculator_path: page.canonicalPath,
        calculator_label: page.heroKicker,
        client_email: estimateClientEmail.trim() || null,
        selected_county_mode: null,
        selected_county: resolvedEstimateCounty,
        internal_note: estimateInternalNote.trim() || null,
      },
      quote_note: estimateQuoteNote.trim() || null,
      type: "calculator_report" as const,
      metadata: {
        title: page.title,
        calculatorLabel: page.heroKicker,
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        jobName: estimateJobName.trim() || null,
      },
      ...(finalizeEstimateId ? { id: finalizeEstimateId } : {}),
    }),
    [
      estimateName,
      estimateQuoteNote,
      estimateInternalNote,
      page.canonicalPath,
      page.heroKicker,
      page.title,
      estimateClientName,
      estimateClientEmail,

      resolvedEstimateCounty,
      estimateJobAddress,
      estimateJobName,
      calculatorResults.materialList,
      calculatorResults.primary,
      calculatorResults.secondary,
      finalizeEstimateId,
    ],
  );



  function openEmailEstimateModal() {

    setCrmModalOpen(true);
  }

  function openFinalizeModal() {
    triggerHaptic([10]);
    posthog.capture("calculator_calculated", {
      calculator_id: page.canonicalPath,
      calculator_label: page.heroKicker,
      category: page.category,
      trade: page.category,
      primary_value: Number(calculatorResults.primary.value) || 0,
      input_values: {
        base_measurement: baseMeasurement,
        width_span: widthSpan,
        depth_thickness: depthThickness,
      },
    });
    setFinalizeError(null);
    setFinalizeSuccess(null);
    setCreatedSignUrl(null);
    setFinalizeOpen(true);
  }

  // Track input changes
  useEffect(() => {
    if (!posthog) return;
    posthog.capture("calculator_input_changed", {
      calculator_id: page.canonicalPath,
      input_name: "base_measurement",
      value: baseMeasurement,
    });
  }, [baseMeasurement, page.canonicalPath]);

  useEffect(() => {
    if (!posthog) return;
    posthog.capture("calculator_input_changed", {
      calculator_id: page.canonicalPath,
      input_name: "width_span",
      value: widthSpan,
    });
  }, [widthSpan, page.canonicalPath]);

  useEffect(() => {
    if (!posthog) return;
    posthog.capture("calculator_input_changed", {
      calculator_id: page.canonicalPath,
      input_name: "depth_thickness",
      value: depthThickness,
    });
  }, [depthThickness, page.canonicalPath]);

  async function handleCopyOrder() {
    const copyText = calculatorResults.materialList.join("\n");
    if (!copyText) return;

    triggerHaptic([10]);
    try {
      await navigator.clipboard.writeText(copyText);
      setFinalizeSuccess("Material order copied.");
      setFinalizeError(null);
    } catch (error) {
      setFinalizeError(
        error instanceof Error
          ? error.message
          : "Unable to copy material order.",
      );
    }
  }

  async function handleDownloadPdf() {
    if (typeof window === "undefined") return;

    setFinalizeBusy("pdf");
    setFinalizeError(null);
    setFinalizeSuccess(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalizePayload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Failed to generate PDF.");
      }

      const blob = await response.blob();
      downloadBlob(
        blob,
        `${sanitizeFilename(finalizePayload.name, "estimate")}.pdf`,
      );
      setFinalizeSuccess("PDF downloaded.");
      haptic(10);
    } catch (error) {
      Sentry.captureException(error);
      const message =
        error instanceof Error ? error.message : "Failed to generate PDF.";
      setFinalizeError(message);
      setFinalizeSuccess(null);
      if (typeof Sentry.showReportDialog === "function") {
        Sentry.showReportDialog({
          title: "PDF failed — report this issue",
          subtitle: "Include what calculator and inputs you used.",
          user: {
            email: session?.user?.email ?? undefined,
            name: session?.user?.name ?? undefined,
          },
        });
      }
    } finally {
      setFinalizeBusy(null);
    }
  }

  function handleAddToCart() {
    const id = `${page.canonicalPath}-${Date.now()}`;
    addCartItem({
      id,
      calculatorId: "budget",
      calculatorLabel: page.heroKicker,
      estimateName,
      primaryResult: calculatorResults.primary,
      materialList: calculatorResults.materialList,
      quantity: 1,
      createdAt: new Date().toISOString(),
    });
    setFinalizeSuccess("Estimate added to estimate queue.");
    setFinalizeError(null);
  }

  async function handleSendForSignature() {
    if (!canUseSignAndReturn) {
      setFinalizeError(
        "Sign & Return is available in Pro Mode for signed-in users.",
      );
      return;
    }

    if (!estimateClientEmail.trim()) {
      setFinalizeError("Enter the client email before sending for signature.");
      return;
    }

    setFinalizeBusy("sign");
    setFinalizeError(null);
    setFinalizeSuccess(null);

    try {
      const response = await fetch("/api/estimates/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalizePayload),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to create sign link.");
      }

      if (typeof payload?.id === "string") {
        setFinalizeEstimateId(payload.id);
      }

      const signUrl =
        typeof payload?.signUrl === "string" ? payload.signUrl : null;
      setCreatedSignUrl(signUrl);
      setFinalizeSuccess(
        signUrl
          ? "Estimate saved as PENDING and emailed to the client."
          : "Estimate saved as PENDING.",
      );
      haptic(10);
    } catch (error) {
      Sentry.captureException(error);
      setFinalizeError(
        error instanceof Error ? error.message : "Failed to create sign link.",
      );
    } finally {
      setFinalizeBusy(null);
    }
  }

  async function handleCopySignUrl() {
    if (!createdSignUrl) return;

    try {
      triggerHaptic([10]);
      await navigator.clipboard.writeText(createdSignUrl);
      setFinalizeSuccess("Sign link copied.");
    } catch (error) {
      setFinalizeError(
        error instanceof Error ? error.message : "Unable to copy sign link.",
      );
    }
  }

  const auditRef = getCalculatorAuditRef();
  const addCartItem = useStore((s) => s.addCartItem);

  const emailEstimatePayload: EstimatePayload = useMemo(
    () => ({
      title: page.title,
      calculatorLabel: page.heroKicker,
      countyLabel: resolvedEstimateCounty,
      fromName: contractorProfile.businessName,
      fromEmail: contractorProfile.businessEmail,
      results: [calculatorResults.primary, ...calculatorResults.secondary].map(
        (result) => ({
          ...result,
          description: "",
        }),
      ),
      generatedAt: new Date().toISOString().slice(0, 10),
    }),
    [
      page.title,
      page.heroKicker,
      resolvedEstimateCounty,
      calculatorResults,
      contractorProfile.businessEmail,
      contractorProfile.businessName,
    ],
  );

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const errorDigest =
          typeof error === "object" &&
          error !== null &&
          "digest" in error &&
          typeof (error as { digest?: unknown }).digest === "string"
            ? (error as { digest: string }).digest
            : undefined;
        const reportableError =
          error instanceof Error
            ? Object.assign(error, { digest: errorDigest })
            : Object.assign(new Error(String(error)), { digest: errorDigest });
        const userFacing = getUserFacingErrorDetails(reportableError, {
          title: "Calculator error",
          message:
            "We couldn't finish that calculator run. Your inputs are still here, so try again or send us a report if it keeps happening.",
        });
        return (
          <main
            id="main-content"
            className="command-theme bg-[--color-bg] text-[--color-ink] min-h-[40vh] flex items-center justify-center p-6"
          >
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] p-6 max-w-lg text-center">
              <h2 className="text-lg font-bold text-[--color-ink]">
                {userFacing.title}
              </h2>
              <p className="mt-2 text-sm text-[--color-nav-text]/90">
                {userFacing.message}
              </p>
              {reportableError.digest ? (
                <p className="mt-2 text-xs text-[--color-nav-text]/60">
                  Reference: {reportableError.digest}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetError}
                  className="rounded-xl border border-[--color-blue-brand]/50 bg-[--color-blue-brand]/20 px-4 py-2 text-sm font-bold uppercase tracking-wide text-[--color-blue-brand]"
                >
                  Try again
                </button>
                <ManualErrorReportButton
                  error={reportableError}
                  eventId={null}
                  source="calculator-sentry-boundary"
                  className="rounded-xl border border-[--color-border] px-4 py-2 text-sm font-bold uppercase tracking-wide text-[--color-ink]"
                />
              </div>
              <a
                href="/calculators"
                className="mt-3 inline-block rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-[--color-nav-text]/70 hover:text-[--color-nav-text] transition"
              >
                Back to Calculators
              </a>
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
        ref={calculatorShellRef}
        id="main-content"
        className={`command-theme page-shell flex min-h-0 flex-1 flex-col overflow-y-auto bg-[--color-bg] ${
          deviceProfile.highContrastMode ? "contrast-125 saturate-110" : ""
        }`}
      >
        {closeModal && (
          <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-[--color-border] bg-[--color-surface-alt] px-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-blue-brand]/90">
                {page.heroKicker}
              </p>
              <p className="truncate text-sm font-semibold text-[--color-ink]">
                {displayTitle(page.title)}
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[--color-ink-mid] transition-colors hover:bg-[--color-surface] hover:text-[--color-ink]"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Back
              </span>
            </button>
          </div>
        )}
        <section className={shellClassName} suppressHydrationWarning>
          <JsonLD schema={getTradePageSchema(page)} />

          <div className="mb-3 flex items-center justify-between gap-2.5">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs text-[--color-nav-text]/70"
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div
                    key={crumb.href}
                    className="inline-flex items-center gap-2"
                  >
                    {index > 0 ? (
                      <span className="text-[--color-nav-text]/45">&gt;</span>
                    ) : null}
                    {isLast ? (
                      <span
                        className="font-semibold text-[--color-ink]"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-[--color-nav-text]/75 transition-all duration-300 ease-in-out hover:text-[--color-blue-brand]"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[--color-nav-text] transition-all duration-200 hover:border-[--color-blue-brand]/45 active:scale-[0.98] lg:hidden"
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
            <section className="mb-3 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] p-3 transition-colors lg:hidden">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-nav-text]/60"
                  aria-hidden
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trade tools"
                  className="h-10 w-full rounded-xl border border-[--color-border] bg-[--color-surface] pl-9 pr-3 text-sm text-[--color-ink] outline-none transition focus:border-[--color-blue-brand] focus:ring-2 focus:ring-[--color-blue-brand]/25"
                />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {filteredGroups.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-3"
                  >
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-brand">
                      {group.label}
                    </p>
                    <ul className="space-y-1.5">
                      {group.modules.map((module) => (
                        <li key={module.href}>
                          <Link
                            href={module.href}
                            className="inline-flex items-center gap-2 text-xs text-[--color-nav-text] transition-all duration-300 ease-in-out hover:text-[--color-ink]"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <module.icon className="h-3.5 w-3.5" aria-hidden />
                            {normalizeDisplayedLabel(
                              module.label,
                              page.canonicalPath,
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div
            className={[
              "overflow-hidden rounded-3xl glass-container-deep",
              deviceProfile.layoutMode === "two-column"
                ? "lg:flex lg:flex-col"
                : "",
              deviceProfile.desktopTier === "tv" ? "rim-spread-tv" : "",
              deviceProfile.shellScaleClass,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Hero header bar — spans full width at top */}
            <div
              className={`relative isolate overflow-hidden grid grid-cols-1 gap-2 border-b border-[--color-border] px-5 py-6 ${
                deviceProfile.layoutMode === "command-center"
                  ? "xl:items-start"
                  : ""
              }`}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={`/images/calculators/${getHeroImageForKey(page.key)}.png`}
                  alt={`${page.title} background`}
                  fill
                  priority
                  className="object-cover object-center scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/trades/default.png';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
              </div>

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-base/30 bg-blue-base/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-100 backdrop-blur-md">
                  <HardHat className="h-3.5 w-3.5" aria-hidden />
                  {page.heroKicker}
                </div>

                {!closeModal ? (
                  <h1 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl drop-shadow-md">
                    {displayTitle(page.title)}
                  </h1>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base lg:line-clamp-2 drop-shadow-sm">
                  {page.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openFinalizeModal}
                    className="glass-button-primary inline-flex h-9 min-h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:text-white active:scale-[0.98]"
                  >
                    <PenSquare className="h-3.5 w-3.5" aria-hidden />
                    Finalize &amp; Send
                  </button>
                  <button
                    type="button"
                    onClick={openEmailEstimateModal}
                    className="glass-button-primary inline-flex h-9 min-h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:text-white active:scale-[0.98]"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    Email Estimate
                  </button>
                  {session ? (
  <button
    type="button"
    onClick={handleSaveEstimate}
    disabled={saveState !== "idle" || !session}
    className={`glass-button inline-flex h-9 min-h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[--color-ink] transition-all duration-200 hover:text-[--color-ink] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${saveState !== "idle" ? "scale-95" : ""} ${saveState === "corrected" ? "verified-lock-pulse border-primary text-primary" : ""}`}
    title={!session ? "Sign in to save estimates" : undefined}
  >
    {saveState === "saving" ? (
      <>
        <Save className="h-3.5 w-3.5" aria-hidden />
        Saving
      </>
    ) : saveState === "saved" ? (
      <>
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
        Saved
      </>
    ) : saveState === "corrected" ? (
      <>
        <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
        Verified &amp; Locked
      </>
    ) : saveState === "downloaded" ? (
      <>
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
        Downloaded
      </>
    ) : (
      <>
        <Save className="h-3.5 w-3.5" aria-hidden />
        Save Estimate
      </>
    )}
  </button>
) : (
  <button
    type="button"
    disabled={true}
    className="glass-button inline-flex h-9 min-h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[--color-ink] disabled:cursor-not-allowed disabled:opacity-50"
    title="Sign in to save estimates"
  >
    Save Estimate
  </button>
)}
                </div>

                {primaryMaterialOrder ? (
                  <div className="mt-3 rounded-xl border border-blue-base/30 bg-blue-base/10 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                      Material Order
                    </p>
                    <p className="mt-1 text-sm font-semibold text-copy-primary">
                      {primaryMaterialOrder}
                    </p>
                  </div>
                ) : null}

                {isBusinessTaxSave && (
                  <div className="mt-3 grid gap-2 rounded-xl glass-panel-deep p-3 text-xs sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] sm:text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-tertiary">
                        Tax Region
                      </p>
                      <select
                        value={taxRegion}
                        onChange={(event) =>
                          setTaxRegion(
                            event.target.value === "NYS" ? "NYS" : "Other",
                          )
                        }
                        className="glass-input h-9 w-full px-2 text-xs outline-none transition sm:text-sm"
                      >
                        <option value="NYS">New York State (NYS)</option>
                        <option value="Other">Outside NYS / Custom</option>
                      </select>
                      <p className="text-[10px] leading-snug text-copy-tertiary">
                        NYS region uses combined county + state sales tax;
                        otherwise enter your own blended tax rate below.
                      </p>
                      <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-copy-primary">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded glass-input text-blue-base"
                          checked={capitalImprovement}
                          onChange={(event) =>
                            setCapitalImprovement(event.target.checked)
                          }
                        />
                        Capital Improvement (ST-124)
                      </label>
                      <p className="text-[10px] leading-snug text-copy-tertiary">
                        Capital improvements require NYS Form ST-124; no sales
                        tax charged to the client when on file.
                      </p>
                    </div>

                    {taxRegion === "NYS" && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-tertiary">
                          NYS County
                        </p>
                        <select
                          value={taxCounty}
                          onChange={(event) => {
                            const nextCounty = event.target.value;
                            setTaxCounty(nextCounty);
                            const match = NYS_COUNTY_TAX_RATES.find(
                              (entry) => entry.county === nextCounty,
                            );
                            if (match) {
                              setWidthSpan(match.combinedRate);
                            }
                          }}
                          className="glass-input h-9 w-full px-2 text-xs outline-none transition sm:text-sm"
                        >
                          {NYS_COUNTY_TAX_RATES.map((entry) => (
                            <option key={entry.county} value={entry.county}>
                              {entry.county} — {entry.combinedRate.toFixed(2)}%
                              {entry.mctd ? " (MCTD)" : ""}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] leading-snug text-copy-tertiary">
                          County pick auto-fills your Tax Rate (%) input using
                          the latest combined NYS guidance.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Calculator surface — inputs + results */}
            <div className="p-5 sm:p-6 lg:order-2 glass-container-deep">
              <div className={calculatorSurfaceClassName}>
                  <section className="transition-colors p-5 sm:p-6 rounded-2xl border border-[--color-border] bg-white shadow-sm">
                  {/* Compact inputs header — icon inline with label, no large centered decoration */}
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-base/15 ${iconPulse ? "animate-pulse" : ""}`}
                    >
                      {page.category === "roofing" ? (
                        <RoofingGlyph className="h-[18px] w-[18px]" />
                      ) : (
                        (() => {
                          const IconComponent = getCategoryIcon(page);
                          return (
                            <IconComponent
                              size={18}
                              strokeWidth={1.8}
                              className="text-blue-base"
                              aria-hidden
                            />
                          );
                        })()
                      )}
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.12em] text-display-heading">
                      Inputs
                    </h2>
                  </div>

                  {(() => {
                    const labels = getInputLabels(
                      page.canonicalPath,
                      activeFramingMaterial,
                    );
                    const thirdInputMaxBase = isTrimRoute
                      ? 20
                      : isFlooringRoute
                        ? 250
                        : 96;
                    const thirdInputMinBase = isTrimRoute ? 4 : 1;
                    const firstInputMin = financialCopy?.inputs[0].min ?? 0;
                    const firstInputMax =
                      financialCopy?.inputs[0].max ?? 100000000;
                    const secondInputMin = financialCopy?.inputs[1].min ?? 0;
                    const secondInputMax = financialCopy?.inputs[1].max ?? 100;
                    const thirdInputMin =
                      financialCopy?.inputs[2].min ?? thirdInputMinBase;
                    const thirdInputMax =
                      financialCopy?.inputs[2].max ?? thirdInputMaxBase;
                    const firstUnitSuffix =
                      financialCopy?.inputs[0].unit ??
                      (isBusinessTaxSave
                        ? "$"
                        : inferUnitFromLabel(labels.first, "ft"));
                    const secondUnitSuffix =
                      financialCopy?.inputs[1].unit ??
                      (isBusinessTaxSave
                        ? "%"
                        : inferUnitFromLabel(labels.second, "%"));
                    const thirdUnitSuffix =
                      financialCopy?.inputs[2].unit ??
                      (isBusinessTaxSave
                        ? "$"
                        : inferUnitFromLabel(labels.third));
                    const isRoofingShinglesCalculator =
                      page.category === "roofing" &&
                      page.canonicalPath === "/calculators/roofing/shingles";
                    return (
                      <div className="mt-2 space-y-2">
                        {showFramingMaterialSelector && (
                          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary">
                            Material Type
                            <select
                              value={selectedFramingMaterial}
                              onChange={(event) =>
                                setSelectedFramingMaterial(
                                  event.target.value as FramingMaterialKind,
                                )
                              }
                              className="glass-input h-11 rounded-xl px-3 text-sm text-field-input outline-none"
                            >
                              <option value="wall-studs">Wall Studs</option>
                              <option value="floor-joists">Floor Joists</option>
                              <option value="roof-rafters">Roof Rafters</option>
                              <option value="ceiling-joists">
                                Ceiling Joists
                              </option>
                              <option value="decking">Decking</option>
                            </select>
                          </label>
                        )}
                        <div className="space-y-1">
                          <div className="min-h-[24px] space-y-1">
                            {supportsAreaToggle &&
                              !isRoofingShinglesCalculator && (
                                <UnitToggle
                                  label="Area"
                                  value={areaInputMode}
                                  options={[
                                    {
                                      value: "dimensions",
                                      label: "Dimensions",
                                    },
                                    {
                                      value: "total-sq-ft",
                                      label: "Total Sq Ft",
                                    },
                                  ]}
                                  onChange={handleAreaInputModeChange}
                                />
                              )}
                            {supportsConcreteVolumeToggle && (
                              <UnitToggle
                                label="Yardage"
                                value={volumeInputMode}
                                options={[
                                  { value: "dimensions", label: "Dimensions" },
                                  {
                                    value: "total-cu-yd",
                                    label: "Total Cubic Yards",
                                  },
                                  {
                                    value: "total-cu-ft",
                                    label: "Total Cu Ft",
                                  },
                                ]}
                                onChange={handleVolumeInputModeChange}
                              />
                            )}
                            {supportsWallStudToggle && (
                              <UnitToggle
                                label="Wall Framing"
                                value={wallInputMode}
                                options={[
                                  {
                                    value: "lineal-feet",
                                    label: "Linear Feet (LF)",
                                  },
                                  {
                                    value: "total-studs",
                                    label: "Total Studs",
                                  },
                                ]}
                                onChange={handleWallInputModeChange}
                              />
                            )}
                            {supportsTrimLfToggle && (
                              <UnitToggle
                                label="Trim Layout"
                                value={trimInputMode}
                                options={[
                                  { value: "dimensions", label: "Dimensions" },
                                  { value: "total-lf", label: "Total LF" },
                                ]}
                                onChange={handleTrimInputModeChange}
                              />
                            )}
                            {isFlooringRoute && (
                              <UnitToggle
                                label="Sq Ft per Box"
                                value={flooringBoxMode}
                                options={[
                                  { value: "20", label: "20" },
                                  { value: "24", label: "24" },
                                  { value: "30", label: "30" },
                                  { value: "custom", label: "Custom" },
                                ]}
                                onChange={handleFlooringBoxModeChange}
                              />
                            )}
                          </div>
                          <div className="min-h-[24px]">
                            {!effectiveProMode &&
                              (isSidingRoute ||
                                (page.category === "roofing" &&
                                  !page.canonicalPath.includes("pitch"))) && (
                                <p className="text-field-hint">
                                  One "Square" covers 100 square feet of area.
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {/* Feet/inches input for slab calculator */}
                          {page.canonicalPath ===
                            "/calculators/concrete/slab" &&
                          areaInputMode === "dimensions" ? (
                            <>
                              <FeetInchesInput
                                label={labels.first}
                                feet={baseFeet}
                                inches={baseInches}
                                onFeetChange={(f) => {
                                  setBaseFeet(f === "" ? 0 : f);
                                  setBaseMeasurement(
                                    feetInchesToDecimal(
                                      f === "" ? 0 : f,
                                      baseInches,
                                    ),
                                  );
                                }}
                                onInchesChange={(i) => {
                                  setBaseInches(i === "" ? 0 : i);
                                  setBaseMeasurement(
                                    feetInchesToDecimal(
                                      baseFeet,
                                      i === "" ? 0 : i,
                                    ),
                                  );
                                }}
                                minFeet={0}
                                maxFeet={10000}
                                minInches={0}
                                helpText={getInlineSubLabel(labels.first)}
                              />
                              <FeetInchesInput
                                label={labels.second}
                                feet={widthFeet}
                                inches={widthInches}
                                onFeetChange={(f) => {
                                  setWidthFeet(f === "" ? 0 : f);
                                  setWidthSpan(
                                    feetInchesToDecimal(
                                      f === "" ? 0 : f,
                                      widthInches,
                                    ),
                                  );
                                }}
                                onInchesChange={(i) => {
                                  setWidthInches(i === "" ? 0 : i);
                                  setWidthSpan(
                                    feetInchesToDecimal(
                                      widthFeet,
                                      i === "" ? 0 : i,
                                    ),
                                  );
                                }}
                                minFeet={0}
                                maxFeet={10000}
                                minInches={0}
                                helpText={getInlineSubLabel(labels.second)}
                              />
                            </>
                          ) : isRoofingShinglesCalculator ? (
                            <>
                              <UnitToggle
                                label="Roof Input"
                                value={roofingInputMode}
                                options={[
                                  {
                                    value: "dimensions",
                                    label: "Input Dimensions",
                                  },
                                  {
                                    value: "direct-squares",
                                    label: "Direct Squares",
                                  },
                                ]}
                                onChange={setRoofingInputMode}
                              />

                              {roofingInputMode === "direct-squares" ? (
                                <ProInput
                                  label="Squares"
                                  subLabel="Enter total roofing squares directly (1 sq = 100 sq ft)."
                                  type="number"
                                  min={0.01}
                                  max={1000000}
                                  value={String(roofSquaresInput)}
                                  onChange={(next: string) =>
                                    parseAndSet(
                                      next,
                                      setRoofSquaresInput,
                                      0.01,
                                      1000000,
                                    )
                                  }
                                  unitSuffix="sq"
                                />
                              ) : (
                                <>
                                  <FeetInchesInput
                                    label="Roof Length"
                                    subLabel="Footprint length (before overhang)."
                                    min={0}
                                    max={10000}
                                    value={String(baseMeasurement)}
                                    onChange={(next: string) =>
                                      parseAndSet(
                                        next,
                                        setBaseMeasurement,
                                        1,
                                        10000,
                                      )
                                    }
                                  />
                                  <FeetInchesInput
                                    label="Roof Width"
                                    subLabel="Footprint width (before overhang)."
                                    min={0}
                                    max={10000}
                                    value={String(widthSpan)}
                                    onChange={(next: string) =>
                                      parseAndSet(next, setWidthSpan, 0, 10000)
                                    }
                                  />
                                  <ProInput
                                    label="Overhang / Eave"
                                    subLabel="Adds to both sides of length and width."
                                    type="number"
                                    min={0}
                                    max={48}
                                    value={String(roofOverhangInches)}
                                    onChange={(next: string) =>
                                      parseAndSet(
                                        next,
                                        setRoofOverhangInches,
                                        0,
                                        48,
                                      )
                                    }
                                    unitSuffix="in"
                                  />
                                </>
                              )}

                              <UnitToggle
                                label="Pitch (rise / 12)"
                                value={roofPitchPreset}
                                options={[
                                  { value: "flat", label: "Flat" },
                                  { value: "3", label: "3/12" },
                                  { value: "4", label: "4/12" },
                                  { value: "6", label: "6/12" },
                                  { value: "8", label: "8/12" },
                                  { value: "10", label: "10/12" },
                                  { value: "12", label: "12/12" },
                                  { value: "custom", label: "Custom" },
                                ]}
                                onChange={(nextPreset: RoofingPitchPreset) => {
                                  setRoofPitchPreset(nextPreset);
                                  if (nextPreset !== "custom") {
                                    const nextRise =
                                      nextPreset === "flat"
                                        ? 0
                                        : Number(nextPreset);
                                    setRoofPitchRiseCustom(nextRise);
                                  }
                                }}
                              />
                              {roofPitchPreset === "custom" ? (
                                <ProInput
                                  label='Custom Rise (per 12")'
                                  subLabel="Enter the rise for every 12 inches of run."
                                  type="number"
                                  min={0}
                                  max={24}
                                  value={String(roofPitchRiseCustom)}
                                  onChange={(next: string) =>
                                    parseAndSet(
                                      next,
                                      setRoofPitchRiseCustom,
                                      0,
                                      24,
                                    )
                                  }
                                  unitSuffix="in"
                                />
                              ) : null}
                            </>
                          ) : isConcreteTotalVolumeMode ? (
                            <ProInput
                              label={
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Cubic Yards"
                                  : "Total Cubic Feet"
                              }
                              subLabel={getInlineSubLabel(
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Cubic Yards"
                                  : "Total Cubic Feet",
                              )}
                              helpText={
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Cubic Yards: (Length x Width x Depth) divided by 27."
                                  : undefined
                              }
                              type="number"
                              min={volumeInputMode === "total-cu-yd" ? 0.01 : 1}
                              max={100000000}
                              value={
                                volumeInputMode === "total-cu-yd"
                                  ? String(totalCubicYardsInput)
                                  : String(totalCubicFeetInput)
                              }
                              onChange={(next) =>
                                volumeInputMode === "total-cu-yd"
                                  ? parseAndSet(
                                      next,
                                      setTotalCubicYardsInput,
                                      0.01,
                                      1000000,
                                    )
                                  : parseAndSet(
                                      next,
                                      setTotalCubicFeetInput,
                                      1,
                                      100000000,
                                    )
                              }
                              unitSuffix={
                                volumeInputMode === "total-cu-yd"
                                  ? "yd³"
                                  : "ft³"
                              }
                            />
                          ) : isTrimTotalLfMode ? (
                            <>
                              <ProInput
                                label="Total Linear Feet (LF)"
                                subLabel={getInlineSubLabel(
                                  "Total Linear Feet (LF)",
                                )}
                                type="number"
                                min={0}
                                max={100000000}
                                value={String(totalLinealFeetInput)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setTotalLinealFeetInput,
                                    1,
                                    100000000,
                                  )
                                }
                                unitSuffix="lf"
                              />
                              <FeetInchesInput
                                label="Stock Length"
                                subLabel={getInlineSubLabel("Stock Length")}
                                min={4}
                                max={20}
                                value={String(depthThickness)}
                                onChange={(next) =>
                                  parseAndSet(next, setDepthThickness, 4, 20)
                                }
                              />
                            </>
                          ) : isAreaTotalMode ? (
                            <>
                              <ProInput
                                label="Total Square Feet"
                                subLabel={getInlineSubLabel(
                                  "Total Square Feet",
                                )}
                                type="number"
                                min={0}
                                max={100000000}
                                value={String(totalSquareFeetInput)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setTotalSquareFeetInput,
                                    1,
                                    100000000,
                                  )
                                }
                                unitSuffix="sq ft"
                              />
                              {isSidingRoute && (
                                <ProInput
                                  label="Window/Door Deductions"
                                  subLabel={getInlineSubLabel(
                                    "Window/Door Deduction",
                                  )}
                                  type="number"
                                  min={0}
                                  max={100000000}
                                  value={String(openingDeductionSqFt)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setOpeningDeductionSqFt,
                                      0,
                                      100000000,
                                    )
                                  }
                                  unitSuffix="sq ft"
                                />
                              )}
                              <ProInput
                                label={labels.third}
                                subLabel={getInlineSubLabel(labels.third)}
                                type="number"
                                min={thirdInputMin}
                                max={thirdInputMax}
                                value={String(depthThickness)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setDepthThickness,
                                    thirdInputMin,
                                    thirdInputMax,
                                  )
                                }
                              />
                            </>
                          ) : supportsWallStudToggle &&
                            activeFramingMaterial === "wall-studs" &&
                            page.canonicalPath.includes("/framing/wall") &&
                            !isWallStudTotalMode ? (
                            <>
                              <FeetInchesInput
                                label={labels.first}
                                subLabel={getInlineSubLabel(labels.first)}
                                min={0}
                                max={10000}
                                value={String(baseMeasurement)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setBaseMeasurement,
                                    1,
                                    10000,
                                  )
                                }
                              />

                              <div className="space-y-2 glass-panel p-3">
                                <UnitToggle
                                  label="Stud Spacing (OC)"
                                  value={wallStudSpacingMode}
                                  options={[
                                    { value: "16", label: `16" OC` },
                                    { value: "24", label: `24" OC` },
                                    { value: "custom", label: "Custom" },
                                  ]}
                                  onChange={(nextMode) => {
                                    setWallStudSpacingMode(nextMode);
                                    if (nextMode === "16") {
                                      setWallStudCustomSpacingInches(16);
                                    } else if (nextMode === "24") {
                                      setWallStudCustomSpacingInches(24);
                                    }
                                  }}
                                />
                                {wallStudSpacingMode === "custom" ? (
                                  <ProInput
                                    label="Custom OC Spacing (in)"
                                    subLabel='Typical values are 12", 16", or 24" on-center.'
                                    type="number"
                                    min={8}
                                    max={48}
                                    value={String(wallStudCustomSpacingInches)}
                                    onChange={(next) =>
                                      parseAndSet(
                                        next,
                                        setWallStudCustomSpacingInches,
                                        8,
                                        48,
                                      )
                                    }
                                    unitSuffix="in"
                                  />
                                ) : null}

                                <UnitToggle
                                  label="Stud Height"
                                  value={wallStudHeightMode}
                                  options={[
                                    { value: "8-precut", label: "8' (precut)" },
                                    { value: "9-precut", label: "9' (precut)" },
                                    { value: "10", label: "10'" },
                                    { value: "12", label: "12'" },
                                    { value: "custom", label: "Custom" },
                                  ]}
                                  onChange={(nextMode) => {
                                    setWallStudHeightMode(nextMode);
                                    if (nextMode === "8-precut") {
                                      setWallStudCustomHeightFeet(92.625 / 12);
                                    } else if (nextMode === "9-precut") {
                                      setWallStudCustomHeightFeet(104.625 / 12);
                                    } else if (nextMode === "10") {
                                      setWallStudCustomHeightFeet(10);
                                    } else if (nextMode === "12") {
                                      setWallStudCustomHeightFeet(12);
                                    }
                                  }}
                                />
                                {wallStudHeightMode === "custom" ? (
                                  <FeetInchesInput
                                    label="Custom Stud Height"
                                    subLabel="Custom heights are capped at 20' for job-site realism."
                                    min={0}
                                    max={20}
                                    value={String(wallStudCustomHeightFeet)}
                                    onChange={(next) =>
                                      parseAndSet(
                                        next,
                                        setWallStudCustomHeightFeet,
                                        1,
                                        20,
                                      )
                                    }
                                  />
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setStaggeredStudWall((current) => !current)
                                  }
                                  className={`inline-flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                                    staggeredStudWall
                                      ? "border-[--color-blue-brand]/50 bg-[--color-blue-soft] text-[--color-blue-dark]"
                                      : "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink] hover:border-[--color-border-strong]"
                                  }`}
                                  aria-pressed={staggeredStudWall}
                                >
                                  <span>Staggered Stud Wall</span>
                                  <span className="text-xs font-black uppercase tracking-[0.14em] text-copy-accent">
                                    {staggeredStudWall ? "On" : "Off"}
                                  </span>
                                </button>
                                <p className="text-field-hint text-[11px] leading-snug">
                                  Staggered mode doubles stud rows and plate
                                  footage. Stud height only changes the order
                                  list, not the stud count math.
                                </p>
                              </div>
                            </>
                          ) : isWallStudTotalMode ? (
                            <>
                              <FeetInchesInput
                                label={labels.first}
                                subLabel={getInlineSubLabel(labels.first)}
                                min={0}
                                max={10000}
                                value={String(baseMeasurement)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setBaseMeasurement,
                                    1,
                                    10000,
                                  )
                                }
                              />
                              <ProInput
                                label="Total Studs"
                                subLabel="Use your desired stud count to back-calculate spacing."
                                type="number"
                                min={2}
                                max={50000}
                                value={String(totalStudsInput)}
                                onChange={(next) =>
                                  parseAndSet(
                                    next,
                                    setTotalStudsInput,
                                    2,
                                    50000,
                                  )
                                }
                              />
                              {supportsWallStudToggle &&
                              activeFramingMaterial === "wall-studs" &&
                              page.canonicalPath.includes("/framing/wall") ? (
                                <div className="space-y-2 glass-panel p-3">
                                  <UnitToggle
                                    label="Stud Height"
                                    value={wallStudHeightMode}
                                    options={[
                                      {
                                        value: "8-precut",
                                        label: "8' (precut)",
                                      },
                                      {
                                        value: "9-precut",
                                        label: "9' (precut)",
                                      },
                                      { value: "10", label: "10'" },
                                      { value: "12", label: "12'" },
                                      { value: "custom", label: "Custom" },
                                    ]}
                                    onChange={(nextMode) => {
                                      setWallStudHeightMode(nextMode);
                                      if (nextMode === "8-precut") {
                                        setWallStudCustomHeightFeet(
                                          92.625 / 12,
                                        );
                                      } else if (nextMode === "9-precut") {
                                        setWallStudCustomHeightFeet(
                                          104.625 / 12,
                                        );
                                      } else if (nextMode === "10") {
                                        setWallStudCustomHeightFeet(10);
                                      } else if (nextMode === "12") {
                                        setWallStudCustomHeightFeet(12);
                                      }
                                    }}
                                  />
                                  {wallStudHeightMode === "custom" ? (
                                    <FeetInchesInput
                                      label="Custom Stud Height"
                                      subLabel="Custom heights are capped at 20' for job-site realism."
                                      min={0}
                                      max={20}
                                      value={String(wallStudCustomHeightFeet)}
                                      onChange={(next) =>
                                        parseAndSet(
                                          next,
                                          setWallStudCustomHeightFeet,
                                          1,
                                          20,
                                        )
                                      }
                                    />
                                  ) : null}
                                </div>
                              ) : (
                                <FeetInchesInput
                                  label={labels.third}
                                  subLabel={getInlineSubLabel(labels.third)}
                                  min={thirdInputMin}
                                  max={thirdInputMax}
                                  value={String(depthThickness)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setDepthThickness,
                                      thirdInputMin,
                                      thirdInputMax,
                                    )
                                  }
                                />
                              )}
                            </>
                          ) : (
                            <>
                              {firstUnitSuffix === "ft" ? (
                                <FeetInchesInput
                                  label={labels.first}
                                  subLabel={getInlineSubLabel(labels.first)}
                                  min={firstInputMin}
                                  max={firstInputMax}
                                  value={String(baseMeasurement)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setBaseMeasurement,
                                      firstInputMin,
                                      firstInputMax,
                                    )
                                  }
                                />
                              ) : (
                                <ProInput
                                  label={labels.first}
                                  subLabel={getInlineSubLabel(labels.first)}
                                  type="number"
                                  min={firstInputMin}
                                  max={firstInputMax}
                                  value={String(baseMeasurement)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setBaseMeasurement,
                                      firstInputMin,
                                      firstInputMax,
                                    )
                                  }
                                  unitSuffix={firstUnitSuffix}
                                />
                              )}
                              {secondUnitSuffix === "ft" ? (
                                <FeetInchesInput
                                  label={
                                    isBusinessTaxSave
                                      ? "Tax Rate (%)"
                                      : labels.second
                                  }
                                  subLabel={
                                    isBusinessTaxSave
                                      ? "Use NYS auto-fill by county or enter your blended rate."
                                      : getInlineSubLabel(labels.second)
                                  }
                                  min={secondInputMin}
                                  max={secondInputMax}
                                  value={String(widthSpan)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setWidthSpan,
                                      secondInputMin,
                                      secondInputMax,
                                    )
                                  }
                                />
                              ) : (
                                <ProInput
                                  label={
                                    isBusinessTaxSave
                                      ? "Tax Rate (%)"
                                      : labels.second
                                  }
                                  subLabel={
                                    isBusinessTaxSave
                                      ? "Use NYS auto-fill by county or enter your blended rate."
                                      : getInlineSubLabel(labels.second)
                                  }
                                  type="number"
                                  min={secondInputMin}
                                  max={secondInputMax}
                                  value={String(widthSpan)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setWidthSpan,
                                      secondInputMin,
                                      secondInputMax,
                                    )
                                  }
                                  unitSuffix={secondUnitSuffix}
                                />
                              )}
                              {thirdUnitSuffix === "ft" ? (
                                <FeetInchesInput
                                  label={
                                    isBusinessTaxSave
                                      ? "Deductions ($)"
                                      : labels.third
                                  }
                                  subLabel={
                                    isBusinessTaxSave
                                      ? "Optional deductions or adjustments taken before tax."
                                      : getInlineSubLabel(labels.third)
                                  }
                                  min={thirdInputMin}
                                  max={thirdInputMax}
                                  value={String(depthThickness)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setDepthThickness,
                                      thirdInputMin,
                                      thirdInputMax,
                                    )
                                  }
                                />
                              ) : (
                                <ProInput
                                  label={
                                    isBusinessTaxSave
                                      ? "Deductions ($)"
                                      : labels.third
                                  }
                                  subLabel={
                                    isBusinessTaxSave
                                      ? "Optional deductions or adjustments taken before tax."
                                      : getInlineSubLabel(labels.third)
                                  }
                                  type="number"
                                  min={thirdInputMin}
                                  max={thirdInputMax}
                                  value={String(depthThickness)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setDepthThickness,
                                      thirdInputMin,
                                      thirdInputMax,
                                    )
                                  }
                                  unitSuffix={thirdUnitSuffix}
                                />
                              )}
                              {isSidingRoute && (
                                <ProInput
                                  label="Window/Door Deductions"
                                  subLabel={getInlineSubLabel(
                                    "Window/Door Deduction",
                                  )}
                                  type="number"
                                  min={0}
                                  max={100000000}
                                  value={String(openingDeductionSqFt)}
                                  onChange={(next) =>
                                    parseAndSet(
                                      next,
                                      setOpeningDeductionSqFt,
                                      0,
                                      100000000,
                                    )
                                  }
                                  unitSuffix="sq ft"
                                />
                              )}
                            </>
                          )}
                        </div>

                        {/* Collapsible Waste Factor Section */}
                        <details
                          open={wasteFactorOpen}
                          className="overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface-alt]"
                        >
                          <summary
                            className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-copy-secondary transition-colors hover:bg-[--color-surface]"
                            onClick={(e) => {
                              e.preventDefault();
                              setWasteFactorOpen(!wasteFactorOpen);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  wasteFactorOpen ? "rotate-180" : ""
                                }`}
                                aria-hidden
                              />
                              <span id="waste-factor-label">
                                {isTrimRoute
                                  ? "Miter Waste %"
                                  : "Waste Factor %"}
                              </span>
                            </span>
                            <span className="tabular-nums">{wasteFactor}%</span>
                          </summary>
                          <div className="px-3 pb-3">
                            {!effectiveProMode && (
                              <p className="mb-2 text-field-hint">
                                {getInlineSubLabel(
                                  isTrimRoute ? "Miter Waste" : "Waste Factor",
                                )}
                              </p>
                            )}
                            <input
                              type="range"
                              aria-labelledby="waste-factor-label"
                              min={0}
                              max={MAX_WASTE_FACTOR}
                              value={wasteFactor}
                              onChange={(event) =>
                                setWasteFactor(
                                  clampValue(
                                    Number(event.target.value),
                                    0,
                                    MAX_WASTE_FACTOR,
                                  ),
                                )
                              }
                              className="w-full accent-blue-base"
                            />
                          </div>
                        </details>
                      </div>
                    );
                  })()}

                  {deviceProfile.layoutMode === "two-column" &&
                  localTip &&
                  !effectiveProMode ? (
                    <div className="glass-panel border-primary/25 bg-primary/10 p-3 mt-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                        Pro Tip
                      </h3>
                      <p className="mt-1 text-sm text-[--color-ink]">
                        {localTip}
                      </p>
                    </div>
                  ) : null}
                </section>

                <aside
                  ref={resultsCardRef}
                  suppressHydrationWarning
                  className={`self-start p-5 sm:p-6 rounded-2xl border border-[--color-border] bg-white shadow-sm transition-colors ${
                    deviceProfile.layoutMode === "glass-stack"
                      ? ""
                      : "lg:sticky lg:top-[calc(var(--shell-header-h,52px)+16px)] lg:self-start"
                  } ${
                    deviceProfile.layoutMode === "command-center"
                      ? "xl:col-start-2"
                      : ""
                  }`}
                >
                  <ProResult
                    containerClassName={
                      deviceProfile.layoutMode === "two-column" ? "" : undefined
                    }
                    primary={displayResults.primary}
                    secondary={displayResults.secondary}
                    primaryUnitDisplay={getPrimaryDisplayUnit(
                      displayResults.primary,
                    )}
                    localTip={
                      effectiveProMode ||
                      deviceProfile.layoutMode === "two-column"
                        ? null
                        : localTip
                    }
                    materialList={displayResults.materialList}
                    onCopyOrder={handleCopyOrder}
                    onFinalize={openFinalizeModal}
                    finalizeLabel="Finalize Estimate"
                    finalizeIcon={<PenSquare className="h-4 w-4" aria-hidden />}
                  />

                  <section className="glass-panel p-3 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-blue-base p-1.5 text-white">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[--color-ink]">
                            AI Material Optimizer
                          </p>
                          <p className="text-xs text-[--color-ink-dim]">
                            Cost savings & best practices
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={runAiOptimizer}
                        disabled={aiOptimizeBusy}
                        className="rounded-xl border border-[--color-border] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:border-[--color-blue-brand] hover:text-[--color-blue-brand] active:scale-[0.98]"
                      >
                        {aiOptimizeBusy ? "Optimizing…" : "Optimize"}
                      </button>
                    </div>
                  </section>

                  {aiOptimizeError || aiOptimizeContent ? (
                    <section className="glass-panel mt-2 p-3 transition-colors">
                      {aiOptimizeError ? (
                        <p className="text-sm text-red-200">
                          {aiOptimizeError}
                        </p>
                      ) : aiOptimizeContent ? (
                        <div className="text-sm">
                          <ArticleMarkdown content={aiOptimizeContent} />
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {terminologyTerms.length ? (
                    <section className="mt-4 rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[--color-blue-brand]">
                            Terminology
                          </p>
                        </div>
                        <Link
                          href={routes.glossary}
                          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[--color-blue-brand] underline-offset-4 hover:underline"
                        >
                          Glossary terms
                        </Link>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {terminologyTerms.slice(0, 3).map((term) => (
                          <li
                            key={term.key}
                            className="rounded-lg border border-[--color-border]/50 bg-white px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[--color-ink]">
                                {term.label}
                              </span>
                              {term.unit ? (
                                <span className="text-[10px] uppercase tracking-[0.12em] text-[--color-ink-dim]">
                                  {term.unit}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-[--color-ink-mid] line-clamp-2">
                              {term.definition}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {deviceProfile.layoutMode === "two-column" && (
                    <CalculatorAuditPanel
                      className="mt-2"
                      title={liveAudit.title}
                      rows={liveAudit.rows}
                    />
                  )}
                </aside>

                {deviceProfile.layoutMode === "command-center" && (
                  <aside
                    className={`glass-container-deep p-3 ${
                      deviceProfile.layoutMode === "command-center"
                        ? "xl:col-start-3"
                        : ""
                    }`}
                  >
                    <CalculatorAuditPanel
                      className="bg-transparent p-0 shadow-none"
                      title={liveAudit.title}
                      rows={liveAudit.rows}
                    />
                  </aside>
                )}
              </div>

              <section
                className={`p-5 sm:p-6 rounded-2xl border border-[--color-border] bg-white shadow-sm transition-colors ${
                  deviceProfile.layoutMode === "command-center" ? "xl:mt-1" : ""
                }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-display-heading">
                  Trade Module Paths
                </h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {tradeNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="glass-button group flex min-h-9 items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:text-[--color-blue-brand] active:scale-[0.98]"
                    >
                      <item.icon
                        className="h-3.5 w-3.5 transition-all duration-200 group-hover:text-blue-base"
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {page.relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href as Route}
                        className="inline-flex items-center gap-2 text-sm text-copy-secondary transition-all duration-300 ease-in-out hover:text-primary"
                      >
                        <ArrowRight
                          className="h-3.5 w-3.5 text-blue-base"
                          aria-hidden
                        />
                        {normalizeDisplayedLabel(
                          link.label,
                          page.canonicalPath,
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 rounded-xl border border-blue-base/35 bg-blue-base/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--color-blue-brand]">
                    Field Notes
                  </p>
                  <p className="mt-2 text-sm text-copy-secondary">
                    Regional guides and contractor tips — 100% on-site, no
                    external links.
                  </p>
                  <Link
                    href={routes.fieldNotes}
                    className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg glass-button-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                  >
                    Open Field Notes
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </section>

              {/* Tool Navigator — at bottom, hidden on mobile */}
              <aside className="hidden lg:block p-5 sm:p-6 rounded-2xl border border-[--color-border] bg-white shadow-sm h-fit">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[--color-ink]">
                  Tool Navigator
                </h2>
                <div className="relative mt-3">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-tertiary"
                    aria-hidden
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search 25+ trade tools"
                    className="glass-input h-10 w-full rounded-xl pl-9 pr-3 text-sm text-field-input tabular-nums tracking-tight outline-none"
                  />
                </div>

                <div
                  ref={moduleDropdownRef}
                  className="mt-3 grid grid-cols-3 gap-2"
                >
                  {filteredGroups.map((group) => (
                    <div key={group.label} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenModuleGroup((current) =>
                            current === group.label ? null : group.label,
                          )
                        }
                        aria-expanded={openModuleGroup === group.label}
                        aria-haspopup="true"
                        className="glass-button flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-copy-secondary transition-all duration-200 ease-in-out hover:text-[--color-ink] active:scale-[0.98]"
                      >
                        <group.icon
                          className="h-4 w-4 text-blue-base"
                          aria-hidden
                        />
                        {group.label}
                        <ChevronDown
                          className="h-3 w-3 text-copy-tertiary"
                          aria-hidden
                        />
                      </button>

                      <div
                        className={`absolute left-0 top-full z-20 mt-1 w-56 glass-panel p-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-200 ease-in-out ${
                          openModuleGroup === group.label
                            ? "pointer-events-auto visible opacity-100"
                            : "pointer-events-none invisible opacity-0"
                        }`}
                      >
                        {group.modules.map((module) => (
                          <Link
                            key={module.href}
                            href={module.href}
                            onClick={() => setOpenModuleGroup(null)}
                            className={`glass-nav-item mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition last:mb-0 ${
                              page.canonicalPath === module.href
                                ? "bg-[--color-blue-brand]/25 text-[--color-blue-brand]"
                                : "text-[--color-nav-text] hover:bg-[--color-surface-alt] hover:text-[--color-ink]"
                            }`}
                          >
                            <module.icon
                              className="h-3.5 w-3.5 text-[--color-blue-brand]"
                              aria-hidden
                            />
                            {normalizeDisplayedLabel(
                              module.label,
                              page.canonicalPath,
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <nav
            className="fixed bottom-14 left-0 right-0 z-40 flex min-h-10 items-center justify-between border-t border-[--color-border] bg-[--color-surface-alt] px-4 py-1.5 lg:hidden"
            aria-label="Mobile tool actions"
          >
            <Link
              href={routes.commandCenter}
              prefetch={false}
              className="glass-nav-item inline-flex min-h-9 items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.98]"
            >
              <HardHat className="h-3.5 w-3.5" aria-hidden />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="glass-button inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-base transition-all duration-200 active:scale-[0.98]"
            >
              <Menu className="h-3.5 w-3.5" aria-hidden />
              Modules
            </button>
            <button
              type="button"
              onClick={openFinalizeModal}
              className="glass-nav-item inline-flex min-h-9 items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.98]"
            >
              <PenSquare className="h-3.5 w-3.5" aria-hidden />
              Finalize Estimate
            </button>
          </nav>
        </section>

        <div className="fixed bottom-0 left-0 z-40 w-full border-t border-[--color-border] bg-[--color-surface-alt] px-4 py-3 pb-safe keyboard-safe-pb lg:hidden critical-ui-container">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-copy-secondary">
                {calculatorResults.primary.label}
              </p>
              <p className="truncate text-lg font-black tabular-nums tracking-tight text-copy-accent">
                <span
                  key={calculatorResults.primary.value}
                  className="result-counter"
                >
                  {calculatorResults.primary.value}
                </span>{" "}
                <span className="text-copy-primary">
                  {getPrimaryDisplayUnit(calculatorResults.primary)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={openFinalizeModal}
              className="glass-button-primary inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
            >
              <PenSquare className="h-3.5 w-3.5" aria-hidden />
              Finalize Estimate
            </button>
          </div>
        </div>

        <EmailEstimateModal
          open={crmModalOpen}
          onClose={() => setCrmModalOpen(false)}
          estimate={emailEstimatePayload}
          replyTo={contractorProfile.businessEmail}
        />
        {finalizeOpen ? (
          <div className="glass-modal-overlay">
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Close finalize estimate dialog"
              onClick={() =>
                finalizeBusy ? undefined : setFinalizeOpen(false)
              }
            />
            <div className="glass-modal relative z-10 w-full max-w-lg rounded-t-3xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-3xl">
              <button
                type="button"
                onClick={() =>
                  finalizeBusy ? undefined : setFinalizeOpen(false)
                }
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full glass-button text-copy-tertiary transition hover:border-blue-base hover:text-primary"
                aria-label="Close Finalize Estimate"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
                Finalize Estimate
              </p>
              <h3 className="mt-2 text-xl font-black text-display-heading">
                Estimate to invoice workflow
              </h3>
              <p className="mt-2 text-sm text-copy-tertiary">
                Save this estimate, generate PDF, or send for signature to move
                toward invoicing.
              </p>

              <div className="mt-4 grid gap-3">
                <label className="text-sm text-copy-secondary">
                  Estimate Name (Auto-Generated)
                  <input
                    value={
                      estimateName && !estimateJobName && !estimateClientName
                      ? estimateName
                      : `${estimateClientName.trim().split(' ').pop() || 'Client'} - ${estimateJobName || 'Project'}`
                    }
                    readOnly
                    className="glass-input mt-1 h-11 w-full rounded-xl px-3 outline-none opacity-80 cursor-not-allowed cursor-not-allowed text-copy-tertiary"
                  />
                </label>
                <label className="text-sm text-copy-secondary">
                  Client Name
                  <input
                    value={estimateClientName}
                    onChange={(event) =>
                      setEstimateClientName(event.target.value)
                    }
                    className="glass-input mt-1 h-11 w-full rounded-xl px-3 outline-none"
                    placeholder="Optional"
                  />
                </label>
                <label className="text-sm text-copy-secondary">
                  Client Email
                  <input
                    value={estimateClientEmail}
                    onChange={(event) =>
                      setEstimateClientEmail(event.target.value)
                    }
                    className="glass-input mt-1 h-11 w-full rounded-xl px-3 outline-none"
                    placeholder="Optional"
                    type="email"
                  />
                </label>
                <label className="text-sm text-copy-secondary">
                  Job Name
                  <input
                    value={estimateJobName}
                    onChange={(event) => setEstimateJobName(event.target.value)}
                    className="glass-input mt-1 h-11 w-full rounded-xl px-3 outline-none"
                    placeholder="Optional"
                  />
                </label>
                <label className="text-sm text-copy-secondary">
                  Job Site Address
                  <div className="relative mt-1">
                    <Autocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      onPlaceSelected={(place) => {
                        if (place.formatted_address) {
                          setEstimateJobAddress(place.formatted_address);
                        } else if (place.name) {
                          setEstimateJobAddress(place.name);
                        }
                      }}
                      options={{ types: ["address"] }}
                      defaultValue={estimateJobAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstimateJobAddress(e.target.value)}
                      className="glass-input h-11 w-full rounded-xl pl-3 pr-10 outline-none"
                      placeholder="Optional"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition(async (pos) => {
                            const { latitude, longitude } = pos.coords;
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                              const data = await res.json();
                              if (data && data.display_name) {
                                setEstimateJobAddress(data.display_name);
                              }
                            } catch {}
                          })
                        }
                      }}
                      className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-[--color-ink-dim] hover:text-[--color-blue-brand] transition-colors"
                      title="Use Current Location"
                    >
                      <MapPin className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </label>

                <label className="text-sm text-copy-secondary">
                  Quote Note{" "}
                  <span className="text-copy-tertiary text-xs font-normal">
                    (appears on PDF)
                  </span>
                  <textarea
                    value={estimateQuoteNote}
                    onChange={(event) =>
                      setEstimateQuoteNote(event.target.value)
                    }
                    className="glass-input mt-1 w-full rounded-xl px-3 py-2 outline-none resize-none"
                    rows={2}
                    placeholder="Optional note shown to the client on the estimate PDF"
                    maxLength={1000}
                  />
                </label>
                <label className="text-sm text-copy-secondary">
                  Internal Note{" "}
                  <span className="text-copy-tertiary text-xs font-normal">
                    (never on PDF)
                  </span>
                  <textarea
                    value={estimateInternalNote}
                    onChange={(event) =>
                      setEstimateInternalNote(event.target.value)
                    }
                    className="glass-input mt-1 w-full rounded-xl px-3 py-2 outline-none resize-none"
                    rows={2}
                    placeholder="Internal-only project notes. Not shown to the client."
                    maxLength={2000}
                  />
                </label>
              </div>

              <p className="mt-3 text-xs text-copy-tertiary">
                Required for any estimate that leaves the calculator: save, PDF,
                email, or signature.
              </p>

              {primaryMaterialOrder ? (
                <div className="mt-4 rounded-2xl border border-blue-base/30 bg-blue-base/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                    First Material Order
                  </p>
                  <p className="mt-1 text-sm font-semibold text-copy-primary">
                    {primaryMaterialOrder}
                  </p>
                </div>
              ) : null}

              {createdSignUrl ? (
                <div className="mt-4 glass-panel px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-copy-tertiary">
                    Sign Link
                  </p>
                  <p className="mt-1 break-all text-sm text-copy-primary">
                    {createdSignUrl}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopySignUrl}
                      className="glass-button inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-blue-base/40 px-3 text-sm font-semibold text-[--color-blue-brand]"
                    >
                      Copy Link
                    </button>
                    <a
                      href={createdSignUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-button inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold text-copy-primary"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ) : null}

              {!canUseSignAndReturn ? (
                <p className="mt-4 text-xs text-copy-tertiary">
                  Sign & Return only appears for signed-in users with Pro Mode
                  enabled.
                </p>
              ) : null}

              <div className="mt-4 min-h-[56px] space-y-2">
                {finalizeError ? (
                  <p className="rounded-xl border border-error/25 bg-error/10 px-3 py-2 text-sm text-red-200">
                    {finalizeError}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        Sentry.captureException(
                          new Error("User reported finalize error"),
                          {
                            tags: { route: "finalize_modal" },
                            extra: {
                              finalizeError,
                              canonicalPath: page.canonicalPath,
                            },
                          },
                        );
                        if (typeof Sentry.showReportDialog === "function") {
                          Sentry.showReportDialog({
                            title: "Report this issue",
                            subtitle:
                              "Tell us what happened during Finalize Estimate.",
                          });
                        } else {
                          setFinalizeSuccess("Thanks — error reported.");
                        }
                      }}
                      className="ml-1 text-xs font-medium underline underline-offset-2 text-copy-accent hover:text-red-50"
                    >
                      Report this issue
                    </button>
                  </p>
                ) : null}
                {finalizeSuccess ? (
                  <p className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm text-emerald-200">
                    {finalizeSuccess}
                  </p>
                ) : null}
              </div>

              <div
                className={`mt-5 grid gap-2 ${
                  canUseSignAndReturn ? "sm:grid-cols-4" : "sm:grid-cols-3"
                }`}
              >
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={finalizeBusy !== null}
                  className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-copy-primary transition hover:border-blue-base disabled:opacity-60"
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  {finalizeBusy === "pdf" ? "Generating..." : "Download PDF"}
                </button>
                {session ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={finalizeBusy !== null}
                    className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-copy-primary transition hover:border-blue-base disabled:opacity-60"
                  >
                    <ClipboardList className="h-4 w-4" aria-hidden />
                    Add to Estimate Queue
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    openEmailEstimateModal();
                  }}
                  disabled={finalizeBusy !== null}
                  className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-copy-primary transition hover:border-blue-base disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email Client
                </button>
                {canUseSignAndReturn ? (
                  <button
                    type="button"
                    onClick={handleSendForSignature}
                    disabled={finalizeBusy !== null}
                    className="glass-button-primary rim-light-active inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition hover:bg-blue-light disabled:opacity-60"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    {finalizeBusy === "sign"
                      ? "Creating Link..."
                      : "Send to Client for Signature"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </Sentry.ErrorBoundary>
  );
}

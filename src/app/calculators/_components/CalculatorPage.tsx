"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { round } from "mathjs";
import {
  getCalculatorAuditRef,
  setCalculatorAuditSnapshot,
} from "../_lib/calculator-audit-ref";
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
  Triangle,
  Wind,
  Wrench,
  X,
} from "lucide-react";
import {
  EmailEstimateModal,
  type EstimatePayload,
} from "@/components/ui/EmailEstimateModal";
import { JsonLD } from "@/seo";
import {
  getTradePageSchema,
  type TradePageDefinition,
} from "../_lib/trade-pages";
import { NYS_COUNTY_TAX_RATES } from "@/data/nys-tax-rates";
import {
  getFinancialCalculatorCopy,
  getFinancialTermDefinition,
  getFinancialTermLabel,
} from "@/data/financial-terms";
import { calculateNysSalesTax } from "@/services/taxEngine";
import { routes } from "@routes";
import { UnitToggle } from "./UnitToggle";
import { ProInput } from "@/components/ui/ProInput";
import { ProResult } from "@/components/ui/ProResult";
import { useProMode } from "@/hooks/useProMode";
import { triggerHaptic } from "@/hooks/useHaptic";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { useContractorProfile } from "@/components/pdf/useContractorProfile";
import { getConcreteInputLabelsFromCopy } from "@/data/construction-terms";
import { useStore } from "@/lib/store";
import { recordVisit } from "@/lib/recommendations/activity";

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
  | "decking";

type AreaInputMode = "dimensions" | "total-sq-ft";
type VolumeInputMode = "dimensions" | "total-cu-yd" | "total-cu-ft";
type WallInputMode = "lineal-feet" | "total-studs";
type TrimInputMode = "dimensions" | "total-lf";
type FlooringBoxMode = "20" | "24" | "30" | "custom";

function getFramingMaterialFromPath(path: string): FramingMaterialKind {
  const p = path.toLowerCase();
  if (p.includes("/decking") || p.includes("deck-joists")) return "decking";
  if (p.includes("/framing/floor")) return "floor-joists";
  if (p.includes("/framing/ceiling")) return "ceiling-joists";
  if (p.includes("/framing/roof") || p.includes("rafter"))
    return "roof-rafters";
  return "wall-studs";
}

function getLockedFramingMaterial(path: string): FramingMaterialKind | null {
  const p = path.toLowerCase();
  if (p.includes("/decking")) return "decking";
  if (p.includes("/framing/floor")) return "floor-joists";
  if (p.includes("/framing/ceiling")) return "ceiling-joists";
  if (p.includes("/framing/roof")) return "roof-rafters";
  if (p.includes("/framing/wall")) return "wall-studs";
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
      first: "Deck Frame Width (ft)",
      second: "Deck Joist Spacing (OC)",
      third: "Deck Board Width (in)",
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
      {
        label: "Drywall Sheets",
        href: "/calculators/mechanical/drywall-sheets" as Route,
        icon: Layout,
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
];

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  if (p.includes("header"))
    return {
      first: "Span Width (ft)",
      second: "Plate Count",
      third: "Header Depth (in)",
    };
  if (p.includes("slab"))
    return {
      first: "Running Lineal Feet",
      second: "Slab Width (ft)",
      third: "Slab Depth (Inches)",
    };
  if (p.includes("footing"))
    return {
      first: "Running Lineal Feet",
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
      first: "Running Lineal Feet",
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
      first: "BTU Load (sq ft)",
      second: "Ceiling Height (ft)",
      third: "Climate Zone Factor",
    };
  if (p.includes("ventilation"))
    return {
      first: "Ventilation CFM Area (sq ft)",
      second: "Ceiling Height (ft)",
      third: "Duct Static Pressure",
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

export function CalculatorPage({ page, closeModal }: CalculatorPageProps) {
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
  const [baseMeasurement, setBaseMeasurement] = useState(10);
  const [widthSpan, setWidthSpan] = useState(10);
  const [depthThickness, setDepthThickness] = useState(4);
  const [wasteFactor, setWasteFactor] = useState(10);
  const [saveLocked, setSaveLocked] = useState(false);
  const [areaInputMode, setAreaInputMode] =
    useState<AreaInputMode>("dimensions");
  const [volumeInputMode, setVolumeInputMode] =
    useState<VolumeInputMode>("dimensions");
  const [wallInputMode, setWallInputMode] =
    useState<WallInputMode>("lineal-feet");
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
  const [estimateName, setEstimateName] = useState(
    `${displayTitle(page.title)} Estimate`,
  );
  const [estimateClientName, setEstimateClientName] = useState("");
  const [estimateClientEmail, setEstimateClientEmail] = useState("");
  const [estimateJobName, setEstimateJobName] = useState("");
  const [estimateJobAddress, setEstimateJobAddress] = useState("");

  const haptic = useHaptic();
  const hapticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstCalcRender = useRef(true);
  const userInteracted = useRef(false);
  const hasReportedError = useRef(false);
  const resultsCardRef = useRef<HTMLElement | null>(null);
  const moduleDropdownRef = useRef<HTMLDivElement | null>(null);
  const [iconPulse, setIconPulse] = useState(false);
  const isBusinessTaxSave =
    page.canonicalPath === "/calculators/business/tax-save" ||
    page.key === "business-tax-save";
  const [taxRegion, setTaxRegion] = useState<"NYS" | "Other">("NYS");
  const [taxCounty, setTaxCounty] = useState<string>("Oneida");
  const [capitalImprovement, setCapitalImprovement] = useState(false);

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
    setTrimInputMode("dimensions");
    setOpeningDeductionSqFt(0);
    setFlooringBoxMode("custom");
    setCapitalImprovement(false);

    if (financialCopy) {
      setBaseMeasurement(financialCopy.inputs[0].defaultValue);
      setWidthSpan(financialCopy.inputs[1].defaultValue);
      setDepthThickness(financialCopy.inputs[2].defaultValue);
    } else {
      setBaseMeasurement(10);
      setWidthSpan(10);
      setDepthThickness(4);
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
    clampValue(baseMeasurement, 1, 10000) * clampValue(widthSpan, 1, 10000);
  const dimensionsLinealFeet =
    clampValue(baseMeasurement, 1, 10000) * 2 +
    clampValue(widthSpan, 1, 10000) * 2;
  const dimensionsVolumeCubicFeet =
    clampValue(baseMeasurement, 1, 10000) *
    clampValue(widthSpan, 1, 10000) *
    (clampValue(depthThickness, 1, 96) / 12);
  const grossAreaSquareFeet = isAreaTotalMode
    ? clampValue(totalSquareFeetInput, 1, 100000000)
    : dimensionsAreaSquareFeet;
  const totalLinealFeet = isTrimTotalLfMode
    ? clampValue(totalLinealFeetInput, 1, 100000000)
    : dimensionsLinealFeet;
  const deductionSqFt = isSidingRoute
    ? clampValue(openingDeductionSqFt, 0, 100000000)
    : 0;
  const areaSquareFeet = Math.max(1, grossAreaSquareFeet - deductionSqFt);
  const volumeCubicFeet = isConcreteTotalVolumeMode
    ? volumeInputMode === "total-cu-yd"
      ? clampValue(totalCubicYardsInput, 0.01, 1000000) * 27
      : clampValue(totalCubicFeetInput, 1, 100000000)
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
      const runFeet = clampValue(baseMeasurement, 1, 10000);
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
    const spacingOcInches = clampValue(widthSpan, 8, 48);
    const runFeet = clampValue(baseMeasurement, 1, 10000);
    const framingLengthFeet = clampValue(depthThickness, 1, 10000);
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
      const currency = (value: number) => value.toFixed(2);

      if (
        page.canonicalPath.includes("profit-margin") ||
        page.canonicalPath.includes("management/margin")
      ) {
        const directCost = clampValue(baseMeasurement, 0, 100000000);
        const overheadPct = clampValue(widthSpan, 0, 100);
        const targetMarginPct = clampValue(depthThickness, 0, 95);
        const overheadDollars = directCost * (overheadPct / 100);
        const breakEvenPrice = directCost + overheadDollars;
        const sellPrice =
          targetMarginPct >= 95
            ? breakEvenPrice
            : breakEvenPrice / (1 - targetMarginPct / 100);
        const grossProfit = sellPrice - breakEvenPrice;
        const grossMarginPct =
          sellPrice === 0 ? 0 : (grossProfit / sellPrice) * 100;
        const markupPct =
          directCost === 0 ? 0 : ((sellPrice - directCost) / directCost) * 100;

        return {
          primary: {
            label: "Bid / Selling Price",
            value: currency(sellPrice),
            unit: "$",
          },
          secondary: [
            {
              label: "Break-even Price",
              value: currency(breakEvenPrice),
              unit: "$",
            },
            {
              label: "Gross Profit",
              value: currency(grossProfit),
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
            `Break-even covers $${currency(overheadDollars)} overhead at ${overheadPct.toFixed(1)}%.`,
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
        const burdenedRate = baseWage * (1 + burdenPct / 100);
        const loadedRate = baseWage * (1 + (burdenPct + overheadPct) / 100);
        const profitTargetPct = 15;
        const billableRate = loadedRate / (1 - profitTargetPct / 100);
        const profitPerHour = billableRate - loadedRate;

        return {
          primary: {
            label: "Billable Rate (target 15% profit)",
            value: currency(billableRate),
            unit: "$/hr",
          },
          secondary: [
            {
              label: "Loaded Cost Rate",
              value: currency(loadedRate),
              unit: "$/hr",
            },
            {
              label: "Burdened Labor Rate",
              value: currency(burdenedRate),
              unit: "$/hr",
            },
            {
              label: "Profit per Hour",
              value: currency(profitPerHour),
              unit: "$/hr",
            },
          ],
          materialList: [
            `Loaded labor includes ${burdenPct.toFixed(1)}% burden and ${overheadPct.toFixed(1)}% overhead.`,
            `Charge ~$${currency(billableRate)} per hour to hold ~${profitTargetPct}% profit after overhead.`,
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
        const closeRate = closeRatePct / 100;
        const customerAcquisitionCost =
          closeRate === 0 ? 0 : costPerLead / closeRate;
        const revenuePerLead = avgJobValue * closeRate;
        const paybackMultiple =
          customerAcquisitionCost === 0
            ? 0
            : avgJobValue / customerAcquisitionCost;

        return {
          primary: {
            label: "Customer Acquisition Cost (CAC)",
            value: currency(customerAcquisitionCost),
            unit: "$",
          },
          secondary: [
            {
              label: "Revenue per Lead",
              value: currency(revenuePerLead),
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
            `CAC assumes ${closeRatePct.toFixed(1)}% close rate on $${currency(costPerLead)} CPL.`,
            `Avg job value $${currency(avgJobValue)} yields ${paybackMultiple.toFixed(2)}x payback.`,
          ],
        };
      }

      if (page.canonicalPath.includes("tax-save")) {
        const grossRevenue = clampValue(baseMeasurement, 0, 1_000_000_000);
        const taxRatePct = clampValue(widthSpan, 0, 100);
        const deductionsValue = clampValue(depthThickness, 0, 1_000_000_000);
        const taxableIncome = Math.max(0, grossRevenue - deductionsValue);
        const rateSourceCounty =
          taxRegion === "NYS" ? taxCounty : "Custom / Other";
        const taxResult = calculateNysSalesTax({
          county: rateSourceCounty,
          taxableAmount: taxableIncome,
          projectType: capitalImprovement
            ? "capital-improvement"
            : "repair-maintenance",
          customCombinedRate: taxRegion === "NYS" ? undefined : taxRatePct,
        });
        const rateApplied = taxResult.rateApplied || taxRatePct;
        const taxOwed = taxResult.taxDue;
        const netIncome = grossRevenue - taxOwed;
        const effectiveTaxRate =
          grossRevenue === 0 ? 0 : (taxOwed / grossRevenue) * 100;
        const taxSavings = capitalImprovement
          ? 0
          : round(taxableIncome * (rateApplied / 100), 2) -
            round((taxableIncome - deductionsValue) * (rateApplied / 100), 2);

        return {
          primary: {
            label: "Projected Tax",
            value: currency(taxOwed),
            unit: "$",
          },
          secondary: [
            {
              label: "Taxable Income",
              value: currency(taxableIncome),
              unit: "$",
            },
            {
              label: "Net Income After Tax",
              value: currency(netIncome),
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
                    value: currency(taxResult.statePortion),
                    unit: "$",
                  },
                  {
                    label: "Local Portion",
                    value: currency(taxResult.localPortion),
                    unit: "$",
                  },
                ]),
            {
              label: "Tax Savings From Deductions",
              value: currency(taxSavings),
              unit: "$",
            },
          ],
          materialList: [
            capitalImprovement
              ? "Capital Improvement: collect NYS Form ST-124; do not charge sales tax on labor."
              : `${rateApplied.toFixed(2)}% blended tax on $${currency(taxableIncome)} taxable income.`,
            capitalImprovement
              ? "Pay sales tax on materials at purchase; retain ST-124 for audit trail."
              : `State: $${currency(taxResult.statePortion)} · Local: $${currency(taxResult.localPortion)}`,
            `Deductions reduce tax by $${currency(taxSavings)}.`,
            ...taxResult.notes,
          ],
        };
      }
    }

    if (isDrywallCalculator) {
      const rawAreaSqFt = clampValue(baseMeasurement, 1, 100000000);
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
          `Order ${sheets4x8} Sheets 4x8 Drywall`,
          `Order ${sheets4x12} Sheets 4x12 Drywall`,
          `Order ${jointBuckets} Buckets Joint Compound`,
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
          label: "Lineal Feet (LF)",
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
          `Order ${stickCount} full sticks @ ${stockLengthFeet.toFixed(0)}'`,
        ],
      };
    }

    if (isFlooringCalculator) {
      const sqFtPerBox = clampValue(depthThickness, 1, 250);
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
          `Order ${boxCount} Flooring Boxes`,
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
            `Order ${totalJoists} Floor Joists @ ${floorWidth.toFixed(2)}' span`,
            `Order ${rimJoistsLf.toFixed(1)} LF Rim Joist Material`,
            `Order ${subfloorSheets} Sheets 4x8 Subfloor`,
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
            `Order ${totalRafters} - 2x10x${nominalLength} Roof Rafters`,
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
            `Order ${totalCeilingJoists} - 2x10x${nominalLength} Ceiling Joists`,
          ],
        };
      }

      if (activeFramingMaterial === "decking") {
        const totalJoists = Math.max(2, Math.ceil(runFeet / spacingFeet) + 1);
        const boardWidthFeet = clampValue(depthThickness, 1, 12) / 12;
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
            `Order ${totalJoists} - 2x10x${nominalLength} Deck Joists`,
            `Order ${deckBoards} - 5/4x6x${nominalLength} Decking Boards`,
          ],
        };
      }

      const totalStuds = isWallStudTotalMode
        ? wallStudTargetCount
        : Math.max(8, Math.ceil(runFeet / spacingFeet) + 1);

      if (page.canonicalPath.includes("/framing/wall")) {
        const totalPlateLf = runFeet * 3;
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
            `Order ${totalStuds} Wall Studs @ ${framingLengthFeet.toFixed(2)}'`,
            `Order ${totalPlateLf.toFixed(1)} LF Top and Bottom Plates`,
          ],
        };
      }

      const estimatedOpenings = Math.max(1, Math.round(runFeet / 20));
      const jackStuds = estimatedOpenings * 2;
      const kingStuds = estimatedOpenings * 2;
      const commonStuds = Math.max(0, totalStuds - jackStuds - kingStuds);
      const boardFeet = getBoardFeet(totalStuds, 2, 4, framingLengthFeet);
      const totalPlateLf = runFeet * 3;
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
          `Order ${commonStuds} - 2x4x${nominalLength} Common Studs`,
          `Order ${jackStuds} - 2x4x${nominalLength} Jack Studs`,
          `Order ${kingStuds} - 2x4x${nominalLength} King Studs`,
          `Order (${plates16ft}) 16' Plates`,
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
            `Order ${totalBlocks} ${blockSizeLabel}`,
            `Order ${mortarBags} Bags Type S Mortar (70–75 lb)`,
          ],
        };
      }

      const bags80 = Math.ceil(adjustedCubicYards * 45);
      const bags60 = Math.ceil(adjustedCubicYards * 60);
      const estimatedWeightLbs = adjustedCubicYards * 4050;
      const estimatedWeightTons = estimatedWeightLbs / 2000;
      return {
        primary: {
          label: "Total Yards",
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
          `Order ${adjustedCubicYards.toFixed(2)} Total Yards`,
          `Order ${bags80} Bags (80lb)`,
          `Order ${bags60} Bags (60lb)`,
          `Approx payload: ${Math.round(estimatedWeightLbs).toLocaleString()} lbs`,
        ],
      };
    }

    if (page.category === "roofing") {
      if (isSidingCalculator) {
        const pieceCoverageSqFt = clampValue(depthThickness, 1, 50);
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
            `Order ${sidingSquares.toFixed(2)} Siding Squares`,
            `Order ${pieces} Siding Pieces`,
          ],
        };
      }

      const baseRoofArea =
        supportsAreaToggle && !isAreaTotalMode
          ? dimensionsAreaSquareFeet
          : supportsAreaToggle && isAreaTotalMode
            ? clampValue(totalSquareFeetInput, 1, 100000000)
            : adjustedAreaSquareFeet / wasteMultiplier;
      const pitchRisePerTwelve = clampValue(depthThickness, 0, 24);
      const pitchMultiplier = Math.sqrt(
        1 + (pitchRisePerTwelve / 12) * (pitchRisePerTwelve / 12),
      );
      const pitchedArea = baseRoofArea * pitchMultiplier;
      const effectiveRoofArea = pitchedArea * wasteMultiplier;
      const squares = effectiveRoofArea / 100;
      const bundles = Math.ceil(squares * 3);
      const rollsUnderlayment = Math.max(1, Math.ceil(effectiveRoofArea / 400));
      return {
        primary: {
          label: "Total Squares",
          value: squares.toFixed(2),
          unit: "sq",
        },
        secondary: [
          {
            label: "Total Bundles",
            value: bundles.toString(),
            unit: "bundles",
          },
          {
            label: "Rolls of Underlayment",
            value: rollsUnderlayment.toString(),
            unit: "rolls",
          },
        ],
        materialList: [
          `Order ${squares.toFixed(2)} Roofing Squares (pitched & waste-adjusted)`,
          `Order ${bundles} Shingle Bundles`,
          `Order ${rollsUnderlayment} Rolls Synthetic Underlayment`,
        ],
      };
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
      materialList: [`Order ${materialQty} Material Units`],
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

  function handleSaveEstimate() {
    if (saveLocked) return;
    setSaveLocked(true);
    haptic(10);
    // 1-second button lock prevents double-tap duplicates
    setTimeout(() => setSaveLocked(false), 1000);
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
      },
      metadata: {
        title: page.title,
        calculatorLabel: page.heroKicker,
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        jobName:
          estimateJobName.trim() || estimateName.trim() || page.heroKicker,
      },
    }),
    [
      calculatorResults.materialList,
      calculatorResults.primary,
      calculatorResults.secondary,
      estimateClientName,
      estimateClientEmail,
      estimateJobAddress,
      estimateJobName,
      estimateName,
      page.canonicalPath,
      page.heroKicker,
      page.title,
    ],
  );

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
    if (!session?.user?.id) {
      setFinalizeError("Sign in to download a branded PDF.");
      setFinalizeSuccess(null);
      if (typeof Sentry.showReportDialog === "function") {
        Sentry.showReportDialog({
          user: { email: session?.user?.email ?? undefined },
        });
      }
      return;
    }
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
    setFinalizeSuccess("Estimate added to cart.");
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
      calculatorResults,
      contractorProfile.businessEmail,
      contractorProfile.businessName,
    ],
  );

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const message = error instanceof Error ? error.message : String(error);
        return (
          <main
            id="main-content"
            className="command-theme bg-[--color-bg] text-white min-h-[40vh] flex items-center justify-center p-6"
          >
            <div className="rounded-2xl border border-white/20 bg-black/25 p-6 max-w-lg text-center">
              <h2 className="text-lg font-bold text-white">Calculator error</h2>
              <p className="mt-2 text-sm text-[--color-nav-text]/90">
                Something went wrong. The exact inputs have been reported so we
                can fix it.
              </p>
              <p
                className="mt-2 text-xs text-[--color-nav-text]/60 font-mono truncate"
                title={message}
              >
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
        className="command-theme bg-[--color-bg] text-white flex min-h-screen flex-col"
      >
        {closeModal && (
          <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3 backdrop-blur-sm">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-orange-400">
                {page.heroKicker}
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {displayTitle(page.title)}
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Back
              </span>
            </button>
          </div>
        )}
        <section className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-5 lg:px-7 pb-14">
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
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 active:scale-[0.98] lg:hidden"
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
            <section className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition-colors lg:hidden">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-nav-text]/60"
                  aria-hidden
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trade tools"
                  className="h-10 w-full rounded-xl border border-slate-500 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
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

          <div className="overflow-hidden rounded-3xl border trim-nav-border bg-[--color-nav-bg] shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
            <div className="grid grid-cols-1 gap-2 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-2 lg:items-center bg-[radial-gradient(ellipse_at_top_right,rgba(30,35,45,0.95),#0a0a0b_70%),linear-gradient(180deg,#0d0f14_0%,#0A0A0B_100%)]">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[--color-orange-brand]/45 bg-[--color-orange-brand]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-500">
                  <HardHat className="h-3.5 w-3.5" aria-hidden />
                  {page.heroKicker}
                </div>

                {!closeModal ? (
                  <h1 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
                    {displayTitle(page.title)}
                  </h1>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-[--color-nav-text]/82 sm:text-base">
                  {page.description}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[--color-orange-brand]/30 bg-[--color-orange-brand]/10 px-3 py-1.5 text-sm text-[--color-orange-brand]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {page.localFocus}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openFinalizeModal}
                    className="inline-flex h-9 min-h-9 items-center gap-2 rounded-xl border-2 border-orange-400/80 bg-transparent px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-orange-400 hover:text-white active:scale-[0.98]"
                  >
                    <PenSquare className="h-3.5 w-3.5" aria-hidden />
                    Finalize &amp; Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmModalOpen(true)}
                    className="inline-flex h-9 min-h-9 items-center gap-2 rounded-xl border-2 border-orange-400/80 bg-transparent px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-orange-400 hover:text-white active:scale-[0.98]"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    Email Estimate
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEstimate}
                    disabled={saveLocked}
                    className={`inline-flex h-9 min-h-9 items-center gap-2 rounded-xl border-2 border-white/80 bg-transparent px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:border-orange-400 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${saveLocked ? "scale-95" : ""}`}
                  >
                    {saveLocked ? (
                      <>
                        <Check
                          className="h-3.5 w-3.5 text-emerald-400"
                          aria-hidden
                        />
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

                {primaryMaterialOrder ? (
                  <div className="mt-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-400">
                      Material Order
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {primaryMaterialOrder}
                    </p>
                  </div>
                ) : null}

                {isBusinessTaxSave && (
                  <div className="mt-3 grid gap-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] sm:text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Tax Region
                      </p>
                      <select
                        value={taxRegion}
                        onChange={(event) =>
                          setTaxRegion(
                            event.target.value === "NYS" ? "NYS" : "Other",
                          )
                        }
                        className="h-9 w-full rounded-lg border border-slate-600 bg-slate-950 px-2 text-xs text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
                      >
                        <option value="NYS">New York State (NYS)</option>
                        <option value="Other">Outside NYS / Custom</option>
                      </select>
                      <p className="text-[10px] leading-snug text-slate-400">
                        NYS region uses combined county + state sales tax;
                        otherwise enter your own blended tax rate below.
                      </p>
                      <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-orange-500"
                          checked={capitalImprovement}
                          onChange={(event) =>
                            setCapitalImprovement(event.target.checked)
                          }
                        />
                        Capital Improvement (ST-124)
                      </label>
                      <p className="text-[10px] leading-snug text-slate-400">
                        Capital improvements require NYS Form ST-124; no sales
                        tax charged to the client when on file.
                      </p>
                    </div>

                    {taxRegion === "NYS" && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                          className="h-9 w-full rounded-lg border border-slate-600 bg-slate-950 px-2 text-xs text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:text-sm"
                        >
                          {NYS_COUNTY_TAX_RATES.map((entry) => (
                            <option key={entry.county} value={entry.county}>
                              {entry.county} — {entry.combinedRate.toFixed(2)}%
                              {entry.mctd ? " (MCTD)" : ""}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] leading-snug text-slate-400">
                          County pick auto-fills your Tax Rate (%) input using
                          the latest combined NYS guidance.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 p-3 sm:p-4 bg-[--color-nav-bg]">
              <aside className="mb-3 hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition-colors lg:block">
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
                    className="h-10 w-full rounded-xl border border-slate-500 bg-slate-900 pl-9 pr-3 text-sm text-white tabular-nums tracking-tight outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
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
                        className="flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-slate-500 bg-slate-900 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[--color-nav-text] transition-all duration-200 ease-in-out hover:border-orange-400 hover:text-white active:scale-[0.98]"
                      >
                        <group.icon
                          className="h-4 w-4 text-[--color-orange-brand]"
                          aria-hidden
                        />
                        {group.label}
                        <ChevronDown
                          className="h-3 w-3 text-[--color-nav-text]/75"
                          aria-hidden
                        />
                      </button>

                      <div
                        className={`absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-slate-500 bg-[#0f1521] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-200 ease-in-out ${
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
                            className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition last:mb-0 ${
                              page.canonicalPath === module.href
                                ? "bg-[--color-orange-brand]/25 text-[--color-orange-brand]"
                                : "text-[--color-nav-text] hover:bg-white/7 hover:text-white"
                            }`}
                          >
                            <module.icon className="h-3.5 w-3.5" aria-hidden />
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

              <div className="grid gap-2 lg:grid-cols-[minmax(0,1.15fr)_340px]">
                <section
                  className={`rounded-2xl border border-slate-800 bg-slate-900/50 transition-colors ${effectiveProMode ? "p-3" : "p-3 sm:p-4"}`}
                >
                  <div className="flex justify-center">
                    <div
                      className={`rounded-full bg-orange-600/15 p-4 mb-3 flex items-center justify-center ${iconPulse ? "animate-pulse" : ""}`}
                    >
                      {(() => {
                        const IconComponent = getCategoryIcon(page);
                        return (
                          <IconComponent
                            size={52}
                            strokeWidth={1.5}
                            className="text-orange-600"
                            aria-hidden
                          />
                        );
                      })()}
                    </div>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                    Inputs
                  </h2>

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
                    const firstInputMin = financialCopy?.inputs[0].min ?? 1;
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
                    return (
                      <div className="mt-2 space-y-2">
                        {showFramingMaterialSelector && (
                          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                            Material Type
                            <select
                              value={selectedFramingMaterial}
                              onChange={(event) =>
                                setSelectedFramingMaterial(
                                  event.target.value as FramingMaterialKind,
                                )
                              }
                              className="h-11 rounded-xl border border-slate-500 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
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
                            {supportsAreaToggle && (
                              <UnitToggle
                                label="Area"
                                value={areaInputMode}
                                options={[
                                  { value: "dimensions", label: "Dimensions" },
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
                                    label: "Total Yards",
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
                                    label: "Running Lineal Feet",
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
                                <p className="text-[10px] leading-tight text-slate-500">
                                  One "Square" covers 100 square feet of area.
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {isConcreteTotalVolumeMode ? (
                            <ProInput
                              label={
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Yards"
                                  : "Total Cubic Feet"
                              }
                              subLabel={getInlineSubLabel(
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Yards"
                                  : "Total Cubic Feet",
                              )}
                              helpText={
                                volumeInputMode === "total-cu-yd"
                                  ? "Total Yards: (Length x Width x Depth) divided by 27."
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
                                label="Total Lineal Feet (LF)"
                                subLabel={getInlineSubLabel(
                                  "Total Lineal Feet (LF)",
                                )}
                                type="number"
                                min={1}
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
                              <ProInput
                                label="Stock Length"
                                subLabel={getInlineSubLabel("Stock Length")}
                                type="number"
                                min={4}
                                max={20}
                                value={String(depthThickness)}
                                onChange={(next) =>
                                  parseAndSet(next, setDepthThickness, 4, 20)
                                }
                                unitSuffix="ft"
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
                                min={1}
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
                          ) : isWallStudTotalMode ? (
                            <>
                              <ProInput
                                label={labels.first}
                                subLabel={getInlineSubLabel(labels.first)}
                                type="number"
                                min={1}
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
                                unitSuffix="ft"
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
                                unitSuffix="ft"
                              />
                            </>
                          ) : (
                            <>
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

                        <label className="block rounded-xl border border-white/15 bg-[--color-nav-bg] p-3">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[--color-nav-text]/80">
                            <span id="waste-factor-label">
                              {isTrimRoute ? "Miter Waste %" : "Waste Factor %"}
                            </span>
                            <span className="tabular-nums">{wasteFactor}%</span>
                          </div>
                          {!effectiveProMode && (
                            <p className="mb-2 text-[10px] leading-tight text-slate-400">
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
                            className="w-full accent-[--color-orange-brand]"
                          />
                        </label>
                      </div>
                    );
                  })()}
                </section>

                <aside
                  ref={resultsCardRef}
                  className="self-start pb-8 lg:sticky lg:top-24 lg:self-start lg:pb-0"
                >
                  <ProResult
                    primary={displayResults.primary}
                    secondary={displayResults.secondary}
                    primaryUnitDisplay={getPrimaryDisplayUnit(
                      displayResults.primary,
                    )}
                    localTip={effectiveProMode ? null : localTip}
                    materialList={displayResults.materialList}
                    onCopyOrder={handleCopyOrder}
                    onFinalize={openFinalizeModal}
                    finalizeLabel="Finalize & Send"
                    finalizeIcon={<PenSquare className="h-4 w-4" aria-hidden />}
                  />

                  <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-[--color-orange-brand] p-1.5 text-white">
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
                        className="min-h-9 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[--color-nav-text] transition-all duration-200 hover:border-[--color-orange-brand]/45 hover:text-white active:scale-[0.98]"
                      >
                        Optimize
                      </button>
                    </div>
                  </section>

                  {terminologyTerms.length ? (
                    <section className="mt-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[--color-orange-brand]">
                            Terminology
                          </p>
                          <p className="text-xs text-[--color-nav-text]">
                            Industry-standard inputs used in this calculator.
                          </p>
                        </div>
                        <Link
                          href={routes.glossary}
                          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white underline-offset-4 hover:text-[--color-orange-brand]"
                        >
                          Glossary
                        </Link>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {terminologyTerms.slice(0, 3).map((term) => (
                          <li
                            key={term.key}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                                {term.label}
                              </span>
                              {term.unit ? (
                                <span className="text-[10px] uppercase tracking-[0.12em] text-[--color-nav-text]">
                                  {term.unit}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-[--color-nav-text]">
                              {term.definition}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </aside>
              </div>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 transition-colors">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                  Trade Module Paths
                </h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {tradeNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-9 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[--color-nav-text] transition-all duration-200 hover:border-orange-500/50 hover:text-[--color-orange-brand] active:scale-[0.98]"
                    >
                      <item.icon
                        className="h-3.5 w-3.5 transition-all duration-200 group-hover:text-[--color-orange-brand]"
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
                        className="inline-flex items-center gap-2 text-sm text-[--color-nav-text]/85 transition-all duration-300 ease-in-out hover:text-white"
                      >
                        <ArrowRight
                          className="h-3.5 w-3.5 text-[--color-orange-brand]"
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

                <div className="mt-3 rounded-xl border border-[--color-orange-brand]/35 bg-[--color-orange-brand]/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                    Field Notes
                  </p>
                  <p className="mt-2 text-sm text-[--color-nav-text]/90">
                    Regional guides and contractor tips — 100% on-site, no
                    external links.
                  </p>
                  <Link
                    href={routes.fieldNotes}
                    className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[--color-orange-brand] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                  >
                    Open Field Notes
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </section>
            </div>
          </div>

          <nav
            className="fixed bottom-14 left-0 right-0 z-40 flex min-h-10 items-center justify-between border-t trim-nav-border bg-[--color-nav-bg]/95 px-4 py-1.5 backdrop-blur-xl lg:hidden"
            aria-label="Mobile tool actions"
          >
            <Link
              href={routes.commandCenter}
              className="inline-flex min-h-9 items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-[--color-nav-text] transition-all duration-200 active:scale-[0.98]"
            >
              <HardHat className="h-3.5 w-3.5" aria-hidden />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[--color-orange-brand] transition-all duration-200 active:scale-[0.98]"
            >
              <Menu className="h-3.5 w-3.5" aria-hidden />
              Modules
            </button>
            <button
              type="button"
              onClick={openFinalizeModal}
              className="inline-flex min-h-9 items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-[--color-nav-text] transition-all duration-200 active:scale-[0.98]"
            >
              <PenSquare className="h-3.5 w-3.5" aria-hidden />
              Finalize &amp; Send
            </button>
          </nav>
        </section>

        <div className="fixed bottom-0 left-0 w-full z-40 border-t border-slate-800 bg-slate-950 px-4 py-3 pb-safe lg:hidden">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[--color-nav-text]/80">
                {calculatorResults.primary.label}
              </p>
              <p className="truncate text-lg font-black tabular-nums tracking-tight text-orange-500">
                {calculatorResults.primary.value}{" "}
                <span className="text-white">
                  {getPrimaryDisplayUnit(calculatorResults.primary)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={openFinalizeModal}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border-2 border-orange-400/80 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
            >
              <PenSquare className="h-3.5 w-3.5" aria-hidden />
              Finalize &amp; Send
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
          <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Close finalize estimate dialog"
              onClick={() =>
                finalizeBusy ? undefined : setFinalizeOpen(false)
              }
            />
            <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-800 bg-slate-950 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Finalize &amp; Send
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Download or send for signature
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Create the server PDF or email the customer a signature link.
              </p>

              <div className="mt-4 grid gap-3">
                <label className="text-sm text-slate-300">
                  Estimate Name
                  <input
                    value={estimateName}
                    onChange={(event) => setEstimateName(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Client Name
                  <input
                    value={estimateClientName}
                    onChange={(event) =>
                      setEstimateClientName(event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Client Email
                  <input
                    value={estimateClientEmail}
                    onChange={(event) =>
                      setEstimateClientEmail(event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                    type="email"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Job Name
                  <input
                    value={estimateJobName}
                    onChange={(event) => setEstimateJobName(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Job Site Address
                  <input
                    value={estimateJobAddress}
                    onChange={(event) =>
                      setEstimateJobAddress(event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-500 bg-slate-900 px-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </label>
              </div>

              {primaryMaterialOrder ? (
                <div className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-400">
                    First Material Order
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {primaryMaterialOrder}
                  </p>
                </div>
              ) : null}

              {createdSignUrl ? (
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Sign Link
                  </p>
                  <p className="mt-1 break-all text-sm text-white">
                    {createdSignUrl}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopySignUrl}
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-orange-500/40 px-3 text-sm font-semibold text-orange-400"
                    >
                      Copy Link
                    </button>
                    <a
                      href={createdSignUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border-2 border-white/80 px-3 text-sm font-semibold text-white"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ) : null}

              {!canUseSignAndReturn ? (
                <p className="mt-4 text-xs text-slate-500">
                  Sign & Return only appears for signed-in users with Pro Mode
                  enabled.
                </p>
              ) : null}

              <div className="mt-4 min-h-[56px] space-y-2">
                {finalizeError ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {finalizeError}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof Sentry.showReportDialog === "function") {
                          Sentry.showReportDialog();
                        }
                      }}
                      className="ml-1 text-xs font-medium underline underline-offset-2 text-red-100 hover:text-red-50"
                    >
                      Report this issue
                    </button>
                  </p>
                ) : null}
                {finalizeSuccess ? (
                  <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {finalizeSuccess}
                  </p>
                ) : null}
              </div>

              <div
                className={`mt-5 grid gap-2 ${
                  canUseSignAndReturn ? "sm:grid-cols-3" : "sm:grid-cols-2"
                }`}
              >
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={finalizeBusy !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:border-orange-500 disabled:opacity-60"
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  {finalizeBusy === "pdf" ? "Generating..." : "Download PDF"}
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={finalizeBusy !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:border-orange-500 disabled:opacity-60"
                >
                  Add to Cart
                </button>
                {canUseSignAndReturn ? (
                  <button
                    type="button"
                    onClick={handleSendForSignature}
                    disabled={finalizeBusy !== null}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
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

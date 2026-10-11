import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrickWall,
  Building2,
  Calculator,
  CircleDollarSign,
  ClipboardList,
  Fence,
  FileDown,
  FileSpreadsheet,
  Gauge,
  Hammer,
  Layers,
  Layers3,
  Layout,
  ShieldCheck,
  SlidersHorizontal,
  SquareStack,
  Thermometer,
  ThermometerSnowflake,
  Timer,
  Tractor,
  Trees,
  Triangle,
  Wrench,
} from "lucide-react";

export type TradeModule = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

export type TradeModuleGroup = {
  label: string;
  icon: LucideIcon;
  modules: TradeModule[];
};

export const tradeModuleGroups: TradeModuleGroup[] = [
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

export const PRECOMPUTED_TRADE_MODULE_GROUPS = tradeModuleGroups.map((group) => ({
  ...group,
  modules: group.modules.map((module) => ({
    ...module,
    searchKey: `${group.label} ${module.label}`.toLowerCase(),
  })),
}));

export function filterTradeModuleGroups(
  groups: typeof PRECOMPUTED_TRADE_MODULE_GROUPS,
  normalizedSearch: string,
) {
  if (!normalizedSearch) return tradeModuleGroups;
  return groups
    .map((group) => ({
      ...group,
      modules: group.modules.filter((module) =>
        module.searchKey.includes(normalizedSearch),
      ),
    }))
    .filter((group) => group.modules.length > 0);
}

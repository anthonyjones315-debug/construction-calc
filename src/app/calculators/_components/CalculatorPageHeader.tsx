import type { LucideIcon } from "lucide-react";
import {
  BrickWall,
  Hammer,
  Triangle,
  Thermometer,
  Layout,
  BarChart3,
  Trees,
  Fence,
} from "lucide-react";
import type { TradePageDefinition } from "../_lib/trade-pages";

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

function getBackgroundImage(category: string) {
  switch (category) {
    case "framing": return "/images/calc/trade_framing.png";
    case "concrete": return "/images/calc/trade_concrete.png";
    case "roofing": return "/images/calc/trade_roofing.png";
    case "mechanical": return "/images/calc/trade_mechanical.png";
    case "business": return "/images/calc/trade_business.png";
    case "management": return "/images/calc/trade_business.png";
    case "finish": return "/images/calc/trade_finish.png";
    case "interior": return "/images/calc/trade_finish.png";
    case "landscape": return "/images/calc/trade_landscape.png";
    case "outdoor": return "/images/calc/trade_outdoor.png";
    case "insulation": return "/images/calc/trade_insulation.png";
    default: return "/images/calc/trade_default.png";
  }
}

export function CalculatorPageHeader({ page }: { page: TradePageDefinition }) {
  const Icon = TILE_ICON_MAP[page.category] || Hammer;
  const bgImage = getBackgroundImage(page.category);

  return (
    <div className="relative border-b border-[--color-border] bg-slate-950 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-25 bg-cover bg-center bg-no-repeat contrast-125 saturate-150"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay for legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/20" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-4 sm:gap-6 px-4 py-8 sm:px-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-base/20 border border-blue-base/30 backdrop-blur-md shadow-inner shadow-blue-base/10">
          <Icon className="h-7 w-7 text-blue-400 drop-shadow-md" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 drop-shadow-md">
            {page.heroKicker}
          </p>
          <h1 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl drop-shadow-md mt-1">
            {page.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300 drop-shadow-md max-w-2xl font-medium">
            {page.description}
          </p>
        </div>

        <aside className="hidden max-w-[280px] text-xs text-slate-300 lg:block bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="flex items-center gap-2 font-bold uppercase tracking-[0.16em] text-blue-400 text-[10px] drop-shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Pro Tip
          </p>
          <p className="mt-2 leading-relaxed font-medium">{page.proTip}</p>
        </aside>
      </div>
    </div>
  );
}

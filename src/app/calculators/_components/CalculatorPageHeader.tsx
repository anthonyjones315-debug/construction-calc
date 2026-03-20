import type { LucideIcon } from "lucide-react";
import {
  BrickWall,
  Hammer,
  Triangle,
  Thermometer,
  Layout,
  BarChart3,
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
};

export function CalculatorPageHeader({ page }: { page: TradePageDefinition }) {
  const Icon = TILE_ICON_MAP[page.category];

  return (
    <div className="border-b border-[--color-border] bg-[--color-surface]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-200">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
            {page.heroKicker}
          </p>
          <h1 className="font-display text-xl font-black leading-tight text-slate-900 sm:text-2xl">
            {page.title}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
            {page.description}
          </p>
        </div>

        <aside className="hidden max-w-[200px] text-xs text-slate-500 lg:block">
          <p className="font-bold uppercase tracking-[0.16em] text-orange-600 text-[10px]">
            Pro Tip
          </p>
          <p className="mt-1 line-clamp-3 leading-relaxed">{page.proTip}</p>
        </aside>
      </div>
    </div>
  );
}

import { TradeLanding } from "@/app/calculators/_components/TradeLanding";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("insulation");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function InsulationCategoryPage() {
  return <TradeLanding page={page} />;
}

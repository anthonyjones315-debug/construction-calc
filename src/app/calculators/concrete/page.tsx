import { TradeLanding } from "@/app/calculators/_components/TradeLanding";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("concrete");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ConcreteCategoryPage() {
  return <TradeLanding page={page} />;
}

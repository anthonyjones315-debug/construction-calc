import { TradeLanding } from "@/app/calculators/_components/TradeLanding";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("mechanical");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function MechanicalCategoryPage() {
  return <TradeLanding page={page} />;
}

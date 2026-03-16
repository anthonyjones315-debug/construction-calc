import { TradeLanding } from "@/app/calculators/_components/TradeLanding";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("business");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function BusinessCategoryPage() {
  return <TradeLanding page={page} />;
}

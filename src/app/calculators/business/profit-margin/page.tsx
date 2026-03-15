import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("business-profit-margin");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function BusinessProfitMarginPage() {
  return <CalculatorPage page={page} />;
}

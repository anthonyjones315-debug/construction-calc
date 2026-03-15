import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("business-labor-rate");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function BusinessLaborRatePage() {
  return <CalculatorPage page={page} />;
}

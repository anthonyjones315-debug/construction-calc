import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("business-tax-save");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function BusinessTaxSavePage() {
  return <CalculatorPage page={page} />;
}

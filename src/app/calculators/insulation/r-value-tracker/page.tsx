import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("insulation-r-value-tracker");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function InsulationRValueTrackerPage() {
  return <CalculatorPage page={page} />;
}

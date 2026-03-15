import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("insulation-duct-sizing");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function InsulationDuctSizingPage() {
  return <CalculatorPage page={page} />;
}

import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("interior-flooring-waste");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function InteriorFlooringWastePage() {
  return <CalculatorPage page={page} />;
}

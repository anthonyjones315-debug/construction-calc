import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("mechanical-btu-estimator");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function MechanicalBtuEstimatorPage() {
  return <CalculatorPage page={page} />;
}

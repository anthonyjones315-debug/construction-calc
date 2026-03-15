import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("mechanical-ventilation-calc");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function MechanicalVentilationCalcPage() {
  return <CalculatorPage page={page} />;
}

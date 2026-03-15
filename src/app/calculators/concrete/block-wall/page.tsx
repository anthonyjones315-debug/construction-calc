import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("concrete-block-wall");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ConcreteBlockWallPage() {
  return <CalculatorPage page={page} />;
}

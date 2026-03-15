import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("concrete-slab");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ConcreteSlabPage() {
  return <CalculatorPage page={page} />;
}

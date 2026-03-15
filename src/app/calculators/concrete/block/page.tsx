import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("concrete-block");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ConcreteBlockPage() {
  return <CalculatorPage page={page} />;
}

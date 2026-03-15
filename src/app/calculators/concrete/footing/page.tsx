import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("concrete-footing");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ConcreteFootingPage() {
  return <CalculatorPage page={page} />;
}

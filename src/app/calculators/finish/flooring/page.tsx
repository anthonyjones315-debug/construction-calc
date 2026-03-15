import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("finish-flooring");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function FinishFlooringPage() {
  return <CalculatorPage page={page} />;
}

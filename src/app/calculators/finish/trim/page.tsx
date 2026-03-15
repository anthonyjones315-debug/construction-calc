import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("finish-trim");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function FinishTrimPage() {
  return <CalculatorPage page={page} />;
}

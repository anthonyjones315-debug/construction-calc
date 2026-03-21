import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("landscape-gravel");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function GravelCalculatorPage() {
  return <CalculatorPage page={page} />;
}

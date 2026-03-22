import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("landscape-sod");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function SodCalculatorPage() {
  return <CalculatorPage page={page} />;
}

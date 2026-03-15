import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("management-margin");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ManagementMarginPage() {
  return <CalculatorPage page={page} />;
}

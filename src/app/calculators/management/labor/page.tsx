import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("management-labor");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ManagementLaborPage() {
  return <CalculatorPage page={page} />;
}

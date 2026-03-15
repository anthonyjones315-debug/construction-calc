import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("management-leads");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function ManagementLeadsPage() {
  return <CalculatorPage page={page} />;
}

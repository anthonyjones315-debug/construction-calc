import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("finish-drywall-sheets");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function FinishDrywallSheetsPage() {
  return <CalculatorPage page={page} />;
}

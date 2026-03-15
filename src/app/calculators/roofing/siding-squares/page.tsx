import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("roofing-siding-squares");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function RoofingSidingSquaresPage() {
  return <CalculatorPage page={page} />;
}

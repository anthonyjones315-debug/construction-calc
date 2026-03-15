import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("roofing-shingle-bundles");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function RoofingShingleBundlesPage() {
  return <CalculatorPage page={page} />;
}

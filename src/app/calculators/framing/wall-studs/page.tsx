import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePage, getTradePageMetadata } from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("framing-wall-studs");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function FramingWallStudsPage() {
  return <CalculatorPage page={page} />;
}

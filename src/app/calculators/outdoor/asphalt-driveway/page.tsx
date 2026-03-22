import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import {
  getTradePage,
  getTradePageMetadata,
} from "@/app/calculators/_lib/trade-pages";

const page = getTradePage("outdoor-asphalt-driveway");

export function generateMetadata() {
  return getTradePageMetadata(page);
}

export default function AsphaltDrivewayCalculatorPage() {
  return <CalculatorPage page={page} />;
}

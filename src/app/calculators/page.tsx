import type { Metadata } from "next";
import { getPageMetadata } from "@/seo";
import { CalculatorsDirectoryClient } from "./CalculatorsDirectoryClient";

export const metadata: Metadata = getPageMetadata({
  title: "Construction Calculators for Working Contractors | Pro Construction Calc",
  description:
    "Field-tested construction calculators for concrete, framing, roofing, insulation, flooring, and more. Built for working contractors; clear units and results you can use on-site.",
  path: "/calculators",
});

export default function CalculatorsLandingPage() {
  return <CalculatorsDirectoryClient />;
}

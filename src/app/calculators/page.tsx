import type { Metadata } from "next";
import { getPageMetadata } from "@/seo";
import { CalculatorsDirectoryClient } from "./CalculatorsDirectoryClient";

export const metadata: Metadata = getPageMetadata({
  title: "Construction Calculators for Contractors | Pro Construction Calc",
  description:
    "Concrete, framing, roofing, insulation, flooring, and more — field-tested calculators that give you real numbers you can use on the job or in a quote.",
  path: "/calculators",
});

export default function CalculatorsLandingPage() {
  return <CalculatorsDirectoryClient />;
}

import type { Metadata } from "next";
import { CalculatorsDirectoryClient } from "./CalculatorsDirectoryClient";

export const metadata: Metadata = {
  title: "Construction Calculators for Working Contractors | Pro Construction Calc",
  description:
    "Field-tested construction calculators for concrete, framing, roofing, insulation, flooring, and more. Built for working contractors; clear units and results you can use on-site.",
  alternates: { canonical: "https://proconstructioncalc.com/calculators" },
  openGraph: {
  title: "Construction Calculators for Contractors | Pro Construction Calc",
  description:
      "Concrete, framing, roofing, insulation, flooring, and labor calculators tuned for jobsite estimating.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CalculatorsLandingPage() {
  return <CalculatorsDirectoryClient />;
}

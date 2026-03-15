import type { Metadata } from "next";
import { CalculatorsDirectoryClient } from "./CalculatorsDirectoryClient";

export const metadata: Metadata = {
  title: "Free Construction Calculators — Concrete, Framing, Roofing & More | Pro Construction Calc",
  description:
    "Free online construction calculators for concrete, framing, roofing, insulation, flooring, and more. Instant results for contractors and DIYers.",
  alternates: { canonical: "https://proconstructioncalc.com/calculators" },
  openGraph: {
    title: "Free Construction Calculators | Pro Construction Calc",
    description:
      "Concrete, framing, roofing, insulation, flooring, and labor calculators — all free.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CalculatorsLandingPage() {
  return <CalculatorsDirectoryClient />;
}

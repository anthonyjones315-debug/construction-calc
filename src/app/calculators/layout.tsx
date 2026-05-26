import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLD, getPageMetadata, getWebAppSchema } from "@/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = getPageMetadata({
  title:
    "Free Construction Calculators — Concrete, Framing, Roofing & More | Pro Construction Calc",
  description:
    "Free online construction calculators for concrete, framing, roofing, insulation, flooring, and more. Instant results for contractors and DIYers.",
  path: "/calculators",
});

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light public-page">
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-50/50" />}>
          {children}
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

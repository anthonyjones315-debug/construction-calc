import type { Metadata } from "next";
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
    <div className="command-theme flex min-h-screen flex-col bg-slate-950">
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <div className="min-w-0 flex-1">{children}</div>
      <Footer />
    </div>
  );
}

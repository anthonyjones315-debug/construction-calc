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
    <div className="command-theme flex min-h-dvh flex-col bg-[--color-bg] lg:grid lg:grid-rows-[auto_1fr_auto]">
      <JsonLD schema={getWebAppSchema()} />
      <Header />
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}

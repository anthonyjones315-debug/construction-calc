import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSafeEstimate } from "@/lib/dal/estimates";
import { EstimateDetail } from "./EstimateDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EstimateDetailPage({ params }: Props) {
  const { id } = await params;
  const estimate = await getSafeEstimate(id);

  if (!estimate) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <EstimateDetail estimate={estimate} />
      </main>
      <Footer />
    </div>
  );
}

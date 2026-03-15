import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getFinancialDataForUser } from "@/components/financial/FinancialDataFetcher";
import { getSavedEstimatesForUser } from "./data";
import { SavedContent } from "./SavedContent";

export default async function SavedPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const isAuthenticated = typeof userId === "string" && userId.length > 0;
  const [serverFinancialData, initialEstimates] = isAuthenticated
    ? await Promise.all([
        getFinancialDataForUser(userId),
        getSavedEstimatesForUser(userId),
      ])
    : [
        {
          billed: { count: 0, total: 0 },
          unbilled: { count: 0, total: 0 },
        },
        [],
      ];

  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <SavedContent
          serverFinancialData={serverFinancialData}
          initialEstimates={initialEstimates}
          isAuthenticated={isAuthenticated}
        />
      </main>
      <Footer />
    </div>
  );
}

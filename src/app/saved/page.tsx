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
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-slate-950 text-slate-100">
      <Header />
      <main className="row-start-2 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6 sm:px-6">
          <SavedContent
            serverFinancialData={serverFinancialData}
            initialEstimates={initialEstimates}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

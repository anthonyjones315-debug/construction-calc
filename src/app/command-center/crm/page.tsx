import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getClients } from "@/lib/dal/clients";
import { CrmDashboardClient } from "./CrmDashboardClient";
import { routes } from "@routes";

export default async function CrmPage() {
  let session;
  try {
    session = await auth();
  } catch {
    // Auth might throw if it's struggling but usually returns null
  }

  if (!session?.user?.id) {
    redirect(routes.auth.signIn);
  }

  const initialClients = await getClients();

  return (
    <div className="min-h-dvh flex flex-col bg-[#f6f4ef] text-slate-900">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <CrmDashboardClient initialClients={initialClients} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

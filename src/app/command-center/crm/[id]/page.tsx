import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getClient } from "@/lib/dal/clients";
import { createServerClient } from "@/lib/supabase/server";
import { ClientDetailClient } from "./ClientDetailClient";
import { routes } from "@routes";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let session;
  try {
    session = await auth();
  } catch {}

  const userId = session?.user?.id;
  if (!userId) {
    redirect(routes.auth.signIn);
  }

  const client = await getClient(id);
  if (!client) {
    redirect(routes.crm);
  }

  const db = createServerClient();
  const { data: estimates } = await db
    .from("saved_estimates")
    .select("id, name, status, total_cost, updated_at")
    .eq("client_id", id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-dvh flex flex-col bg-[#f6f4ef] text-slate-900">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <ClientDetailClient client={client} estimates={estimates || []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

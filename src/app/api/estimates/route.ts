import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForUserId,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

const SELECT =
  "id, name, calculator_id, inputs, total_cost, status, budget_items, created_at, updated_at, results, client_name, job_site_address";

function isPrerenderHeadersAccessError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { message?: string; digest?: string };
  const message = maybeError.message?.toLowerCase() ?? "";
  const digest = maybeError.digest ?? "";

  return (
    digest === "HANGING_PROMISE_REJECTION" ||
    (message.includes("during prerendering") &&
      message.includes("headers()") &&
      message.includes("rejects"))
  );
}

export async function GET() {
  noStore();

  let session: Session | null;
  try {
    session = await auth();
  } catch (error) {
    if (isPrerenderHeadersAccessError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/estimates auth error:", error);
    return NextResponse.json(
      { error: "Failed to load estimates." },
      { status: 500 },
    );
  }

  try {
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = createServerClient();
    const businessContext = await getBusinessContextForUserId(
      db,
      session.user.id,
    );
    if (!businessContext) {
      return NextResponse.json({ estimates: [] });
    }

    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);

    const { data, error } = await db
      .from("saved_estimates")
      .select(SELECT)
      .eq(tenantColumn, tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/estimates DB error:", error.message);
      return NextResponse.json(
        { error: "Failed to load estimates." },
        { status: 500 },
      );
    }

    return NextResponse.json({ estimates: data ?? [] });
  } catch (error) {
    console.error("GET /api/estimates error:", error);
    return NextResponse.json(
      { error: "Failed to load estimates." },
      { status: 500 },
    );
  }
}

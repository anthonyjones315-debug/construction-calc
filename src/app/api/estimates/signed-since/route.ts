import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

/**
 * Returns estimates that reached SIGNED/Approved after `since` (ISO timestamp).
 * Used for dashboard notifications and post-login “returned signed” prompts.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const since =
      request.nextUrl.searchParams.get("since") ?? "1970-01-01T00:00:00.000Z";

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);

    const { data, error } = await db
      .from("saved_estimates")
      .select("id, name, client_name, updated_at")
      .eq(tenantColumn, tenantId)
      .in("status", ["SIGNED", "Approved"])
      .gte("updated_at", since)
      .order("updated_at", { ascending: false })
      .limit(25);

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const estimates = data ?? [];
    return NextResponse.json({
      count: estimates.length,
      estimates,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

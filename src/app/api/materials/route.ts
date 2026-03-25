import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  assertNoBusinessIdOverride,
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantColumn = getTenantScopeColumn(businessContext);
    const tenantId = getTenantScopeId(businessContext);
    const { data, error } = await db
      .from("user_materials")
      .select("*")
      .eq(tenantColumn, tenantId)
      .order("category")
      .order("material_name");

    if (error) {
      // Gracefully handle local dev environments missing the user_materials table
      const errMsg = error?.message?.toLowerCase?.() ?? "";
      if (
        error?.code === "42P01" ||
        errMsg.includes("could not find the table") ||
        errMsg.includes("user_materials")
      ) {
        return NextResponse.json({ data: [] });
      }
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    try {
      assertNoBusinessIdOverride(
        body && typeof body === "object"
          ? (body as Record<string, unknown>).business_id
          : undefined,
        businessContext,
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Forbidden" },
        { status: 403 },
      );
    }
    const insertPayload: Record<string, unknown> = {
      user_id: session.user.id,
      material_name: String(body.material_name ?? "").slice(0, 200),
      category: String(body.category ?? "Other").slice(0, 50),
      unit_type: String(body.unit_type ?? "each").slice(0, 50),
      unit_cost: Number(body.unit_cost) || 0,
    };
    if (!businessContext.usesLegacyUserScope) {
      insertPayload.business_id = businessContext.businessId;
    }
    const { data, error } = await db
      .from("user_materials")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    revalidateTag("products", "max");
    return NextResponse.json({ data });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

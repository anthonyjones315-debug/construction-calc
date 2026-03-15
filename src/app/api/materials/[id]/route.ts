import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);
  const { error } = await db
    .from("user_materials")
    .update({
      material_name: String(body.material_name ?? "").slice(0, 200),
      category: String(body.category ?? "Other").slice(0, 50),
      unit_type: String(body.unit_type ?? "each").slice(0, 50),
      unit_cost: Number(body.unit_cost) || 0,
    })
    .eq("id", id)
    .eq(tenantColumn, tenantId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products", "max");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  if (!businessContext.canDeleteBusinessData) {
    return NextResponse.json(
      { error: "Only business owners or admins can delete shared materials." },
      { status: 403 },
    );
  }
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);
  const { error } = await db
    .from("user_materials")
    .delete()
    .eq("id", id)
    .eq(tenantColumn, tenantId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products", "max");
  return NextResponse.json({ ok: true });
}

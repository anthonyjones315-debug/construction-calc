import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        profile: {
          businessName: null,
          logoUrl: null,
          businessAddress: null,
          businessPhone: null,
          businessEmail: null,
        },
      },
      { status: 200 },
    );
  }

  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);
  const { data: userData, error: userError } = await db
    .from("users")
    .select("name, image, email")
    .eq("id", session.user.id)
    .single();

  if (userError) {
    console.error("contractor-profile user GET error:", userError.message);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 },
    );
  }

  const { data: businessData, error: businessError } = await db
    .from("business_profiles")
    .select("business_name, business_phone, business_email, business_address")
    .eq(tenantColumn, tenantId)
    .single();

  if (businessError && businessError.code !== "PGRST116") {
    console.error(
      "contractor-profile business GET error:",
      businessError.message,
    );
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    profile: {
      businessName: businessData?.business_name ?? userData?.name ?? null,
      logoUrl: userData?.image ?? null,
      businessAddress: businessData?.business_address ?? null,
      businessPhone: businessData?.business_phone ?? null,
      businessEmail:
        businessData?.business_email ??
        userData?.email ??
        session.user.email ??
        null,
    },
  });
}

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";

export async function GET() {
  try {
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
      Sentry.captureException(userError);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const { data: businessData, error: businessError } = await db
      .from("business_profiles")
      .select(
        "business_name, business_phone, business_email, business_address, logo_url",
      )
      .eq(tenantColumn, tenantId)
      .single();

    if (businessError && businessError.code !== "PGRST116") {
      Sentry.captureException(businessError);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: {
        businessName: businessData?.business_name ?? userData?.name ?? null,
        companyName: businessData?.business_name ?? userData?.name ?? null,
        logoUrl: businessData?.logo_url ?? userData?.image ?? null,
        businessAddress: businessData?.business_address ?? null,
        businessPhone: businessData?.business_phone ?? null,
        businessEmail:
          businessData?.business_email ??
          userData?.email ??
          session.user.email ??
          null,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

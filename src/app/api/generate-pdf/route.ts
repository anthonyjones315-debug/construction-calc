import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { finalizeEstimateSchema } from "@/lib/estimates/finalize";
import { renderEstimatePdfHtml } from "@/lib/pdf/server-estimate-html";
import { renderHtmlToPdfBuffer } from "@/lib/pdf/puppeteer";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { getPostHogClient } from "@/lib/posthog-server";

async function resolvePdfBranding(
  payload: ReturnType<typeof finalizeEstimateSchema.parse>,
) {
  const db = createServerClient();
  const session = await auth();
  const owner =
    payload.inputs?.owner && typeof payload.inputs.owner === "object"
      ? (payload.inputs.owner as Record<string, unknown>)
      : {};
  const fallbackName =
    typeof owner.user_name === "string" && owner.user_name.trim()
      ? owner.user_name.trim()
      : session?.user?.name?.trim() || null;
  const fallbackEmail =
    typeof owner.user_email === "string" && owner.user_email.trim()
      ? owner.user_email.trim()
      : session?.user?.email?.trim() || null;

  let profile:
    | {
        business_name?: string | null;
        business_email?: string | null;
        business_phone?: string | null;
        logo_url?: string | null;
      }
    | null = null;

  if (session?.user?.id) {
    const businessContext = await getBusinessContextForSession(db, session);
    const { data } = await db
      .from("business_profiles")
      .select("business_name, business_email, business_phone, logo_url")
      .eq(getTenantScopeColumn(businessContext), getTenantScopeId(businessContext))
      .maybeSingle();
    profile = data;
  } else if (typeof owner.user_id === "string" && owner.user_id.trim()) {
    const { data } = await db
      .from("business_profiles")
      .select("business_name, business_email, business_phone, logo_url")
      .eq("user_id", owner.user_id.trim())
      .maybeSingle();
    profile = data;
  }

  return {
    brandName:
      profile?.business_name?.trim() || fallbackName || "Pro Construction Calc",
    contractorEmail: profile?.business_email?.trim() || fallbackEmail || null,
    contractorPhone: profile?.business_phone?.trim() || null,
    logoUrl: profile?.logo_url?.trim() || null,
  };
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = finalizeEstimateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid estimate payload." },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const session = await auth();
  const branding = await resolvePdfBranding(payload);
  const html = await renderEstimatePdfHtml({
    estimateName: payload.name,
    jobName: payload.metadata.jobName ?? payload.name,
    calculatorLabel: payload.metadata.calculatorLabel,
    generatedAt: payload.metadata.generatedAt,
    brandName: branding.brandName,
    contractorEmail: branding.contractorEmail,
    contractorPhone: branding.contractorPhone,
    logoUrl: branding.logoUrl,
    results: payload.results.map((result) => ({
      label: result.label,
      value: result.value,
      unit: result.unit,
    })),
    materialList: payload.material_list,
    signature: payload.signature
      ? {
          signerName: payload.signature.signerName ?? null,
          signerEmail: payload.signature.signerEmail ?? null,
          signatureDataUrl: payload.signature.signatureDataUrl ?? null,
          signedAt: payload.signature.signedAt ?? null,
        }
      : undefined,
  });
  const buffer = await renderHtmlToPdfBuffer(html);

  const ownerUserId =
    session?.user?.id ??
    (typeof payload.inputs?.owner === "object" && payload.inputs.owner !== null
      ? (payload.inputs.owner as Record<string, unknown>).user_id
      : null);

  if (typeof ownerUserId === "string" && ownerUserId) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: ownerUserId,
      event: "pdf_generated",
      properties: { calculator_id: payload.calculator_id },
    });
    await posthog.shutdown();
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(payload.name, "estimate")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

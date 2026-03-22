import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { finalizeEstimateSchema } from "@/lib/estimates/finalize";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { getPostHogClient } from "@/lib/posthog-server";
import * as Sentry from "@sentry/nextjs";
import { generateInvoiceHtml } from "@/lib/reports/invoice-template";
import type { AuthSession } from "@/lib/auth/session";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

/** Requires `BROWSERLESS_API_TOKEN` in env (Browserless.io). Without it, POST returns 503 "PDF service not configured." */

async function resolvePdfBranding(
  payload: ReturnType<typeof finalizeEstimateSchema.parse>,
  session: NonNullable<AuthSession>,
) {
  const db = createServerClient();
  const fallbackName = session.user?.name?.trim() || null;
  const fallbackEmail = session.user?.email?.trim() || null;

  let profile: {
    business_name?: string | null;
    business_email?: string | null;
    business_phone?: string | null;
    logo_url?: string | null;
  } | null = null;

  const businessContext = await getBusinessContextForSession(db, session);
  const { data } = await db
    .from("business_profiles")
    .select("business_name, business_email, business_phone, logo_url")
    .eq(
      getTenantScopeColumn(businessContext),
      getTenantScopeId(businessContext),
    )
    .maybeSingle();
  profile = data;

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
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = finalizeEstimateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid estimate payload." },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pdfRl = checkMemoryRateLimit(
      "generate-pdf",
      session.user.id,
      35,
      3600_000,
    );
    if (!pdfRl.ok) {
      return NextResponse.json(
        { error: "PDF generation limit reached. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(pdfRl.retryAfterSeconds) },
        },
      );
    }

    const branding = await resolvePdfBranding(payload, session);
    const browserlessToken = process.env.BROWSERLESS_API_TOKEN;
    if (!browserlessToken) {
      return NextResponse.json(
        { error: "PDF service not configured." },
        { status: 503 },
      );
    }

    const html = generateInvoiceHtml({
      payload,
      contractorName: branding.brandName,
      contractorContact: branding.contractorPhone,
      contractorLogoUrl: branding.logoUrl,
    });

    const browserlessResponse = await fetch(
      `https://production-sfo.browserless.io/pdf?token=${browserlessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          options: {
            printBackground: true,
            format: "Letter",
            margin: {
              top: "0.4in",
              bottom: "0.4in",
              left: "0.4in",
              right: "0.4in",
            },
            // Improve quality for glass effects and gradient rendering
            preferCSSPageSize: true,
            omitBackground: false,
            scale: 0.95, // Slight scaling to improve sharpness
          },
        }),
      },
    );

    if (!browserlessResponse.ok) {
      const errorText = await browserlessResponse.text().catch(() => "");
      Sentry.captureMessage("Browserless PDF error", {
        extra: { status: browserlessResponse.status, body: errorText },
      });
      return NextResponse.json(
        { error: "Failed to generate PDF." },
        { status: 502 },
      );
    }

    const pdfBuffer = await browserlessResponse.arrayBuffer();

    // Fire analytics without blocking the response
    if (session.user.id) {
      try {
        const posthog = getPostHogClient();
        posthog.capture({
          distinctId: session.user.id,
          event: "pdf_generated",
          properties: { calculator_id: payload.calculator_id },
        });
        posthog.shutdown().catch(() => {});
      } catch {}
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(payload.name, "estimate")}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const selectedCounty =
      typeof payload.inputs?.selected_county === "string"
        ? payload.inputs.selected_county
        : Array.isArray(payload.inputs?.selected_county)
          ? payload.inputs?.selected_county?.[0]
          : "unknown";
    Sentry.captureException(error, {
      tags: { selected_county: selectedCounty ?? "unknown" },
      extra: { calculator_id: payload.calculator_id },
    });
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}

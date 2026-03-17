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

function generateInvoiceHTML(
  payload: ReturnType<typeof finalizeEstimateSchema.parse>,
  contractorName: string,
  contractorContact: string | null,
  contractorLogoUrl: string | null,
) {
  const safeContractorName = contractorName || "Your Contractor";
  const contactLine =
    contractorContact && contractorContact.trim().length > 0
      ? contractorContact.trim()
      : "";
  const jobName =
    typeof payload.metadata.jobName === "string" && payload.metadata.jobName
      ? payload.metadata.jobName
      : payload.name;
  const calculatorLabel = payload.metadata.calculatorLabel;
  const generatedAt = payload.metadata.generatedAt;
  const clientName = payload.client_name ?? "";
  const jobAddress = payload.job_site_address ?? "";
  const materialList =
    Array.isArray(payload.material_list) && payload.material_list.length
      ? payload.material_list
      : [];

  const primaryResult = payload.results[0];

  const dollars =
    typeof payload.total_cost === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(payload.total_cost)
      : null;

  const resultsRows = payload.results
    .map(
      (row) => `
        <tr class="border-b border-slate-800/80">
          <td class="px-3 py-2 text-sm text-slate-100">${row.label}</td>
          <td class="px-3 py-2 text-sm text-right font-mono text-slate-100">
            ${row.value} ${row.unit ?? ""}
          </td>
        </tr>`,
    )
    .join("");

  const materialsRows = materialList
    .map(
      (line) => `
        <li class="flex items-start gap-2 text-sm text-slate-100">
          <span class="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
          <span>${line}</span>
        </li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${safeContractorName} — Estimate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      body { background: #020617; color: #e2e8f0; }
    </style>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div class="min-h-screen px-8 py-6">
      <header class="border-b border-slate-800 pb-4">
        <div class="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            ${
              contractorLogoUrl
                ? `<div class="h-11 w-11 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                     <img src="${contractorLogoUrl}" alt="${safeContractorName} logo" class="h-full w-full object-contain" />
                   </div>`
                : `<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-xs font-extrabold tracking-[0.18em] text-white">
                     ${safeContractorName.charAt(0).toUpperCase() || "C"}
                   </div>`
            }
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Contractor
              </p>
              <p class="mt-0.5 text-lg font-extrabold text-slate-50">
                ${safeContractorName}
              </p>
              ${
                contactLine
                  ? `<p class="mt-0.5 text-xs text-slate-400">${contactLine}</p>`
                  : ""
              }
              <p class="mt-0.5 text-xs text-slate-500">
                Rome, New York • ops@proconstructioncalc.com
              </p>
            </div>
          </div>
          <div class="text-right text-xs text-slate-400">
            <p class="font-semibold text-sm text-slate-100">Estimate</p>
            <p>${calculatorLabel}</p>
            <p class="mt-1">Generated: ${generatedAt}</p>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Client
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-100">
            ${clientName || "Client not specified"}
          </p>
          ${
            jobAddress
              ? `<p class="mt-0.5 text-xs text-slate-400">${jobAddress}</p>`
              : ""
          }
        </div>
      </header>

      <main class="mt-4 space-y-4">
        <section class="flex gap-4">
          <div class="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Project
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-100">${jobName}</p>
          </div>
          ${
            primaryResult
              ? `<div class="w-64 rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/25 to-slate-900 px-4 py-3 text-white">
                   <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                     Primary Result
                   </p>
                   <p class="mt-1 text-2xl font-extrabold">
                     ${primaryResult.value} ${primaryResult.unit ?? ""}
                   </p>
                   <p class="mt-1 text-xs text-orange-100/90">
                     ${primaryResult.label}
                   </p>
                 </div>`
              : ""
          }
        </section>

        ${
          dollars
            ? `<section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                 <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                   Quote Total
                 </p>
                 <p class="mt-1 text-2xl font-extrabold text-orange-400">
                   ${dollars}
                 </p>
               </section>`
            : ""
        }

        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Results
          </p>
          <table class="mt-2 w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800/80 text-xs text-slate-400">
                <th class="px-3 py-1.5 font-semibold">Item</th>
                <th class="px-3 py-1.5 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              ${resultsRows}
            </tbody>
          </table>
        </section>

        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Material List
          </p>
          <ul class="mt-2 space-y-1.5">
            ${materialsRows || `<li class="text-sm text-slate-300">Order estimate for ${payload.name}.</li>`}
          </ul>
        </section>

        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Field Notes
          </p>
          <p class="mt-1 text-xs text-slate-400">
            Use this estimate as a planning tool. Always verify on-site dimensions, substrate conditions, and tax status (ST-124) before ordering or invoicing.
          </p>
        </section>

        <footer class="pt-4 text-center text-[10px] text-slate-500">
          <span class="inline-flex items-center gap-1">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              aria-hidden="true"
              class="text-orange-500"
            >
              <path
                d="M12 3l9 18H3l9-18z"
                fill="currentColor"
              />
            </svg>
            <span>
              Precision Estimate generated by Pro Construction Calc • Floyd, NY
            </span>
          </span>
        </footer>
      </main>
    </div>
  </body>
</html>`;
}

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
  try {
    const session = await auth();
    const branding = await resolvePdfBranding(payload);
    const browserlessToken = process.env.BROWSERLESS_API_TOKEN;
    if (!browserlessToken) {
      return NextResponse.json(
        { error: "PDF service not configured." },
        { status: 503 },
      );
    }

    const html = generateInvoiceHTML(
      payload,
      branding.brandName,
      branding.contractorPhone,
      branding.contractorEmail,
    );

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

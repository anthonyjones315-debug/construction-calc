import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  assertNoBusinessIdOverride,
  getBusinessContextForSession,
  getTenantScopeId,
} from "@/lib/supabase/business";
import {
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import {
  buildSigningMeta,
  finalizeEstimateSchema,
  generateEstimateShareCode,
  withFinalizeInputs,
} from "@/lib/estimates/finalize";
import {
  SHARE_CODE_UNAVAILABLE_MESSAGE,
  isMissingShareCodeColumnError,
} from "@/lib/estimates/share-code-support";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";
import { sendEstimateSignatureEmail } from "@/lib/email/estimates";
import { getPostHogClient } from "@/lib/posthog-server";
import { normalizeDollars } from "@/utils/money";
import { saveCalculation, verifyEstimate } from "@/app/actions/calculations";

function getClientEmail(input: Record<string, unknown> | undefined) {
  const candidate = input?.client_email;
  return typeof candidate === "string" && candidate.includes("@")
    ? candidate.trim()
    : null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  try {
    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantId = getTenantScopeId(businessContext);
    const payload = parsed.data;
    const contractorProfileQuery = businessContext.usesLegacyUserScope
      ? db
          .from("business_profiles")
          .select("business_name, business_email")
          .eq("user_id", tenantId)
          .maybeSingle()
      : db
          .from("business_profiles")
          .select("business_name, business_email")
          .eq("business_id", tenantId)
          .maybeSingle();

    if (rawBody && typeof rawBody === "object") {
      assertNoBusinessIdOverride(
        (rawBody as Record<string, unknown>).business_id,
        businessContext,
      );
    }

    let shareCode = "";
    let signingMeta = buildSigningMeta(generateEstimateShareCode());
    let insertError: { code?: string; message: string } | null = null;
    let savedId: string | null = null;
    let shareCodeSupported = true;

    const ownerMeta = {
      user_id: session.user.id,
      user_email: session.user.email ?? null,
      user_name: session.user.name ?? null,
    };

    function buildSavedInputs(includeShareCode: boolean) {
      const contractorSig = payload.signature?.signatureDataUrl
        ? {
            contractorSignatureDataUrl: payload.signature.signatureDataUrl,
            contractorSignedAt:
              payload.signature.signedAt ?? new Date().toISOString(),
          }
        : {};

      if (includeShareCode) {
        const base = withFinalizeInputs(
          payload.inputs,
          payload,
          signingMeta,
          ownerMeta,
        );
        return {
          ...base,
          signing: {
            ...(typeof base.signing === "object" && base.signing !== null
              ? (base.signing as Record<string, unknown>)
              : {}),
            ...contractorSig,
          },
        };
      }

      return {
        ...(payload.inputs ?? {}),
        owner: ownerMeta,
        finalize: {
          title: payload.metadata.title,
          calculatorLabel: payload.metadata.calculatorLabel,
          generatedAt: payload.metadata.generatedAt,
          jobName: payload.metadata.jobName ?? payload.name,
          materialList: payload.material_list,
        },
        signing: contractorSig,
      };
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      shareCode = signingMeta.shareCode;

      const insertPayload: Record<string, unknown> = {
        user_id: session.user.id,
        name: payload.name,
        calculator_id: payload.calculator_id,
        inputs: buildSavedInputs(shareCodeSupported),
        results: payload.results,
        budget_items: null,
        client_name: payload.client_name ?? null,
        job_site_address: payload.job_site_address ?? null,
        total_cost:
          payload.total_cost !== null && payload.total_cost !== undefined
            ? normalizeDollars(payload.total_cost)
            : null,
        status: "PENDING",
      };

      if (shareCodeSupported) {
        insertPayload.share_code = shareCode;
      }

      if (!businessContext.usesLegacyUserScope) {
        insertPayload.business_id = businessContext.businessId;
      }

      const { data, error } = await saveCalculation(db, insertPayload, {
        inputs:
          typeof insertPayload.inputs === "object" && insertPayload.inputs
            ? (insertPayload.inputs as Record<string, unknown>)
            : {},
        total_cost:
          typeof insertPayload.total_cost === "number"
            ? insertPayload.total_cost
            : null,
        county:
          typeof payload.inputs?.selected_county === "string"
            ? payload.inputs.selected_county
            : null,
      });

      if (!error && data?.id) {
        savedId = data.id;
        insertError = null;
        break;
      }

      insertError = error;
      if (error && isMissingShareCodeColumnError(error)) {
        shareCodeSupported = false;
        continue;
      }

      if (error?.code !== "23505") {
        break;
      }

      signingMeta = buildSigningMeta(generateEstimateShareCode());
    }

    if (!savedId) {
      throw new Error(insertError?.message ?? "Unable to finalize estimate.");
    }

    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(savedId), "max");

    const { data: contractorProfile, error: contractorProfileError } =
      await contractorProfileQuery;
    if (contractorProfileError) {
      throw new Error(contractorProfileError.message);
    }

    const clientEmail = getClientEmail(payload.inputs);
    const signUrl = shareCodeSupported ? signingMeta.signUrl : null;

    if (clientEmail && signUrl) {
      await sendEstimateSignatureEmail({
        to: clientEmail,
        clientName: payload.client_name ?? null,
        estimateName: payload.name,
        jobName: payload.metadata.jobName ?? payload.name,
        signUrl,
        contractorName:
          contractorProfile?.business_name ?? session.user.name ?? null,
        replyTo:
          contractorProfile?.business_email ?? session.user.email ?? null,
      });
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.user.id,
      event: "estimate_finalized",
      properties: {
        estimate_id: savedId,
        calculator_id: payload.calculator_id,
        trade: payload.calculator_id.split("/")[1] ?? "unknown",
        primary_total:
          payload.total_cost !== null && payload.total_cost !== undefined
            ? normalizeDollars(payload.total_cost)
            : null,
        has_client: Boolean(payload.client_name),
        client_emailed: Boolean(clientEmail && signUrl),
      },
    });
    posthog.shutdown().catch(() => {});

    return NextResponse.json({
      ok: true,
      id: savedId,
      shareCode: shareCodeSupported ? shareCode : null,
      signUrl,
      emailed: Boolean(clientEmail && signUrl),
      warning: shareCodeSupported ? null : SHARE_CODE_UNAVAILABLE_MESSAGE,
      status: "PENDING",
      verificationStatus: verifyEstimate({
        inputs: payload.inputs,
        total_cost: payload.total_cost ?? null,
        county:
          typeof payload.inputs?.selected_county === "string"
            ? payload.inputs.selected_county
            : null,
      }).verification_status,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    Sentry.captureException(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

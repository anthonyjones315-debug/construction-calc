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
import { loadEstimateScope } from "@/lib/supabase/estimate-scope";
import {
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import {
  FinalizeEstimateInput,
  SigningMeta,
  buildSigningMeta,
  finalizeEstimateSchema,
  generateEstimateShareCode,
  isValidShareCodeNormalized,
  normalizeShareCode,
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
import { generateAutoEstimateName } from "@/lib/estimates/name-generator";

function getClientEmail(input: Record<string, unknown> | undefined) {
  const candidate = input?.client_email;
  return typeof candidate === "string" && candidate.includes("@")
    ? candidate.trim()
    : null;
}

function buildSavedInputs({
  includeShareCode,
  payload,
  signingMeta,
  ownerMeta,
  clientEmailForInvite,
}: {
  includeShareCode: boolean;
  payload: FinalizeEstimateInput;
  signingMeta: SigningMeta;
  ownerMeta: {
    user_id: string;
    user_email: string | null;
    user_name: string | null;
  };
  clientEmailForInvite: string | null;
}) {
  const contractorSig = payload.signature?.signatureDataUrl
    ? {
        contractorSignatureDataUrl: payload.signature.signatureDataUrl,
        contractorSignedAt:
          payload.signature.signedAt ?? new Date().toISOString(),
      }
    : {};

  if (includeShareCode) {
    const inviteRecipientEmail = clientEmailForInvite
      ? clientEmailForInvite.trim().toLowerCase()
      : null;
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
        ...(inviteRecipientEmail
          ? { inviteRecipientEmail }
          : {}),
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

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;

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
    return await Sentry.startSpan({ name: "Finalize Estimate & Documenso Server Dispatch" }, async () => {
      const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    const tenantId = getTenantScopeId(businessContext);
    const tenantColumn = getTenantScopeColumn(businessContext);
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
      user_id: user.id,
      user_email: user.email ?? null,
      user_name: user.name ?? null,
    };

    const clientEmailForInvite = getClientEmail(payload.inputs);



    if (payload.saved_estimate_id) {
      const estimateId = payload.saved_estimate_id;
      const permission = await loadEstimateScope(db, estimateId, businessContext);
      if (!permission.ok) {
        return NextResponse.json(
          { error: permission.error },
          { status: permission.status },
        );
      }

      const { data: existingRow, error: rowErr } = await db
        .from("saved_estimates")
        .select("share_code")
        .eq("id", estimateId)
        .maybeSingle();

      if (rowErr || !existingRow) {
        throw new Error(rowErr?.message ?? "Estimate not found.");
      }

      signingMeta = buildSigningMeta(generateEstimateShareCode());
      const existingCode =
        typeof existingRow.share_code === "string"
          ? existingRow.share_code.trim()
          : "";
      if (existingCode) {
        const normalized = normalizeShareCode(existingCode);
        if (isValidShareCodeNormalized(normalized)) {
          signingMeta = buildSigningMeta(normalized);
        }
      }

      savedId = estimateId;
      insertError = null;

      let projectName = typeof payload.inputs?.project_name === "string" ? payload.inputs.project_name : undefined;
      if (!projectName) projectName = payload.metadata?.jobName ?? payload.name;
      const generatedName = await generateAutoEstimateName(
        db,
        tenantId,
        tenantColumn,
        payload.client_name,
        projectName,
        payload.job_site_address,
        savedId
      );

      for (let attempt = 0; attempt < 5; attempt += 1) {
        shareCode = signingMeta.shareCode;
        const inputs = buildSavedInputs({
          includeShareCode: shareCodeSupported,
          payload,
          signingMeta,
          ownerMeta,
          clientEmailForInvite,
        });
        const verified = verifyEstimate({
          inputs: inputs as Record<string, unknown>,
          total_cost:
            payload.total_cost !== null && payload.total_cost !== undefined
              ? normalizeDollars(payload.total_cost)
              : null,
          county:
            typeof payload.inputs?.selected_county === "string"
              ? payload.inputs.selected_county
              : null,
        });

        const updatePayload: Record<string, unknown> = {
          name: generatedName,
          calculator_id: payload.calculator_id,
          inputs,
          results: payload.results,
          budget_items: null,
          client_name: payload.client_name ?? null,
          job_site_address: payload.job_site_address ?? null,
          total_cost:
            payload.total_cost !== null && payload.total_cost !== undefined
              ? normalizeDollars(payload.total_cost)
              : null,
          status: "PENDING",
          subtotal_cents: verified.subtotal_cents,
          tax_cents: verified.tax_cents,
          total_cents: verified.total_cents,
          tax_basis_points: verified.tax_basis_points,
          verified_county: verified.verified_county,
          verification_status: verified.verification_status,
        };

        if (shareCodeSupported) {
          updatePayload.share_code = shareCode;
        }

        const { error } = await db
          .from("saved_estimates")
          .update(updatePayload)
          .eq("id", estimateId)
          .eq(tenantColumn, tenantId);

        if (!error) {
          insertError = null;
          break;
        }

        insertError = error;
        if (error && isMissingShareCodeColumnError(error)) {
          shareCodeSupported = false;
          continue;
        }

        if (error?.code !== "23505") {
          throw new Error(error.message);
        }

        signingMeta = buildSigningMeta(generateEstimateShareCode());
      }

      if (insertError) {
        throw new Error(insertError.message);
      }
    } else {
      let projectName = typeof payload.inputs?.project_name === "string" ? payload.inputs.project_name : undefined;
      if (!projectName) projectName = payload.metadata?.jobName ?? payload.name;
      const generatedName = await generateAutoEstimateName(
        db,
        tenantId,
        tenantColumn,
        payload.client_name,
        projectName,
        payload.job_site_address
      );

      for (let attempt = 0; attempt < 5; attempt += 1) {
        shareCode = signingMeta.shareCode;

        const insertPayload: Record<string, unknown> = {
          user_id: user.id,
          name: generatedName,
          calculator_id: payload.calculator_id,
          inputs: buildSavedInputs({
          includeShareCode: shareCodeSupported,
          payload,
          signingMeta,
          ownerMeta,
          clientEmailForInvite,
        }),
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

    const clientEmail = clientEmailForInvite;
    const signUrl = shareCodeSupported ? signingMeta.signUrl : null;

    if (clientEmail && signUrl) {
      await sendEstimateSignatureEmail({
        to: clientEmail,
        clientName: payload.client_name ?? null,
        estimateName: payload.name,
        jobName: payload.metadata.jobName ?? payload.name,
        signUrl,
        contractorName:
          contractorProfile?.business_name ?? user.name ?? null,
        replyTo:
          contractorProfile?.business_email ?? user.email ?? null,
      });
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "estimate_finalized",
      properties: {
        estimate_id: savedId,
        calculator_id: payload.calculator_id,
        updated_existing: Boolean(payload.saved_estimate_id),
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

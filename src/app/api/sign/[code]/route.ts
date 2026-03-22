import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getPublicEstimateByShareCode } from "@/lib/dal/public-estimates";
import { ShareCodeColumnMissingError } from "@/lib/estimates/share-code-support";
import { createServerClient } from "@/lib/supabase/server";
import {
  isValidShareCodeNormalized,
  normalizeShareCode,
} from "@/lib/estimates/finalize";
import { getClientIp } from "@/lib/http/client-ip";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import {
  FINANCIAL_DASHBOARD_TAG,
  SAVED_ESTIMATES_TAG,
  getEstimateTag,
  getFinancialDashboardTag,
  getSavedEstimatesTag,
} from "@/lib/cache-tags";
import { getPostHogClient } from "@/lib/posthog-server";

const signEstimateSchema = z.object({
  signerName: z.string().trim().min(2).max(120),
  signerEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  signatureDataUrl: z
    .string()
    .trim()
    .max(750_000, "Signature image is too large.")
    .regex(/^data:image\/png;base64,/, "Signature image must be a PNG data URL."),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const ip = getClientIp(request);
    const burst = checkMemoryRateLimit("sign-estimate-get", ip, 90, 60_000);
    if (!burst.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(burst.retryAfterSeconds) },
        },
      );
    }

    const { code } = await params;
    const normalized = normalizeShareCode(code);
    if (!isValidShareCodeNormalized(normalized)) {
      return NextResponse.json({ error: "Invalid sign link." }, { status: 400 });
    }

    const estimate = await getPublicEstimateByShareCode(normalized);

    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof ShareCodeColumnMissingError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const ip = getClientIp(request);
  const postBurst = checkMemoryRateLimit("sign-estimate-post-ip", ip, 25, 60_000);
  if (!postBurst.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(postBurst.retryAfterSeconds) },
      },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signEstimateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid signature payload." },
      { status: 400 },
    );
  }

  try {
    const { code } = await params;
    const normalizedCode = normalizeShareCode(code);
    if (!isValidShareCodeNormalized(normalizedCode)) {
      return NextResponse.json({ error: "Invalid sign link." }, { status: 400 });
    }

    const perCode = checkMemoryRateLimit(
      "sign-estimate-post-code",
      `${ip}:${normalizedCode}`,
      12,
      3600_000,
    );
    if (!perCode.ok) {
      return NextResponse.json(
        { error: "Too many signing attempts for this link. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(perCode.retryAfterSeconds) },
        },
      );
    }

    const estimate = await getPublicEstimateByShareCode(normalizedCode);
    if (!estimate) {
      return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
    }

    if (estimate.status === "SIGNED" || estimate.status === "Approved") {
      return NextResponse.json(
        { error: "This estimate has already been signed." },
        { status: 409 },
      );
    }

    const db = createServerClient();
    const { data: currentRow, error: currentError } = await db
      .from("saved_estimates")
      .select("id, user_id, business_id, inputs")
      .eq("share_code", normalizedCode)
      .single();

    if (currentError || !currentRow) {
      throw new Error(currentError?.message ?? "Unable to load estimate.");
    }

    const signedAt = new Date().toISOString();
    const inputs = currentRow.inputs ?? {};
    const existingSigning =
      inputs.signing && typeof inputs.signing === "object"
        ? (inputs.signing as Record<string, unknown>)
        : {};

    const inviteRecipientRaw = existingSigning.inviteRecipientEmail;
    const inviteRecipientEmail =
      typeof inviteRecipientRaw === "string" && inviteRecipientRaw.includes("@")
        ? inviteRecipientRaw.trim().toLowerCase()
        : null;

    const signerEmailResolved = inviteRecipientEmail
      ? inviteRecipientEmail
      : parsed.data.signerEmail?.trim()
        ? parsed.data.signerEmail.trim()
        : null;

    const nextInputs = {
      ...inputs,
      signing: {
        ...existingSigning,
        shareCode: normalizedCode,
        status: "signed",
        signedAt,
        signerName: parsed.data.signerName,
        signerEmail: signerEmailResolved,
        signatureDataUrl: parsed.data.signatureDataUrl,
      },
    };

    const { error: updateError } = await db
      .from("saved_estimates")
      .update({
        status: "SIGNED",
        inputs: nextInputs,
      })
      .eq("id", currentRow.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const tenantId = currentRow.business_id ?? currentRow.user_id;
    revalidateTag(FINANCIAL_DASHBOARD_TAG, "max");
    revalidateTag(getFinancialDashboardTag(tenantId), "max");
    revalidateTag(SAVED_ESTIMATES_TAG, "max");
    revalidateTag(getSavedEstimatesTag(tenantId), "max");
    revalidateTag(getEstimateTag(currentRow.id), "max");

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: currentRow.user_id,
      event: "estimate_signed",
      properties: {
        estimate_id: currentRow.id,
        signer_provided_email: Boolean(signerEmailResolved),
        signed_at: signedAt,
      },
    });
    await posthog.shutdown();

    return NextResponse.json({ ok: true, signedAt });
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof ShareCodeColumnMissingError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Unable to save your signature. Please try again." },
      { status: 500 },
    );
  }
}

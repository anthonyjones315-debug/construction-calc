import "server-only";

import {
  ShareCodeColumnMissingError,
  isMissingShareCodeColumnError,
} from "@/lib/estimates/share-code-support";
import { createServerClient } from "@/lib/supabase/server";
import {
  isValidShareCodeNormalized,
  normalizeShareCode,
} from "@/lib/estimates/finalize";
import {
  normalizeEstimateStatus,
  type EstimateStatus,
} from "@/lib/estimates/status";

type EstimateResult = {
  label: string;
  value: string | number;
  unit?: string;
};

type SavedEstimatePublicRow = {
  id: string;
  user_id: string;
  business_id: string | null;
  name: string;
  calculator_id: string;
  client_name: string | null;
  job_site_address: string | null;
  status: EstimateStatus | null;
  results: EstimateResult[] | null;
  inputs: Record<string, unknown> | null;
  share_code: string | null;
  created_at: string;
  updated_at: string;
};

type FinalizeInputShape = {
  title?: string;
  calculatorLabel?: string;
  generatedAt?: string;
  jobName?: string;
  materialList?: string[];
};

type SigningInputShape = {
  shareCode?: string;
  signUrl?: string;
  status?: "pending" | "signed";
  sentAt?: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  signatureDataUrl?: string;
  /** Normalized email the sign link was emailed to; locks the sign form when set. */
  inviteRecipientEmail?: string;
};

export type PublicEstimateForSigning = {
  id: string;
  name: string;
  calculatorId: string;
  calculatorLabel: string;
  clientName: string | null;
  jobSiteAddress: string | null;
  status: EstimateStatus;
  results: EstimateResult[];
  materialList: string[];
  shareCode: string;
  signUrl: string | null;
  generatedAt: string;
  jobName: string;
  createdAt: string;
  updatedAt: string;
  signing: SigningInputShape;
  contractor: {
    name: string | null;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
  };
};

function toPublicEstimate(
  row: SavedEstimatePublicRow,
  contractor: PublicEstimateForSigning["contractor"],
): PublicEstimateForSigning {
  const inputs = row.inputs ?? {};
  const finalize = (inputs.finalize ?? {}) as FinalizeInputShape;
  const signing = (inputs.signing ?? {}) as SigningInputShape;

  return {
    id: row.id,
    name: row.name,
    calculatorId: row.calculator_id,
    calculatorLabel:
      typeof finalize.calculatorLabel === "string" && finalize.calculatorLabel
        ? finalize.calculatorLabel
        : row.calculator_id,
    clientName: row.client_name,
    jobSiteAddress: row.job_site_address,
    status: normalizeEstimateStatus(row.status),
    results: Array.isArray(row.results) ? row.results : [],
    materialList: Array.isArray(finalize.materialList)
      ? finalize.materialList.filter((line): line is string => typeof line === "string")
      : [],
    shareCode: row.share_code ?? "",
    signUrl: typeof signing.signUrl === "string" ? signing.signUrl : null,
    generatedAt:
      typeof finalize.generatedAt === "string" && finalize.generatedAt
        ? finalize.generatedAt
        : row.created_at,
    jobName:
      typeof finalize.jobName === "string" && finalize.jobName
        ? finalize.jobName
        : row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signing,
    contractor,
  };
}

export async function getPublicEstimateByShareCode(shareCode: string) {
  const normalized = normalizeShareCode(shareCode);
  if (!normalized || !isValidShareCodeNormalized(normalized)) return null;

  const db = createServerClient();
  const { data, error } = await db
    .from("saved_estimates")
    .select(
      "id, user_id, business_id, name, calculator_id, client_name, job_site_address, status, results, inputs, share_code, created_at, updated_at",
    )
    .eq("share_code", normalized)
    .maybeSingle();

  if (error) {
    if (isMissingShareCodeColumnError(error)) {
      throw new ShareCodeColumnMissingError();
    }
    throw new Error(`Failed to load public estimate: ${error.message}`);
  }

  if (!data) return null;

  const savedEstimate = data as SavedEstimatePublicRow;
  const profileQuery = savedEstimate.business_id
    ? db
        .from("business_profiles")
        .select("business_name, business_phone, business_email, logo_url")
        .eq("business_id", savedEstimate.business_id)
        .maybeSingle()
    : db
        .from("business_profiles")
        .select("business_name, business_phone, business_email, logo_url")
        .eq("user_id", savedEstimate.user_id)
        .maybeSingle();

  const [profileResult, userResult] = await Promise.all([
    profileQuery,
    db.from("users").select("name, email, image").eq("id", savedEstimate.user_id).maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Failed to load contractor profile: ${profileResult.error.message}`,
    );
  }

  if (userResult.error) {
    throw new Error(`Failed to load contractor user: ${userResult.error.message}`);
  }

  const contractor = {
    name: profileResult.data?.business_name ?? userResult.data?.name ?? null,
    phone: profileResult.data?.business_phone ?? null,
    email: profileResult.data?.business_email ?? userResult.data?.email ?? null,
    logoUrl: profileResult.data?.logo_url ?? userResult.data?.image ?? null,
  };

  return toPublicEstimate(savedEstimate, contractor);
}

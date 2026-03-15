import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { auth } from "@/lib/auth/config";
import { getEstimateTag, getSavedEstimatesTag } from "@/lib/cache-tags";
import {
  redirectForUnauthorizedError,
  UnauthorizedError,
} from "@/lib/errors/unauthorized";
import type { MembershipRole } from "@/lib/supabase/business";
import { createServerClient } from "@/lib/supabase/server";

type EstimateStatus = "Draft" | "Sent" | "Approved" | "Lost";

type EstimateResult = {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  description?: string;
};

type EstimateRow = {
  id: string;
  user_id: string;
  business_id?: string | null;
  name: string;
  calculator_id: string;
  inputs: Record<string, unknown> | null;
  results: EstimateResult[] | null;
  budget_items: Record<string, unknown>[] | null;
  total_cost: number | null;
  client_name: string | null;
  job_site_address: string | null;
  status: EstimateStatus | null;
  share_code?: string | null;
  created_at: string;
  updated_at: string;
};

function isMissingBusinessIdColumnError(errorMessage: string): boolean {
  const lower = errorMessage.toLowerCase();
  return (
    lower.includes("column") &&
    lower.includes("saved_estimates.business_id") &&
    lower.includes("does not exist")
  );
}

type EstimateAccess = {
  scopeColumn: "business_id" | "user_id";
  businessId: string;
  role: MembershipRole;
};

export type SafeEstimateDTO = {
  id: string;
  name: string;
  calculatorId: string;
  inputs: Record<string, unknown> | null;
  results: EstimateResult[];
  budgetItems: Record<string, unknown>[] | null;
  totalCost: number | null;
  clientName: string | null;
  jobSiteAddress: string | null;
  status: EstimateStatus;
  shareCode: string | null;
  createdAt: string;
  updatedAt: string;
  viewerRole: MembershipRole;
};

const MARKUP_KEYS = new Set([
  "internalmarkup",
  "markup",
  "markupamount",
  "markuppercent",
  "markuppercentage",
  "markupvalue",
]);

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function stripMarkupFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripMarkupFields(entry)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const filteredEntries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !MARKUP_KEYS.has(normalizeKey(key)))
    .map(([key, entryValue]) => [key, stripMarkupFields(entryValue)]);

  return Object.fromEntries(filteredEntries) as T;
}

function toSafeEstimate(
  row: EstimateRow,
  role: MembershipRole,
): SafeEstimateDTO {
  const shouldExposeMarkup = role === "owner";

  return {
    id: row.id,
    name: row.name,
    calculatorId: row.calculator_id,
    inputs: shouldExposeMarkup ? row.inputs : stripMarkupFields(row.inputs),
    results: shouldExposeMarkup
      ? (row.results ?? [])
      : stripMarkupFields(row.results ?? []),
    budgetItems: shouldExposeMarkup
      ? row.budget_items
      : stripMarkupFields(row.budget_items),
    totalCost: row.total_cost,
    clientName: row.client_name,
    jobSiteAddress: row.job_site_address,
    status: row.status ?? "Draft",
    shareCode: row.share_code ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewerRole: role,
  };
}

async function getEstimateAccess(
  estimateId: string,
  userId: string,
): Promise<EstimateAccess | null> {
  const db = createServerClient();
  const { data: estimateWithBusinessScope, error: estimateScopeError } =
    await db
      .from("saved_estimates")
      .select("id, user_id, business_id")
      .eq("id", estimateId)
      .maybeSingle();

  let estimate: {
    id: string;
    user_id: string;
    business_id?: string | null;
  } | null = estimateWithBusinessScope as {
    id: string;
    user_id: string;
    business_id?: string | null;
  } | null;

  if (estimateScopeError) {
    if (!isMissingBusinessIdColumnError(estimateScopeError.message)) {
      throw new Error(
        `Failed to load estimate scope: ${estimateScopeError.message}`,
      );
    }

    const { data: legacyEstimate, error: legacyEstimateError } = await db
      .from("saved_estimates")
      .select("id, user_id")
      .eq("id", estimateId)
      .maybeSingle();

    if (legacyEstimateError) {
      throw new Error(
        `Failed to load estimate scope: ${legacyEstimateError.message}`,
      );
    }

    estimate = legacyEstimate
      ? {
          id: legacyEstimate.id,
          user_id: legacyEstimate.user_id,
          business_id: null,
        }
      : null;
  }

  if (!estimate) {
    return null;
  }

  if (!estimate.business_id) {
    if (estimate.user_id !== userId) {
      throw new UnauthorizedError(
        "This estimate belongs to a different business workspace.",
      );
    }

    return {
      scopeColumn: "user_id",
      businessId: estimate.user_id,
      role: "owner",
    };
  }

  const { data: membership, error: membershipError } = await db
    .from("memberships")
    .select("role")
    .eq("business_id", estimate.business_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      `Failed to load estimate membership: ${membershipError.message}`,
    );
  }

  if (!membership) {
    throw new UnauthorizedError(
      "This estimate belongs to a different business workspace.",
    );
  }

  return {
    scopeColumn: "business_id",
    businessId: estimate.business_id,
    role: membership.role as MembershipRole,
  };
}

async function getSafeEstimateCached(
  estimateId: string,
  scopeColumn: "business_id" | "user_id",
  businessId: string,
  role: MembershipRole,
): Promise<SafeEstimateDTO | null> {
  "use cache";

  cacheLife("minutes");
  cacheTag(getEstimateTag(estimateId));
  cacheTag(getSavedEstimatesTag(businessId));

  const db = createServerClient();
  const query =
    scopeColumn === "business_id"
      ? db
          .from("saved_estimates")
          .select(
            "id, user_id, business_id, name, calculator_id, inputs, results, budget_items, total_cost, client_name, job_site_address, status, share_code, created_at, updated_at",
          )
          .eq("id", estimateId)
          .eq("business_id", businessId)
          .maybeSingle()
      : db
          .from("saved_estimates")
          .select(
            "id, user_id, name, calculator_id, inputs, results, budget_items, total_cost, client_name, job_site_address, status, share_code, created_at, updated_at",
          )
          .eq("id", estimateId)
          .eq("user_id", businessId)
          .maybeSingle();

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load estimate: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return toSafeEstimate(data as EstimateRow, role);
}

export async function getSafeEstimate(
  estimateId: string,
): Promise<SafeEstimateDTO | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const access = await getEstimateAccess(estimateId, userId);
    if (!access) {
      return null;
    }

    return getSafeEstimateCached(
      estimateId,
      access.scopeColumn,
      access.businessId,
      access.role,
    );
  } catch (error) {
    redirectForUnauthorizedError(error);
    throw error;
  }
}

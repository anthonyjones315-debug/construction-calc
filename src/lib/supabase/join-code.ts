import type { SupabaseClient } from "@supabase/supabase-js";

const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 8;

type BusinessJoinCodeRow = {
  id: string;
  name: string;
  join_code: string | null;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(error);
}

function getRandomInt(max: number) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0]! % max;
  }

  return Math.floor(Math.random() * max);
}

export function normalizeBusinessJoinCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function generateBusinessJoinCode(length = JOIN_CODE_LENGTH): string {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += JOIN_CODE_CHARS[getRandomInt(JOIN_CODE_CHARS.length)];
  }

  return code;
}

export function makeLegacyJoinCode(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_000;
  }

  return String(Math.abs(hash)).padStart(6, "0");
}

export function isMissingBusinessJoinCodeColumnError(error: unknown): boolean {
  const lower = getErrorMessage(error).toLowerCase();
  return (
    lower.includes("column") &&
    lower.includes("join_code") &&
    lower.includes("does not exist")
  );
}

export class JoinCodeRotationUnavailableError extends Error {
  constructor(message = "Invite code rotation is unavailable until the businesses.join_code migration is applied.") {
    super(message);
    this.name = "JoinCodeRotationUnavailableError";
  }
}

async function persistGeneratedJoinCode(
  db: Pick<SupabaseClient, "from">,
  businessId: string,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateBusinessJoinCode();
    const { data, error } = await db
      .from("businesses")
      .update({ join_code: candidate })
      .eq("id", businessId)
      .select("join_code")
      .single();

    if (!error && typeof data?.join_code === "string" && data.join_code.trim()) {
      return data.join_code.trim();
    }

    if (error?.code === "23505") {
      continue;
    }

    if (isMissingBusinessJoinCodeColumnError(error)) {
      throw new JoinCodeRotationUnavailableError();
    }

    throw new Error(
      `Failed to persist business join code: ${error?.message ?? "Unknown error"}`,
    );
  }

  throw new Error("Unable to generate a unique business join code.");
}

export async function getBusinessJoinCode(
  db: Pick<SupabaseClient, "from">,
  businessId: string,
): Promise<{ code: string; rotatable: boolean }> {
  const { data, error } = await db
    .from("businesses")
    .select("join_code")
    .eq("id", businessId)
    .maybeSingle<{ join_code: string | null }>();

  if (error) {
    if (isMissingBusinessJoinCodeColumnError(error)) {
      return {
        code: makeLegacyJoinCode(businessId),
        rotatable: false,
      };
    }

    throw new Error(`Failed to load business join code: ${error.message}`);
  }

  const existing =
    typeof data?.join_code === "string"
      ? normalizeBusinessJoinCode(data.join_code)
      : "";

  if (existing) {
    return { code: existing, rotatable: true };
  }

  return {
    code: await persistGeneratedJoinCode(db, businessId),
    rotatable: true,
  };
}

export async function rotateBusinessJoinCode(
  db: Pick<SupabaseClient, "from">,
  businessId: string,
) {
  return persistGeneratedJoinCode(db, businessId);
}

export async function findBusinessByJoinCode(
  db: Pick<SupabaseClient, "from">,
  rawCode: string,
): Promise<BusinessJoinCodeRow | null> {
  const normalizedCode = normalizeBusinessJoinCode(rawCode);
  if (!normalizedCode) return null;

  const { data, error } = await db
    .from("businesses")
    .select("id, name, join_code")
    .eq("join_code", normalizedCode)
    .maybeSingle<BusinessJoinCodeRow>();

  if (error) {
    if (isMissingBusinessJoinCodeColumnError(error)) {
      const { data: allBusinesses, error: fallbackError } = await db
        .from("businesses")
        .select("id, name")
        .order("created_at", { ascending: false })
        .limit(2_000);

      if (fallbackError) {
        throw new Error(
          `Could not look up the join code: ${fallbackError.message}`,
        );
      }

      const matched = (allBusinesses ?? []).find(
        (business) => makeLegacyJoinCode(business.id) === normalizedCode,
      );

      return matched
        ? { id: matched.id, name: matched.name, join_code: null }
        : null;
    }

    throw new Error(`Could not look up the join code: ${error.message}`);
  }

  return data ?? null;
}

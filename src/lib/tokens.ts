import "server-only";

import { randomInt } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { sendTwoFactorCodeEmail } from "@/lib/email/two-factor";

const TWO_FACTOR_TOKEN_TTL_MS = 5 * 60 * 1000;

type TwoFactorTokenRow = {
  id: string;
  email: string;
  token: string;
  expires: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function cleanupExpiredTwoFactorTokens() {
  const db = createServerClient();
  const now = new Date().toISOString();
  await db.from("two_factor_tokens").delete().lte("expires", now);
}

export function generateSixDigitOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function createTwoFactorToken(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const db = createServerClient();
  const token = generateSixDigitOtp();
  const expires = new Date(Date.now() + TWO_FACTOR_TOKEN_TTL_MS).toISOString();

  await cleanupExpiredTwoFactorTokens();
  await db.from("two_factor_tokens").delete().eq("email", normalizedEmail);

  const { data, error } = await db
    .from("two_factor_tokens")
    .insert({
      email: normalizedEmail,
      token,
      expires,
    })
    .select("id, email, token, expires")
    .single<TwoFactorTokenRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create two-factor token.");
  }

  return data;
}

export async function issueTwoFactorCode(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const token = await createTwoFactorToken(normalizedEmail);

  try {
    await sendTwoFactorCodeEmail({
      to: normalizedEmail,
      code: token.token,
    });
  } catch (error) {
    const db = createServerClient();
    await db.from("two_factor_tokens").delete().eq("email", normalizedEmail);
    throw error;
  }

  return token;
}

export async function consumeTwoFactorToken(email: string, submittedToken: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedToken = submittedToken.trim();
  const db = createServerClient();

  await cleanupExpiredTwoFactorTokens();

  const { data, error } = await db
    .from("two_factor_tokens")
    .select("id, email, token, expires")
    .eq("email", normalizedEmail)
    .eq("token", normalizedToken)
    .maybeSingle<TwoFactorTokenRow>();

  if (error) {
    throw new Error(`Failed to verify two-factor token: ${error.message}`);
  }

  if (!data) {
    return false;
  }

  if (new Date(data.expires).getTime() <= Date.now()) {
    await db.from("two_factor_tokens").delete().eq("id", data.id);
    return false;
  }

  const { error: deleteError } = await db
    .from("two_factor_tokens")
    .delete()
    .eq("email", normalizedEmail);

  if (deleteError) {
    throw new Error(`Failed to consume two-factor token: ${deleteError.message}`);
  }

  return true;
}

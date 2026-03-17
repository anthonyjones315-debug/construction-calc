import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { issueTwoFactorCode } from "@/lib/tokens";
import {
  getTwoFactorRateLimitKey,
  getTwoFactorResendCooldownSeconds,
  markTwoFactorResend,
} from "@/lib/auth/two-factor-rate-limit";

const resendSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

function getClientIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

function createSupabaseAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = resendSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ipAddress = getClientIpAddress(request);
  const rateLimitKey = getTwoFactorRateLimitKey(email, ipAddress);
  const resendCooldown = getTwoFactorResendCooldownSeconds(rateLimitKey);

  if (resendCooldown > 0) {
    return NextResponse.json(
      {
        error: "Please wait before requesting another code.",
        retryAfterSeconds: resendCooldown,
      },
      { status: 429 },
    );
  }

  const authClient = createSupabaseAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const db = createServerClient();
  const { data: userRow, error: userError } = await db
    .from("users")
    .select("two_factor_enabled")
    .eq("id", data.user.id)
    .maybeSingle<{ two_factor_enabled?: boolean | null }>();

  if (userError) {
    return NextResponse.json({ error: "Unable to send code right now." }, { status: 500 });
  }

  if (userRow?.two_factor_enabled !== true) {
    return NextResponse.json(
      { error: "Two-factor authentication is not enabled for this account." },
      { status: 400 },
    );
  }

  await issueTwoFactorCode(email);
  markTwoFactorResend(rateLimitKey);

  return NextResponse.json({
    ok: true,
    retryAfterSeconds: 60,
  });
}

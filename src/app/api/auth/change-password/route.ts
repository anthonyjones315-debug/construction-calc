import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be 72 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirmation must match.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

function createSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerClient();
  const { data: providerRows, error: providerError } = await db
    .schema("next_auth")
    .from("accounts")
    .select("provider")
    .eq("userId", session.user.id);

  if (providerError) {
    Sentry.captureException(providerError);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const providers = new Set((providerRows ?? []).map((row) => row.provider));
  if (providers.has("google") && !providers.has("credentials")) {
    return NextResponse.json(
      {
        error:
          "This account uses Google sign-in only. Manage your password through Google or add email/password sign-in first.",
      },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form input." },
      { status: 400 },
    );
  }

  const supabaseAuth = createSupabaseAuthClient();
  const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
    email: session.user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return NextResponse.json(
      {
        error:
          "Current password is incorrect, or this account does not support password changes here.",
      },
      { status: 400 },
    );
  }

  const { error: updateError } = await db.auth.admin.updateUserById(
    session.user.id,
    {
      password: parsed.data.newPassword,
    },
  );

  if (updateError) {
    Sentry.captureException(updateError);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

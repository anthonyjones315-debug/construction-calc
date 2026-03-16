import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

const updatePreferencesSchema = z.object({
  proModeEnabled: z.boolean(),
});

async function resolveUserId() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, userId: null };
  }

  if (session.user.id) {
    return { session, userId: session.user.id };
  }

  const email = session.user.email?.trim().toLowerCase();
  if (!email) {
    return { session, userId: null };
  }

  const db = createServerClient();
  const { data: user, error } = await db
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve user preferences owner: ${error.message}`);
  }

  return { session, userId: user?.id ?? null };
}

export async function GET() {
  try {
    const { userId } = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();
    const { data, error } = await db
      .from("users")
      .select("pro_mode_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      preferences: {
        proModeEnabled:
          typeof data?.pro_mode_enabled === "boolean"
            ? data.pro_mode_enabled
            : null,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = updatePreferencesSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid preferences payload.",
        },
        { status: 400 },
      );
    }

    const db = createServerClient();
    const { error } = await db
      .from("users")
      .update({ pro_mode_enabled: parsed.data.proModeEnabled })
      .eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      preferences: { proModeEnabled: parsed.data.proModeEnabled },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

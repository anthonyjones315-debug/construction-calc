import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

const updatePreferencesSchema = z.object({
  proModeEnabled: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
}).refine(
  (value) =>
    typeof value.proModeEnabled === "boolean" ||
    typeof value.twoFactorEnabled === "boolean",
  {
    message: "At least one preference must be provided.",
  },
);

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
      .select("pro_mode_enabled, two_factor_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // Gracefully handle environments where the column has not been migrated yet.
      if (
        error.code === "42703" ||
        error.message?.toLowerCase().includes("pro_mode_enabled") ||
        error.message?.toLowerCase().includes("two_factor_enabled")
      ) {
        Sentry.captureMessage("user preference column missing; returning null preference", {
          level: "info",
          contexts: { supabase: { code: error.code, message: error.message } },
        });
        return NextResponse.json({
          preferences: {
            proModeEnabled: null,
            twoFactorEnabled: null,
          },
          note: "Preference column not available in this environment.",
        });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({
      preferences: {
        proModeEnabled:
          typeof data?.pro_mode_enabled === "boolean"
            ? data.pro_mode_enabled
            : null,
        twoFactorEnabled:
          typeof data?.two_factor_enabled === "boolean"
            ? data.two_factor_enabled
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
    const updates: Record<string, boolean> = {};

    if (typeof parsed.data.proModeEnabled === "boolean") {
      updates.pro_mode_enabled = parsed.data.proModeEnabled;
    }

    if (typeof parsed.data.twoFactorEnabled === "boolean") {
      updates.two_factor_enabled = parsed.data.twoFactorEnabled;
    }

    const { error } = await db
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) {
      if (
        error.code === "42703" ||
        error.message?.toLowerCase().includes("pro_mode_enabled") ||
        error.message?.toLowerCase().includes("two_factor_enabled")
      ) {
        Sentry.captureMessage("user preference column missing; update skipped", {
          level: "info",
          contexts: { supabase: { code: error.code, message: error.message } },
        });
        return NextResponse.json(
          {
            ok: false,
            preferences: {
              proModeEnabled: null,
              twoFactorEnabled: null,
            },
            note: "Preference column not available in this environment; preference not saved.",
          },
          { status: 200 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      preferences: {
        proModeEnabled:
          typeof parsed.data.proModeEnabled === "boolean"
            ? parsed.data.proModeEnabled
            : null,
        twoFactorEnabled:
          typeof parsed.data.twoFactorEnabled === "boolean"
            ? parsed.data.twoFactorEnabled
            : null,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

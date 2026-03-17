import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();

    // Remove linked OAuth/credential accounts
    const accountResult = await db
      .schema("next_auth")
      .from("accounts")
      .delete()
      .eq("userId", userId);

    if (accountResult.error) {
      throw accountResult.error;
    }

    // Clear active sessions
    const sessionResult = await db
      .schema("next_auth")
      .from("sessions")
      .delete()
      .eq("userId", userId);

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    // Soft-delete user to keep foreign key references intact
    const scrubbedEmail = `deleted+${userId}@example.invalid`;
    const userResult = await db
      .schema("next_auth")
      .from("users")
      .update({
        email: scrubbedEmail,
        name: null,
        image: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userResult.error) {
      throw userResult.error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}

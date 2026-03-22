import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const session = await auth();
    const appUserId = session?.user?.id;
    const clerkUserId = session?.user?.clerkUserId;

    if (!appUserId || !clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();
    const scrubbedEmail = `deleted+${appUserId}@invalid.local`;

    const { error: scrubError } = await db
      .schema("public")
      .from("users")
      .update({
        email: scrubbedEmail,
        name: null,
        image: null,
      })
      .eq("id", appUserId);

    if (scrubError) {
      Sentry.captureException(scrubError);
      return NextResponse.json(
        { error: "Failed to update profile before deletion." },
        { status: 500 },
      );
    }

    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}

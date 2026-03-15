import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerClient();
  const { data, error } = await db
    .schema("next_auth")
    .from("accounts")
    .select("provider")
    .eq("userId", session.user.id);

  if (error) {
    console.error("auth providers lookup failed:", error.message);
    return NextResponse.json(
      { error: "Unable to load auth providers." },
      { status: 500 },
    );
  }

  const providers = Array.from(
    new Set((data ?? []).map((row) => row.provider).filter(Boolean)),
  );

  return NextResponse.json({
    providers,
    hasGoogle: providers.includes("google"),
    hasCredentials: providers.includes("credentials"),
  });
}

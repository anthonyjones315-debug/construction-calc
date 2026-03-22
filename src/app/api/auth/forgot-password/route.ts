import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildPublicUrl } from "@/lib/site-url";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Use the service-role client to check if the email exists in auth.users.
    // This is safe because it runs server-side only and never exposes the key to the client.
    const supabaseAdmin = createServerClient();
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (listError) {
      console.error("[forgot-password] admin.listUsers error:", listError);
      // Fall back to a generic send — don't block the user if admin check fails
      await triggerReset(email);
      return NextResponse.json({ ok: true });
    }

    const exists = userList.users.some(
      (u) => u.email?.toLowerCase() === email
    );

    if (!exists) {
      // Return a generic success to prevent email enumeration
      return NextResponse.json({ ok: true });
    }

    await triggerReset(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password] unhandled error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

async function triggerReset(email: string) {
  // Use the public anon client to send the actual reset email so it goes
  // through Supabase's built-in email templates.
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const redirectTo = buildPublicUrl("/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    throw error;
  }
}

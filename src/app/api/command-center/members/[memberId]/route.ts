import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";

type MembershipRow = {
  id: string;
  user_id: string;
  role: string;
  business_id: string;
};

async function loadTargetMembership(
  memberId: string,
): Promise<
  | {
      db: ReturnType<typeof createServerClient>;
      context: Awaited<ReturnType<typeof getBusinessContextForSession>>;
      target: MembershipRow;
    }
  | { error: string; status: number }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const db = createServerClient();
  const context = await getBusinessContextForSession(db, session);
  if (!context.isAdmin) {
    return {
      error: "Only business owners and admins can manage team members.",
      status: 403,
    };
  }

  const { data, error } = await db
    .from("memberships")
    .select("id, user_id, role, business_id")
    .eq("id", memberId)
    .eq("business_id", context.businessId)
    .maybeSingle();

  if (error) {
    return { error: error.message, status: 500 };
  }

  if (!data) {
    return { error: "Member not found.", status: 404 };
  }

  return { db, context, target: data as MembershipRow };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
  const { memberId } = await params;
  const loaded = await loadTargetMembership(memberId);

  if ("error" in loaded) {
    return NextResponse.json(
      { error: loaded.error },
      { status: loaded.status },
    );
  }

  const body = await req.json().catch(() => ({}));
  const role = typeof body?.role === "string" ? body.role : "";

  if (!["owner", "admin", "editor", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be owner, admin, editor, or member." },
      { status: 400 },
    );
  }

  // Only the business owner can transfer ownership or assign the owner role.
  if (role === "owner" && !loaded.context.isOwner) {
    return NextResponse.json(
      { error: "Only the business owner can transfer ownership." },
      { status: 403 },
    );
  }

  if (loaded.target.user_id === loaded.context.userId && role !== "owner") {
    return NextResponse.json(
      { error: "Owner cannot demote their own account." },
      { status: 400 },
    );
  }

  const { error } = await loaded.db
    .from("memberships")
    .update({ role })
    .eq("id", loaded.target.id)
    .eq("business_id", loaded.context.businessId);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
  const { memberId } = await params;
  const loaded = await loadTargetMembership(memberId);

  if ("error" in loaded) {
    return NextResponse.json(
      { error: loaded.error },
      { status: loaded.status },
    );
  }

  if (loaded.target.user_id === loaded.context.userId) {
    return NextResponse.json(
      { error: "Owner cannot remove their own account." },
      { status: 400 },
    );
  }

  if (loaded.target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove another owner from this screen." },
      { status: 400 },
    );
  }

  const { error } = await loaded.db
    .from("memberships")
    .delete()
    .eq("id", loaded.target.id)
    .eq("business_id", loaded.context.businessId);

  if (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

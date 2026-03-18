import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { getBusinessContextForSession } from "@/lib/supabase/business";
import {
  JoinCodeRotationUnavailableError,
  getBusinessJoinCode,
  rotateBusinessJoinCode,
} from "@/lib/supabase/join-code";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);

  if (!businessContext.isOwner) {
    return NextResponse.json(
      { error: "Only business owners can access Command Center." },
      { status: 403 },
    );
  }

  const { data: businessRow, error: businessError } = await db
    .from("businesses")
    .select("id, name")
    .eq("id", businessContext.businessId)
    .single();

  if (businessError || !businessRow) {
    if (businessError) Sentry.captureException(businessError);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const { data: memberships, error: membershipsError } = await db
    .from("memberships")
    .select("id, user_id, role, created_at")
    .eq("business_id", businessContext.businessId)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    Sentry.captureException(membershipsError);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  const userIds = (memberships ?? []).map((row) => row.user_id);
  let users: UserRow[] = [];
  if (userIds.length > 0) {
    const { data: userRows, error: usersError } = await db
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    if (usersError) {
      Sentry.captureException(usersError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    users = (userRows ?? []) as UserRow[];
  }

  const userMap = new Map(users.map((row) => [row.id, row]));

  return NextResponse.json({
    business: {
      id: businessRow.id,
      name: businessRow.name,
      joinCode: (await getBusinessJoinCode(db, businessRow.id)).code,
    },
    members: (memberships ?? []).map((membership) => {
      const user = userMap.get(membership.user_id);
      return {
        membershipId: membership.id,
        userId: membership.user_id,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "Unknown Email",
        role: membership.role,
        joinedAt: membership.created_at,
      };
    }),
  });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();
    const businessContext = await getBusinessContextForSession(db, session);
    if (!businessContext.isOwner) {
      return NextResponse.json(
        { error: "Only business owners can rotate invite codes." },
        { status: 403 },
      );
    }

    const joinCode = await rotateBusinessJoinCode(db, businessContext.businessId);
    return NextResponse.json({
      ok: true,
      business: {
        id: businessContext.businessId,
        joinCode,
      },
    });
  } catch (error) {
    if (error instanceof JoinCodeRotationUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

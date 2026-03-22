import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  findBusinessByJoinCode,
  normalizeBusinessJoinCode,
  rotateBusinessJoinCode,
} from "@/lib/supabase/join-code";

const SEAT_LIMIT = 10;

function isValidCodeFormat(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{6,12}$/.test(normalizeBusinessJoinCode(code));
}

async function checkExistingMembership(
  db: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<NextResponse | null> {
  const { data: existingMembership, error: existingError } = await db
    .from("memberships")
    .select("business_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    Sentry.captureException(existingError, {
      tags: { route: "join-by-code", step: "check-existing-membership" },
      extra: { userId },
    });
    return NextResponse.json(
      { error: "Unable to verify your current team status. Try again." },
      { status: 500 },
    );
  }

  if (existingMembership?.business_id) {
    return NextResponse.json(
      {
        error:
          "You are already a member of a business. Leave your current team before joining another.",
      },
      { status: 409 },
    );
  }

  return null;
}

async function handleSeatClaim(
  db: ReturnType<typeof createServerClient>,
  userId: string,
  matchedBusiness: { id: string; name: string },
): Promise<NextResponse> {
  const { data: claimResult, error: claimError } = await db.rpc(
    "claim_business_seat",
    {
      p_business_id: matchedBusiness.id,
      p_user_id: userId,
      p_seat_limit: SEAT_LIMIT,
    },
  );

  if (claimError) {
    if (
      claimError.code === "PGRST202" ||
      claimError.message?.toLowerCase().includes("could not find the function")
    ) {
      return legacyJoin(db, userId, matchedBusiness);
    }

    Sentry.captureException(claimError, {
      tags: { route: "join-by-code", step: "claim-seat-rpc" },
      extra: { userId, businessId: matchedBusiness.id },
    });
    return NextResponse.json(
      { error: "Unable to claim a seat. Try again." },
      { status: 500 },
    );
  }

  const result = claimResult as {
    ok: boolean;
    error?: string;
    code?: string;
    business_name?: string;
  } | null;

  if (!result?.ok) {
    const serverError = result?.error ?? "Unable to join. Try again.";
    const serverCode = result?.code ?? "";

    if (serverError === "already_member") {
      return NextResponse.json(
        { error: "You are already a member of this business." },
        { status: 409 },
      );
    }

    if (serverCode === "seat_limit_reached") {
      return NextResponse.json({ error: serverError }, { status: 403 });
    }

    return NextResponse.json({ error: serverError }, { status: 400 });
  }

  try {
    await rotateBusinessJoinCode(db, matchedBusiness.id);
  } catch (rotateError) {
    Sentry.captureException(rotateError, {
      tags: { route: "join-by-code", step: "rotate-join-code" },
      extra: { userId, businessId: matchedBusiness.id },
    });
  }

  return NextResponse.json({
    ok: true,
    businessName: result.business_name ?? matchedBusiness.name,
    message: `You have joined ${result.business_name ?? matchedBusiness.name}.`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let body: { joinCode?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const rawCode =
      typeof body?.joinCode === "string" ? body.joinCode.trim() : "";

    if (!rawCode) {
      return NextResponse.json(
        { error: "Join code is required." },
        { status: 400 },
      );
    }

    if (!isValidCodeFormat(rawCode)) {
      return NextResponse.json(
        { error: "Join code format is invalid. Check the code and try again." },
        { status: 400 },
      );
    }

    const db = createServerClient();

    const existingMembershipErrorResponse = await checkExistingMembership(db, userId);
    if (existingMembershipErrorResponse) {
      return existingMembershipErrorResponse;
    }

    let matchedBusiness: { id: string; name: string } | null = null;
    try {
      matchedBusiness = await findBusinessByJoinCode(db, rawCode);
    } catch (lookupError) {
      Sentry.captureException(lookupError, {
        tags: { route: "join-by-code", step: "lookup-business" },
        extra: { userId },
      });
      return NextResponse.json(
        {
          error:
            lookupError instanceof Error
              ? lookupError.message
              : "Could not look up the join code. Try again.",
        },
        { status: 500 },
      );
    }

    if (!matchedBusiness) {
      return NextResponse.json(
        { error: "Invalid join code. Double-check the code and try again." },
        { status: 404 },
      );
    }

    return handleSeatClaim(db, userId, matchedBusiness);
  } catch (error) {
    Sentry.captureException(error, { tags: { route: "join-by-code" } });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ── Legacy path: used when the claim_business_seat RPC isn't deployed yet ────
// Retains the pre-RPC check-insert-recount pattern with the rollback guard.
async function legacyJoin(
  db: ReturnType<typeof createServerClient>,
  userId: string,
  matchedBusiness: { id: string; name: string },
): Promise<NextResponse> {
  const { data: duplicateCheck } = await db
    .from("memberships")
    .select("id")
    .eq("business_id", matchedBusiness.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (duplicateCheck?.id) {
    return NextResponse.json(
      { error: "You are already a member of this business." },
      { status: 409 },
    );
  }

  const { count: seatCount } = await db
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("business_id", matchedBusiness.id);

  if ((seatCount ?? 0) >= SEAT_LIMIT) {
    return NextResponse.json(
      {
        error: `This team has reached its ${SEAT_LIMIT}-seat limit. Contact the business owner to expand.`,
      },
      { status: 403 },
    );
  }

  const { data: inserted, error: insertError } = await db
    .from("memberships")
    .insert({ business_id: matchedBusiness.id, user_id: userId, role: "member" })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You are already a member of this business." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Could not join the team right now. Try again." },
      { status: 500 },
    );
  }

  // Post-insert recount guard (last-seat race mitigation before RPC lands).
  const { count: postCount } = await db
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("business_id", matchedBusiness.id);

  if ((postCount ?? 0) > SEAT_LIMIT) {
    await db.from("memberships").delete().eq("id", inserted.id);
    return NextResponse.json(
      {
        error: `This team has reached its ${SEAT_LIMIT}-seat limit. Contact the business owner to expand.`,
      },
      { status: 403 },
    );
  }

  // Best-effort code rotation.
  try {
    await rotateBusinessJoinCode(db, matchedBusiness.id);
  } catch {
    // Non-fatal
  }

  return NextResponse.json({
    ok: true,
    businessName: matchedBusiness.name,
    message: `You have joined ${matchedBusiness.name}.`,
  });
}

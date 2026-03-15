import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

const SEAT_LIMIT = 10;

/** Deterministic 6-digit code derived from a business UUID. */
function makeJoinCode(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_000;
  }
  return String(Math.abs(hash)).padStart(6, "0");
}

function isValidCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
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
        { error: "Join code must be exactly 6 digits." },
        { status: 400 },
      );
    }

    const db = createServerClient();

    // ── Double-Check 1: prevent joining if already in a business ─────────────
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

    // ── Resolve the business from its join code ───────────────────────────────
    // Join codes are derived from business IDs (makeJoinCode(id)). We scan
    // recent businesses (capped at 2 000) to find a matching code. For
    // production scale, add a stored `join_code` column to `businesses`.
    const { data: allBusinesses, error: bizScanError } = await db
      .from("businesses")
      .select("id, name")
      .order("created_at", { ascending: false })
      .limit(2_000);

    if (bizScanError) {
      Sentry.captureException(bizScanError, {
        tags: { route: "join-by-code", step: "scan-businesses" },
        extra: { userId },
      });
      return NextResponse.json(
        { error: "Could not look up the join code. Try again." },
        { status: 500 },
      );
    }

    const matchedBusiness = (allBusinesses ?? []).find(
      (biz) => makeJoinCode(biz.id) === rawCode,
    );

    if (!matchedBusiness) {
      return NextResponse.json(
        { error: "Invalid join code. Double-check the code and try again." },
        { status: 404 },
      );
    }

    // ── Double-Check 2: prevent duplicate membership rows ────────────────────
    const { data: duplicateCheck, error: dupError } = await db
      .from("memberships")
      .select("id")
      .eq("business_id", matchedBusiness.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (dupError) {
      Sentry.captureException(dupError, {
        tags: { route: "join-by-code", step: "duplicate-check" },
        extra: { userId, businessId: matchedBusiness.id },
      });
      return NextResponse.json(
        { error: "Unable to verify team membership. Try again." },
        { status: 500 },
      );
    }

    if (duplicateCheck?.id) {
      return NextResponse.json(
        { error: "You are already a member of this business." },
        { status: 409 },
      );
    }

    // ── Double-Check 3: enforce seat limit before inserting ──────────────────
    const { count: seatCount, error: seatError } = await db
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("business_id", matchedBusiness.id);

    if (seatError) {
      Sentry.captureException(seatError, {
        tags: { route: "join-by-code", step: "seat-count" },
        extra: { userId, businessId: matchedBusiness.id },
      });
      return NextResponse.json(
        { error: "Unable to verify seat availability. Try again." },
        { status: 500 },
      );
    }

    if ((seatCount ?? 0) >= SEAT_LIMIT) {
      return NextResponse.json(
        {
          error: `This team has reached its ${SEAT_LIMIT}-seat limit. Contact the business owner to expand.`,
        },
        { status: 403 },
      );
    }

    // ── All checks passed — create the membership ────────────────────────────
    const { error: insertError } = await db.from("memberships").insert({
      business_id: matchedBusiness.id,
      user_id: userId,
      role: "member",
    });

    if (insertError) {
      Sentry.captureException(insertError, {
        tags: { route: "join-by-code", step: "insert-membership" },
        extra: { userId, businessId: matchedBusiness.id },
      });
      return NextResponse.json(
        {
          error:
            "⚠️ Connection drop. Could not join the team right now. Try again in a moment.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      businessName: matchedBusiness.name,
      message: `You have joined ${matchedBusiness.name}.`,
    });
  } catch (error) {
    Sentry.captureException(error, { tags: { route: "join-by-code" } });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

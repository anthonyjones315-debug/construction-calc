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

    // ── Guard: user must not already belong to a business ───────────────────
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

    // ── Resolve the business by join code ────────────────────────────────────
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

    // ── Atomic seat claim via DB RPC (eliminates TOCTOU race) ────────────────
    // The claim_business_seat function acquires an advisory lock, counts seats,
    // and inserts the membership row — all inside one serialized transaction.
    const { data: claimResult, error: claimError } = await db.rpc(
      "claim_business_seat",
      {
        p_business_id: matchedBusiness.id,
        p_user_id: userId,
        p_seat_limit: SEAT_LIMIT,
      },
    );

    if (claimError) {
      Sentry.captureException(claimError, {
        tags: { route: "join-by-code", step: "claim-seat-rpc" },
        extra: { userId, businessId: matchedBusiness.id },
      });
      return NextResponse.json(
        {
          error:
            claimError.code === "PGRST202" ||
            claimError.message
              ?.toLowerCase()
              .includes("could not find the function")
              ? "Seat-claim migration is missing. Run database migrations and try again."
              : "Unable to claim a seat. Try again.",
        },
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

    // ── Rotate the join code so the same code cannot be reused ───────────────
    try {
      await rotateBusinessJoinCode(db, matchedBusiness.id);
    } catch (rotateError) {
      // Non-fatal: log but do not fail the join itself.
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
  } catch (error) {
    Sentry.captureException(error, { tags: { route: "join-by-code" } });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

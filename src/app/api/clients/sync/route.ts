import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/clients/sync
 *
 * Matches an incoming client against the CRM by name, address, or phone.
 * If a match is found, returns the existing record (with a `matched: true` flag).
 * If no match is found, creates a new CRM record and returns it.
 *
 * Body: { name: string; email?: string; phone?: string; address?: string }
 *
 * Response:
 *   { client: ClientDTO; matched: boolean; duplicates?: ClientDTO[] }
 *
 *   If there are multiple possible matches (e.g. same address, different names),
 *   the first match is returned as `client` and all candidates as `duplicates`.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Client name is required." },
        { status: 400 },
      );
    }

    const db = createServerClient();
    const userId = session.user.id;

    // ── Try to find existing matches ─────────────────────────────────
    // We search for clients that match on ANY of: name, address, or phone
    const { data: allClients, error: fetchError } = await db
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (fetchError) {
      // If clients table doesn't exist, create a new client
      const errMsg = fetchError.message?.toLowerCase?.() ?? "";
      if (
        fetchError.code === "42P01" ||
        errMsg.includes("could not find the table")
      ) {
        return NextResponse.json({
          client: { id: null, name, email, phone, address },
          matched: false,
          duplicates: [],
        });
      }
      throw new Error(fetchError.message);
    }

    const candidates = (allClients ?? []).filter((c: Record<string, unknown>) => {
      const cAddress = typeof c.address === "string" ? c.address.trim().toLowerCase() : "";
      const cPhone = typeof c.phone === "string" ? c.phone.replace(/\D/g, "") : "";

      // Match on address (case-insensitive, non-empty)
      if (address && cAddress && cAddress === address.toLowerCase()) return true;
      // Match on phone (digits only)
      if (phone && cPhone && cPhone === phone.replace(/\D/g, "")) return true;

      return false;
    });

    if (candidates.length > 0) {
      const bestMatch = candidates[0];

      return NextResponse.json({
        client: bestMatch,
        matched: true,
        duplicates: candidates.length > 1 ? candidates : [],
      });
    }

    // ── No match — create new client ─────────────────────────────────
    const { data: newClient, error: insertError } = await db
      .from("clients")
      .insert({
        user_id: userId,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      client: newClient,
      matched: false,
      duplicates: [],
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

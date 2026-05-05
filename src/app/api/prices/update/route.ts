import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { MARKET_PRICES_BASE } from "@/data";
import type { MarketPrices } from "@/types";
import type { AuthSession } from "@/lib/auth/session";

async function getPricesForCurrentUser(
  session: AuthSession,
): Promise<MarketPrices> {
  const prices: MarketPrices = { ...MARKET_PRICES_BASE };

  if (!session?.user?.id) {
    return prices;
  }

  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

  const { data, error } = await db
    .from("user_materials")
    .select("material_name, unit_type, unit_cost")
    .eq(tenantColumn, tenantId);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const name = String(row.material_name ?? "").trim();
    if (!name) continue;

    const unitCost = Number(row.unit_cost ?? 0);
    prices[name] = {
      price: Number.isFinite(unitCost) ? unitCost : 0,
      unit: String(row.unit_type ?? "each") || "each",
    };
  }

  return prices;
}

export async function POST() {
  try {
    const session = await auth();
    if (session?.user?.id) {
      const rl = checkMemoryRateLimit(
        "prices-update",
        session.user.id,
        20,
        60_000,
      );
      if (!rl.ok) {
        return NextResponse.json(
          { error: "Too many price update requests. Please try again later." },
          {
            status: 429,
            headers: { "Retry-After": String(rl.retryAfterSeconds) },
          },
        );
      }
    }

    const prices = await getPricesForCurrentUser(session);
    return NextResponse.json({ prices });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

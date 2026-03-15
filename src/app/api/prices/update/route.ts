import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { MARKET_PRICES_BASE } from "@/data";
import type { MarketPrices } from "@/types";

async function getPricesForCurrentUser(): Promise<MarketPrices> {
  const prices: MarketPrices = { ...MARKET_PRICES_BASE };
  const session = await auth();

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
    const prices = await getPricesForCurrentUser();
    return NextResponse.json({ prices });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

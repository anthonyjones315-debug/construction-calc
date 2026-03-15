import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

type TableHealth = {
  schema: "default" | "public";
  table: string;
  ok: boolean;
  count: number | null;
  error: string | null;
};

async function checkTable(
  table: string,
  schema: "default" | "public",
): Promise<TableHealth> {
  try {
    const db = createServerClient();
    const scoped = schema === "public" ? db.schema("public") : db;
    const { error, count } = await scoped
      .from(table)
      .select("*", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      return {
        schema,
        table,
        ok: false,
        count: null,
        error: error.message,
      };
    }

    return {
      schema,
      table,
      ok: true,
      count: count ?? 0,
      error: null,
    };
  } catch (error) {
    return {
      schema,
      table,
      ok: false,
      count: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const requiredTables = [
    "users",
    "saved_estimates",
    "business_profiles",
    "user_materials",
  ];

  const tables = await Promise.all(
    requiredTables.flatMap((table) => [
      checkTable(table, "default"),
      checkTable(table, "public"),
    ]),
  );

  return NextResponse.json({
    ok: tables.every((table) => table.ok),
    projectUrl,
    serviceRoleConfigured,
    tables,
  });
}

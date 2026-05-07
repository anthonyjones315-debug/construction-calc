import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import { getClientIp } from "@/lib/http/client-ip";
import type { CrmContact } from "@/lib/crm/types";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkMemoryRateLimit("crm-contacts-get", ip, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo data placeholder until Supabase integration is wired up.
  const demo: CrmContact[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      company: "Doe Construction",
      notes: "First job - roof replacement",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@smithco.com",
      company: "Smith Co.",
    },
  ];

  return NextResponse.json(demo);
}

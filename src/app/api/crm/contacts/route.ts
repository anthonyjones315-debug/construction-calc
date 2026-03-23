import { NextResponse } from "next/server";
import type { CrmContact } from "@/lib/crm/types";

export async function GET() {
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

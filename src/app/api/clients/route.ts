import { NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/dal/clients";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const client = await createClient(json);
    return NextResponse.json(client);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

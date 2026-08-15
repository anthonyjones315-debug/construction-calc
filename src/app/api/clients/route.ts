import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getClients, createClient } from "@/lib/dal/clients";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error: unknown) {
    Sentry.captureException(error);
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const client = await createClient(json);
    return NextResponse.json(client);
  } catch (error: unknown) {
    Sentry.captureException(error);
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 400 });
  }
}

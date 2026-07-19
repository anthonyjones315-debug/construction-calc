import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getClients, createClient } from "@/lib/dal/clients";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let json: any;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const client = await createClient(json);
    return NextResponse.json(client);
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

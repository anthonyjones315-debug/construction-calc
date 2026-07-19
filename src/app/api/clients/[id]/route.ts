import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getClient, updateClient, deleteClient } from "@/lib/dal/clients";
import { isUnauthorizedError } from "@/lib/errors/unauthorized";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let json: any;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const client = await updateClient(id, json);
    return NextResponse.json(client);
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

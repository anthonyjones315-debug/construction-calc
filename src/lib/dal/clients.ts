import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/config";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

export type ClientDTO = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

function toClientDTO(row: Record<string, unknown>): ClientDTO {
  return {
    id: String(row.id),
    name: String(row.name),
    email: typeof row.email === "string" ? row.email : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    address: typeof row.address === "string" ? row.address : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getClients(): Promise<ClientDTO[]> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load clients: ${error.message}`);
  }

  return (data || []).map(toClientDTO);
}

export async function getClient(clientId: string): Promise<ClientDTO | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load client: ${error.message}`);
  }

  if (!data) return null;
  return toClientDTO(data);
}

export async function createClient(payload: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}): Promise<ClientDTO> {
  const session = await auth();
  const userId = session?.user?.id;
  const businessId: string | null = null; // resolved via RLS or trigger — not available on session

  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("clients")
    .insert({
      user_id: userId,
      business_id: businessId || null,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      address: payload.address || null,
      notes: payload.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  return toClientDTO(data);
}

export async function updateClient(
  clientId: string,
  payload: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
  }
): Promise<ClientDTO> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = createServerClient();
  const { data, error } = await db
    .from("clients")
    .update({
      ...payload,
    })
    .eq("id", clientId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  if (!data) {
    throw new Error("Client not found or unauthorized.");
  }

  return toClientDTO(data);
}

export async function deleteClient(clientId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = createServerClient();
  const { error } = await db
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}

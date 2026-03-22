import "server-only";

import { auth as clerkAuth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { ensurePublicUserRecord } from "@/lib/supabase/ensurePublicUser";
import type { AuthSession } from "@/lib/auth/session";

const APP_USER_ID_METADATA_KEY = "appUserId";

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  return user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.fullName || user.username || null;
}

async function resolveAppUserId(params: {
  clerkUserId: string;
  email: string | null;
  name: string | null;
  image: string | null;
  publicMetadata: Record<string, unknown>;
}) {
  const db = getSupabaseAdminClient();
  if (!db) {
    return null;
  }

  const existingMetadataUserId =
    typeof params.publicMetadata[APP_USER_ID_METADATA_KEY] === "string"
      ? (params.publicMetadata[APP_USER_ID_METADATA_KEY] as string)
      : null;

  const appUserId = await ensurePublicUserRecord(db, {
    id: existingMetadataUserId ?? crypto.randomUUID(),
    email: params.email,
    name: params.name,
    image: params.image,
  });

  if (existingMetadataUserId !== appUserId) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(params.clerkUserId, {
      publicMetadata: {
        ...params.publicMetadata,
        [APP_USER_ID_METADATA_KEY]: appUserId,
      },
    });
  }

  return appUserId;
}

export async function auth(): Promise<AuthSession> {
  const { userId: clerkUserId } = await clerkAuth();

  if (!clerkUserId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const email = getPrimaryEmail(user);
  const name = getDisplayName(user);
  const image = user.imageUrl ?? null;
  const publicMetadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const appUserId = await resolveAppUserId({
    clerkUserId,
    email,
    name,
    image,
    publicMetadata,
  });

  return {
    user: {
      id: appUserId ?? clerkUserId,
      clerkUserId,
      email,
      name,
      image,
      business_id: null,
      role: "none",
    },
  };
}

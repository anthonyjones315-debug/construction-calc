import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "next-auth";

type PublicUserSeed = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type PublicUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified?: string | null;
  pro_mode_enabled?: boolean | null;
};

type SupabaseErrorLike = {
  code?: string;
  message: string;
};

function isMissingPublicUsersTableError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("could not find the table 'public.users'") ||
    lower.includes('relation "public.users" does not exist') ||
    lower.includes("schema cache")
  );
}

function isUsersEmailConflictError(error: SupabaseErrorLike | null | undefined) {
  if (!error) return false;

  const message = error.message.toLowerCase();
  return (
    error.code === "23505" &&
    (message.includes("users_email_key") ||
      (message.includes("duplicate key") && message.includes("email")))
  );
}

function normalizeEmail(email: string | null | undefined) {
  const trimmed = email?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

async function loadPublicUserById(db: SupabaseClient, id: string) {
  const { data, error } = await db
    .schema("public")
    .from("users")
    .select("id, name, email, image, emailVerified, pro_mode_enabled")
    .eq("id", id)
    .maybeSingle<PublicUserRow>();

  if (error) {
    if (isMissingPublicUsersTableError(error.message)) {
      return null;
    }

    throw new Error(`Failed to load public user by id: ${error.message}`);
  }

  return data;
}

async function loadPublicUserByEmail(db: SupabaseClient, email: string) {
  const { data, error } = await db
    .schema("public")
    .from("users")
    .select("id, name, email, image, emailVerified, pro_mode_enabled")
    .eq("email", email)
    .maybeSingle<PublicUserRow>();

  if (error) {
    if (isMissingPublicUsersTableError(error.message)) {
      return null;
    }

    throw new Error(`Failed to load public user by email: ${error.message}`);
  }

  return data;
}

async function moveUserReferences(
  db: SupabaseClient,
  fromUserId: string,
  toUserId: string,
) {
  const updates = [
    db.from("saved_estimates").update({ user_id: toUserId }).eq("user_id", fromUserId),
    db.from("business_profiles").update({ user_id: toUserId }).eq("user_id", fromUserId),
    db.from("user_materials").update({ user_id: toUserId }).eq("user_id", fromUserId),
    db.from("businesses").update({ owner_id: toUserId }).eq("owner_id", fromUserId),
    db.from("memberships").update({ user_id: toUserId }).eq("user_id", fromUserId),
    db.from("organizations").update({ owner_user_id: toUserId }).eq("owner_user_id", fromUserId),
    db.from("leads").update({ created_by_user_id: toUserId }).eq("created_by_user_id", fromUserId),
  ];

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(`Failed to move user references: ${failed.error.message}`);
  }
}

async function reconcilePublicUserByEmail(
  db: SupabaseClient,
  existingUser: PublicUserRow,
  nextUser: PublicUserSeed,
  targetUser?: PublicUserRow | null,
) {
  const nextEmail = normalizeEmail(nextUser.email);
  const mergedName =
    nextUser.name ?? targetUser?.name ?? existingUser.name ?? null;
  const mergedImage =
    nextUser.image ?? targetUser?.image ?? existingUser.image ?? null;
  const mergedEmailVerified =
    targetUser?.emailVerified ?? existingUser.emailVerified ?? null;
  const mergedProModeEnabled =
    targetUser?.pro_mode_enabled ?? existingUser.pro_mode_enabled ?? null;

  const { error: provisionalInsertError } = await db
    .schema("public")
    .from("users")
    .upsert(
      {
        id: nextUser.id,
        name: mergedName,
        email: null,
        image: mergedImage,
        emailVerified: mergedEmailVerified,
        pro_mode_enabled: mergedProModeEnabled,
      },
      { onConflict: "id" },
    );

  if (provisionalInsertError) {
    throw new Error(
      `Failed to create provisional public user: ${provisionalInsertError.message}`,
    );
  }

  await moveUserReferences(db, existingUser.id, nextUser.id);

  const { error: clearEmailError } = await db
    .schema("public")
    .from("users")
    .update({ email: null })
    .eq("id", existingUser.id);

  if (clearEmailError) {
    throw new Error(
      `Failed to clear email on legacy public user: ${clearEmailError.message}`,
    );
  }

  const { error: updateNewUserError } = await db
    .schema("public")
    .from("users")
    .update({
      name: mergedName,
      email: nextEmail,
      image: mergedImage,
      emailVerified: mergedEmailVerified,
      pro_mode_enabled: mergedProModeEnabled,
    })
    .eq("id", nextUser.id);

  if (updateNewUserError) {
    throw new Error(
      `Failed to finalize reconciled public user: ${updateNewUserError.message}`,
    );
  }

  const { error: deleteLegacyUserError } = await db
    .schema("public")
    .from("users")
    .delete()
    .eq("id", existingUser.id);

  if (deleteLegacyUserError) {
    throw new Error(
      `Failed to remove legacy public user: ${deleteLegacyUserError.message}`,
    );
  }

  return nextUser.id;
}

async function recoverFromEmailConflict(
  db: SupabaseClient,
  user: PublicUserSeed,
  targetUser?: PublicUserRow | null,
) {
  const email = normalizeEmail(user.email);
  if (!email) {
    return null;
  }

  const existingByEmail = await loadPublicUserByEmail(db, email);
  if (!existingByEmail) {
    return null;
  }

  if (existingByEmail.id === user.id) {
    return user.id;
  }

  return reconcilePublicUserByEmail(db, existingByEmail, user, targetUser);
}

export async function ensurePublicUserRecord(
  db: SupabaseClient,
  user: PublicUserSeed,
) {
  const email = normalizeEmail(user.email);

  const existingById = await loadPublicUserById(db, user.id);
  if (existingById) {
    if (email) {
      const existingByEmail = await loadPublicUserByEmail(db, email);
      if (existingByEmail && existingByEmail.id !== user.id) {
        return reconcilePublicUserByEmail(db, existingByEmail, user, existingById);
      }
    }

    const { error } = await db
      .schema("public")
      .from("users")
      .update({
        name: user.name ?? existingById.name ?? null,
        email,
        image: user.image ?? existingById.image ?? null,
      })
      .eq("id", user.id);

    if (error) {
      if (isUsersEmailConflictError(error)) {
        const recoveredUserId = await recoverFromEmailConflict(
          db,
          user,
          existingById,
        );
        if (recoveredUserId) {
          return recoveredUserId;
        }
      }

      throw new Error(`Failed to update public user: ${error.message}`);
    }

    return user.id;
  }

  if (email) {
    const existingByEmail = await loadPublicUserByEmail(db, email);
    if (existingByEmail && existingByEmail.id !== user.id) {
      return reconcilePublicUserByEmail(db, existingByEmail, user);
    }
  }

  const { error } = await db
    .schema("public")
    .from("users")
    .upsert(
      {
        id: user.id,
        name: user.name ?? null,
        email,
        image: user.image ?? null,
      },
      { onConflict: "id" },
    );

  if (error) {
    if (isMissingPublicUsersTableError(error.message)) {
      console.warn(
        `ensurePublicUserRecord skipped [uid:${user.id}]: public.users table not found in this environment`,
      );
      return user.id;
    }

    if (isUsersEmailConflictError(error)) {
      const recoveredUserId = await recoverFromEmailConflict(db, user);
      if (recoveredUserId) {
        return recoveredUserId;
      }
    }

    throw new Error(
      `ensurePublicUserRecord failed [uid:${user.id}]: ${error.message}`,
    );
  }

  return user.id;
}

/**
 * Ensures the authenticated user exists in public.users.
 * The sync trigger handles new sign-ins, but existing sessions created before
 * the trigger was set up may be missing from public.users.
 */
export async function ensurePublicUser(db: SupabaseClient, session: Session) {
  const { user } = session;
  if (!user?.id) return;

  return ensurePublicUserRecord(db, {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  });
}

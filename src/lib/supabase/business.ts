import type { Session } from "@/lib/auth/session";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensurePublicUser } from "@/lib/supabase/ensurePublicUser";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

export type MembershipRole = "owner" | "member" | "admin" | "editor";

const BUSINESS_DELETE_ROLES: MembershipRole[] = ["owner", "admin"];
const BUSINESS_WRITE_ROLES: MembershipRole[] = ["owner", "admin", "editor"];

export type BusinessContext = {
  userId: string;
  businessId: string;
  role: MembershipRole;
  isOwner: boolean;
  isAdmin: boolean;
  canWriteBusinessData: boolean;
  canDeleteBusinessData: boolean;
  usesLegacyUserScope: boolean;
};

type MembershipRow = {
  business_id: string;
  role: string;
};

type BusinessRow = {
  id: string;
  owner_id: string;
};

function fallbackLegacyContext(userId: string): BusinessContext {
  return {
    userId,
    businessId: userId,
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: true,
  };
}

export function isBusinessAdminRole(role: MembershipRole): boolean {
  return role === "owner" || role === "admin";
}

export function canDeleteBusinessData(role: MembershipRole): boolean {
  return BUSINESS_DELETE_ROLES.includes(role);
}

export function canWriteBusinessData(role: MembershipRole): boolean {
  return BUSINESS_WRITE_ROLES.includes(role);
}

export function assertNoBusinessIdOverride(
  requestedBusinessId: unknown,
  context: BusinessContext,
): void {
  if (
    requestedBusinessId === undefined ||
    requestedBusinessId === null ||
    requestedBusinessId === ""
  ) {
    return;
  }

  const normalizedBusinessId = String(requestedBusinessId).trim();
  if (!normalizedBusinessId) {
    return;
  }

  const expectedBusinessId = context.usesLegacyUserScope
    ? context.userId
    : context.businessId;

  if (normalizedBusinessId !== expectedBusinessId) {
    throw new UnauthorizedError(
      "You cannot write data into another business workspace.",
    );
  }
}

function buildBusinessCapabilities(role: MembershipRole) {
  const isOwner = role === "owner";
  const isAdmin = isBusinessAdminRole(role);

  return {
    isOwner,
    isAdmin,
    canWriteBusinessData: canWriteBusinessData(role),
    canDeleteBusinessData: canDeleteBusinessData(role),
  };
}

function normalizeMembershipRole(role: string): MembershipRole {
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "editor") return "editor";
  if (role === "member") return "member";
  return "member";
}

function isTenantSchemaMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    (lower.includes("could not find the table") &&
      (lower.includes("public.memberships") ||
        lower.includes("public.businesses"))) ||
    (lower.includes("column") && lower.includes("business_id"))
  );
}

export function getTenantScopeColumn(
  context: BusinessContext,
): "business_id" | "user_id" {
  return context.usesLegacyUserScope ? "user_id" : "business_id";
}

export function getTenantScopeId(context: BusinessContext): string {
  return context.usesLegacyUserScope ? context.userId : context.businessId;
}

function buildDefaultBusinessName(session: NonNullable<Session>): string {
  const candidate =
    session.user?.name?.trim() || session.user?.email?.trim() || "My Business";
  return `${candidate} Business`;
}

async function findMembership(
  db: SupabaseClient,
  userId: string,
): Promise<MembershipRow | null> {
  const { data, error } = await db
    .from("memberships")
    .select("business_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isTenantSchemaMissingError(error.message)) {
      return null;
    }
    throw new Error(`Failed to load business membership: ${error.message}`);
  }

  return data;
}

async function ensureOwnerBusiness(
  db: SupabaseClient,
  userId: string,
  fallbackName: string,
): Promise<BusinessRow> {
  const { data: existingBusiness, error: existingBusinessError } = await db
    .from("businesses")
    .select("id, owner_id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingBusinessError) {
    throw new Error(
      `Failed to lookup owner business: ${existingBusinessError.message}`,
    );
  }

  if (existingBusiness) {
    return existingBusiness;
  }

  const { data: createdBusiness, error: createBusinessError } = await db
    .from("businesses")
    .insert({ owner_id: userId, name: fallbackName.slice(0, 200) })
    .select("id, owner_id")
    .single();

  if (createBusinessError || !createdBusiness) {
    throw new Error(
      `Failed to create owner business: ${createBusinessError?.message ?? "Unknown error"}`,
    );
  }

  return createdBusiness;
}

export async function getBusinessContextForSession(
  db: SupabaseClient,
  session: NonNullable<Session>,
): Promise<BusinessContext> {
  const userId = session.user?.id;
  if (!userId) {
    throw new Error(
      "Cannot resolve business context without an authenticated user.",
    );
  }

  await ensurePublicUser(db, session);

  const existingMembership = await findMembership(db, userId);
  if (!existingMembership) {
    try {
      const business = await ensureOwnerBusiness(
        db,
        userId,
        buildDefaultBusinessName(session),
      );

      const { error: membershipError } = await db.from("memberships").upsert(
        {
          business_id: business.id,
          user_id: userId,
          role: "owner",
        },
        { onConflict: "business_id,user_id" },
      );

      if (membershipError) {
        if (isTenantSchemaMissingError(membershipError.message)) {
          return fallbackLegacyContext(userId);
        }
        throw new Error(
          `Failed to create owner membership: ${membershipError.message}`,
        );
      }

      return {
        userId,
        businessId: business.id,
        role: "owner",
        ...buildBusinessCapabilities("owner"),
        usesLegacyUserScope: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isTenantSchemaMissingError(message)) {
        return fallbackLegacyContext(userId);
      }
      throw error;
    }
  }

  return {
    userId,
    businessId: existingMembership.business_id,
    role: normalizeMembershipRole(existingMembership.role),
    ...buildBusinessCapabilities(
      normalizeMembershipRole(existingMembership.role),
    ),
    usesLegacyUserScope: false,
  };
}

export async function getBusinessContextForUserId(
  db: SupabaseClient,
  userId: string,
): Promise<BusinessContext | null> {
  const membership = await findMembership(db, userId);
  if (membership) {
    const normalizedRole = normalizeMembershipRole(membership.role);
    return {
      userId,
      businessId: membership.business_id,
      role: normalizedRole,
      ...buildBusinessCapabilities(normalizedRole),
      usesLegacyUserScope: false,
    };
  }

  return fallbackLegacyContext(userId);
}

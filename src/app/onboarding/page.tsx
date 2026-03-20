import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { ensurePublicUser } from "@/lib/supabase/ensurePublicUser";
import { getNoIndexMetadata } from "@/seo";
import { routes } from "@routes";
import OnboardingClient from "./OnboardingClient";

export const metadata = getNoIndexMetadata(
  "Onboarding | Pro Construction Calc",
  "Private onboarding flow for new Pro Construction Calc accounts.",
);

function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeNextPath(candidate: string | undefined): string {
  if (!candidate) return routes.commandCenter;
  if (!candidate.startsWith("/")) return routes.commandCenter;
  if (candidate.startsWith("/auth/signin")) return routes.commandCenter;
  return candidate;
}

function getExactSupabaseErrorString(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return String(error);
}

function buildOnboardingErrorRedirectUrl({
  targetPath,
  code,
  details,
  mode,
}: {
  targetPath: string;
  code: string;
  details?: string;
  mode?: string;
}): Route {
  const params = new URLSearchParams({ next: targetPath, error: code });
  if (details) params.set("errorDetails", details);
  if (mode) params.set("mode", mode);
  return `/onboarding?${params.toString()}` as Route;
}

function getOnboardingErrorMessage(
  code: string | undefined,
  details: string | undefined,
): string | null {
  if (!code) return null;
  const detailSuffix = details ? ` (${details})` : "";
  if (code === "business_name_required") return "Please enter a business name.";
  if (code === "create_business_failed")
    return `Could not create your business profile: ${details ?? "unknown error"}.`;
  if (code === "create_membership_failed")
    return `Could not attach your account to the new business: ${details ?? "unknown error"}.`;
  return `Setup failed. Please try again${detailSuffix}.`;
}

async function resolveUserId() {
  const session = await auth();
  if (!session?.user) return { session: null, userId: null };

  if (session.user.id) return { session, userId: session.user.id };

  const email = session.user.email;
  if (!email) return { session, userId: null };

  const db = createServerClient();
  const { data: fallbackUser } = await db
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return { session, userId: fallbackUser?.id ?? null };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
    errorDetails?: string | string[];
    mode?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getFirstValue(params.next));
  const errorCode = getFirstValue(params.error);
  const errorDetails = getFirstValue(params.errorDetails);
  const setupError = getOnboardingErrorMessage(errorCode, errorDetails);

  // mode=join → crew join flow; default → owner setup
  const rawMode = getFirstValue(params.mode);
  const mode: "owner" | "join" = rawMode === "join" ? "join" : "owner";

  const { session, userId } = await resolveUserId();

  if (!session?.user) {
    const next = encodeURIComponent("/onboarding");
    redirect(`${routes.auth.signIn}?next=${next}&callbackUrl=${next}`);
  }

  if (!userId) {
    // No user id resolved — show clean light error state
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h2 className="text-xl font-black uppercase text-slate-900">Account Not Ready</h2>
          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t resolve your account. Please sign out and sign back in.
          </p>
        </div>
      </main>
    );
  }

  const db = createServerClient().schema("public");
  const { data: existingMembership } = await db
    .from("memberships")
    .select("business_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMembership?.business_id) {
    redirect(nextPath as Route);
  }

  // ── Server actions ───────────────────────────────────────────────────────

  async function createBusinessProfileAction(formData: FormData) {
    "use server";

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath: routes.commandCenter,
          code: "create_business_failed",
          details: "Unauthorized",
          mode: "owner",
        }),
      );
    }

    const nextCandidate = formData.get("next");
    const targetPath = getSafeNextPath(
      typeof nextCandidate === "string" ? nextCandidate : undefined,
    );

    const businessNameRaw = formData.get("businessName");
    const businessName =
      typeof businessNameRaw === "string" ? businessNameRaw.trim() : "";

    if (!businessName) {
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "business_name_required",
          mode: "owner",
        }),
      );
    }

    const serviceDb = createServerClient();
    const publicDb = serviceDb.schema("public");

    try {
      await ensurePublicUser(serviceDb, session);
    } catch (error) {
      console.error("[onboarding] Failed to ensure public user", { userId, error });
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "create_business_failed",
          details: "We could not finish setting up your account. Please try again.",
          mode: "owner",
        }),
      );
    }

    const { data: currentMembership, error: currentMembershipError } = await publicDb
      .from("memberships")
      .select("business_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (currentMembershipError) {
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "create_business_failed",
          details: getExactSupabaseErrorString(currentMembershipError),
          mode: "owner",
        }),
      );
    }

    if (currentMembership?.business_id) {
      redirect(targetPath as Route);
    }

    let createdBusinessId: string | null = null;

    try {
      const { data: business, error: businessError } = await publicDb
        .from("businesses")
        .insert({ owner_id: userId, name: businessName.slice(0, 200) })
        .select("id")
        .single();

      if (businessError || !business?.id) {
        throw businessError ?? new Error("Business insert returned no id.");
      }

      createdBusinessId = business.id;

      const { error: membershipError } = await publicDb
        .from("memberships")
        .insert({ business_id: business.id, user_id: userId, role: "owner" });

      if (membershipError) throw membershipError;

      const { error: profileError } = await publicDb
        .from("business_profiles")
        .upsert(
          { user_id: userId, business_id: business.id, business_email: null },
          { onConflict: "business_id" },
        );

      if (profileError) throw profileError;
    } catch (error) {
      if (createdBusinessId) {
        const rollbackResult = await publicDb
          .from("businesses")
          .delete()
          .eq("id", createdBusinessId);
        if (rollbackResult.error) {
          console.error("[onboarding] Rollback failed", { userId, businessId: createdBusinessId, rollbackError: rollbackResult.error });
        }
      }

      console.error("[onboarding] Failed to create business profile", { userId, error });
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "create_business_failed",
          details: getExactSupabaseErrorString(error),
          mode: "owner",
        }),
      );
    }

    redirect(targetPath as Route);
  }

  return (
    <OnboardingClient
      mode={mode}
      nextPath={nextPath}
      setupError={setupError}
      createBusinessAction={createBusinessProfileAction}
    />
  );
}

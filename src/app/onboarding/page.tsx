import type { Route } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { ensurePublicUser } from "@/lib/supabase/ensurePublicUser";
import { getNoIndexMetadata } from "@/seo";
import { routes } from "@routes";

export const metadata = getNoIndexMetadata(
  "Onboarding | Pro Construction Calc",
  "Private onboarding flow for new Pro Construction Calc accounts.",
);

function getFirstValue(
  value: string | string[] | undefined,
): string | undefined {
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
}: {
  targetPath: string;
  code: string;
  details?: string;
}): Route {
  const params = new URLSearchParams({
    next: targetPath,
    error: code,
  });

  if (details) {
    params.set("errorDetails", details);
  }

  return `/onboarding?${params.toString()}` as Route;
}

function getOnboardingErrorMessage(
  code: string | undefined,
  details: string | undefined,
): string | null {
  if (!code) return null;

  const detailSuffix = details ? ` (${details})` : "";

  if (code === "business_name_required") {
    return "Please enter a business name.";
  }

  if (code === "create_business_failed") {
    return `Could not create your business profile: ${details ?? "unknown error"}.`;
  }

  if (code === "create_membership_failed") {
    return `Could not attach your account to the new business: ${details ?? "unknown error"}.`;
  }

  return `Setup failed. Please try again${detailSuffix}.`;
}

function NoBusinessFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F0F10] text-white">
      <h2 className="mb-4 text-2xl font-black uppercase">No Business Found</h2>
      <p className="text-white/60">
        Your account does not belong to a business yet.
      </p>
    </div>
  );
}

async function resolveUserId() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, userId: null };
  }

  if (session.user.id) {
    return { session, userId: session.user.id };
  }

  const email = session.user.email;
  if (!email) {
    return { session, userId: null };
  }

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
  }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getFirstValue(params.next));
  const errorCode = getFirstValue(params.error);
  const errorDetails = getFirstValue(params.errorDetails);
  const setupError = getOnboardingErrorMessage(errorCode, errorDetails);

  const { session, userId } = await resolveUserId();

  if (!session?.user) {
    const next = encodeURIComponent("/onboarding");
    redirect(`${routes.auth.signIn}?next=${next}&callbackUrl=${next}`);
  }

  if (!userId) {
    return <NoBusinessFound />;
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
        }),
      );
    }

    const serviceDb = createServerClient();
    const publicDb = serviceDb.schema("public");

    await ensurePublicUser(serviceDb, session);

    const { data: currentMembership, error: currentMembershipError } =
      await publicDb
        .from("memberships")
        .select("business_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (currentMembershipError) {
      const details = getExactSupabaseErrorString(currentMembershipError);
      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "create_business_failed",
          details,
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
        .insert({
          owner_id: userId,
          name: businessName.slice(0, 200),
        })
        .select("id")
        .single();

      if (businessError || !business?.id) {
        throw businessError ?? new Error("Business insert returned no id.");
      }

      createdBusinessId = business.id;

      const { error: membershipError } = await publicDb
        .from("memberships")
        .insert({
          business_id: business.id,
          user_id: userId,
          role: "owner",
        });

      if (membershipError) {
        throw membershipError;
      }

      const { error: profileError } = await publicDb
        .from("business_profiles")
        .upsert(
          {
            user_id: userId,
            business_id: business.id,
            business_email: null,
          },
          { onConflict: "business_id" },
        );

      if (profileError) {
        throw profileError;
      }
    } catch (error) {
      if (createdBusinessId) {
        const rollbackResult = await publicDb
          .from("businesses")
          .delete()
          .eq("id", createdBusinessId);

        if (rollbackResult.error) {
          console.error("[onboarding] Rollback failed", {
            userId,
            businessId: createdBusinessId,
            rollbackError: rollbackResult.error,
          });
        }
      }

      const details = getExactSupabaseErrorString(error);

      console.error("[onboarding] Failed to create business profile", {
        userId,
        details,
        error,
      });

      redirect(
        buildOnboardingErrorRedirectUrl({
          targetPath,
          code: "create_business_failed",
          details,
        }),
      );
    }

    redirect(targetPath as Route);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center bg-[#0F0F10] px-4 py-12 sm:px-6">
      <section className="w-full rounded-2xl border border-white/10 bg-[#1A1A1C] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#FF8C00]">
          Command Center Setup
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase text-white">
          Create Your Business Profile
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Your account is authenticated. Finish setup by creating your first
          business workspace.
        </p>

        {setupError && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-950/45 px-3 py-2 text-sm text-red-200">
            {setupError}
          </p>
        )}

        <form action={createBusinessProfileAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <label className="flex flex-col gap-1 text-sm text-white/70">
            Business Name
            <input
              name="businessName"
              type="text"
              required
              placeholder="Acme Construction"
              className="h-11 rounded-lg border border-white/10 bg-[#0F0F10] px-3 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-[#FF8C00]"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#FF8C00] px-5 text-sm font-black uppercase text-white transition hover:brightness-95"
          >
            Create Business Profile
          </button>
        </form>
      </section>
    </main>
  );
}

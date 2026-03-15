import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createServerClient } from "@/lib/supabase/server";
import { routes } from "@routes";
import CommandCenterClient from "./CommandCenterClient";

const EMERGENCY_USER_ID = "4db07839-3524-4df7-ad82-184c5230bd01";

type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
};

function getSetupErrorMessage(
  code: string | undefined,
  details: string | undefined,
): string | null {
  if (!code) return null;

  if (code === "business_name_required") {
    return "Please enter a business name.";
  }

  if (code === "create_business_failed") {
    return `Could not create your business profile: ${details ?? "unknown error"}.`;
  }

  if (code === "create_membership_failed") {
    return `Could not attach your account to the new business: ${details ?? "unknown error"}.`;
  }

  return `Setup failed. Please try again${details ? ` (${details})` : ""}.`;
}

function getRawSupabaseErrorDetails(error: unknown): string {
  if (error && typeof error === "object") {
    return JSON.stringify(error);
  }

  return String(error);
}

function buildCommandCenterErrorRedirect({
  code,
  details,
}: {
  code: string;
  details?: string;
}): Route {
  const params = new URLSearchParams({
    setupError: code,
  });

  if (details) {
    params.set("setupErrorDetails", details);
  }

  return `${routes.commandCenter}?${params.toString()}` as Route;
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

async function createBusinessFromCommandCenterAction(formData: FormData) {
  "use server";

  const businessNameRaw = formData.get("businessName");
  const businessName =
    typeof businessNameRaw === "string" ? businessNameRaw.trim() : "";

  if (!businessName) {
    redirect(
      buildCommandCenterErrorRedirect({ code: "business_name_required" }),
    );
  }

  const db = createServerClient();
  const publicDb = db.schema("public");

  const { data: existingMembership, error: existingMembershipError } =
    await publicDb
      .from("memberships")
      .select("business_id")
      .eq("user_id", EMERGENCY_USER_ID)
      .maybeSingle();

  if (existingMembershipError) {
    redirect(
      buildCommandCenterErrorRedirect({
        code: "create_business_failed",
        details: getRawSupabaseErrorDetails(existingMembershipError),
      }),
    );
  }

  if (existingMembership?.business_id) {
    redirect(routes.commandCenter);
  }

  let createdBusinessId: string | null = null;

  try {
    const { data: business, error: businessError } = await publicDb
      .from("businesses")
      .insert({
        owner_id: EMERGENCY_USER_ID,
        name: businessName.slice(0, 200),
      })
      .select("id")
      .single();

    if (businessError || !business?.id) {
      throw businessError ?? new Error("Business insert returned no row");
    }

    createdBusinessId = business.id;

    const { error: membershipError } = await publicDb
      .from("memberships")
      .insert({
        business_id: business.id,
        user_id: EMERGENCY_USER_ID,
        role: "owner",
      });

    if (membershipError) {
      throw membershipError;
    }
  } catch (error) {
    if (createdBusinessId) {
      await publicDb.from("businesses").delete().eq("id", createdBusinessId);
    }

    redirect(
      buildCommandCenterErrorRedirect({
        code: "create_business_failed",
        details: getRawSupabaseErrorDetails(error),
      }),
    );
  }

  redirect(routes.commandCenter);
}

function CommandCenterOnboarding({
  setupError,
}: {
  setupError: string | null;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-2xl border border-white/10 bg-[#1A1A1C] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#FF8C00]">
          Command Center Setup
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase text-white">
          Create Your Business
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Your account is signed in. Create a business to unlock the full
          dashboard.
        </p>

        {setupError && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-950/45 px-3 py-2 text-sm text-red-200">
            {setupError}
          </p>
        )}

        <form
          action={createBusinessFromCommandCenterAction}
          className="mt-5 space-y-4"
        >
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
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#FF8C00] px-5 text-sm font-black uppercase text-black transition hover:brightness-95"
          >
            Create Your Business
          </button>
        </form>
      </section>
    </div>
  );
}

function NotOwnerState() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-2xl border border-white/10 bg-[#1A1A1C] p-6 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-black uppercase text-white">
          Owner Access Required
        </h1>
        <p className="mt-2 text-sm text-white/60">
          You are signed in, but only business owners can manage the Command
          Center team tools.
        </p>
        <div className="mt-5">
          <Link
            href={routes.calculators}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#FF8C00]/50 bg-transparent px-4 text-sm font-black uppercase text-[#FF8C00] transition hover:bg-[#FF8C00]/10"
          >
            Go to Calculators
          </Link>
        </div>
      </section>
    </div>
  );
}

async function loadCommandCenterData(userId: string): Promise<{
  hasBusiness: boolean;
  isOwner: boolean;
  businessName: string;
  joinCode: string;
  members: TeamMember[];
}> {
  const db = createServerClient();

  const { data: membership } = await db
    .from("memberships")
    .select("business_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership?.business_id) {
    return {
      hasBusiness: false,
      isOwner: false,
      businessName: "",
      joinCode: "",
      members: [],
    };
  }

  const { data: business } = await db
    .from("businesses")
    .select("id, name")
    .eq("id", membership.business_id)
    .maybeSingle();

  if (!business?.id) {
    return {
      hasBusiness: false,
      isOwner: false,
      businessName: "",
      joinCode: "",
      members: [],
    };
  }

  const { data: memberships } = await db
    .from("memberships")
    .select("id, user_id, role, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  const memberUserIds = (memberships ?? []).map((row) => row.user_id);
  const { data: users } =
    memberUserIds.length > 0
      ? await db.from("users").select("id, name, email").in("id", memberUserIds)
      : {
          data: [] as {
            id: string;
            name: string | null;
            email: string | null;
          }[],
        };

  const userMap = new Map((users ?? []).map((row) => [row.id, row]));
  let joinCodeHash = 0;
  for (const char of business.id) {
    joinCodeHash = (joinCodeHash * 31 + char.charCodeAt(0)) % 1000000;
  }

  return {
    hasBusiness: true,
    isOwner: membership.role === "owner",
    businessName: business.name,
    joinCode: String(Math.abs(joinCodeHash)).padStart(6, "0"),
    members: (memberships ?? []).map((member) => {
      const user = userMap.get(member.user_id);
      return {
        membershipId: member.id,
        userId: member.user_id,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "Unknown Email",
        role: member.role,
        joinedAt: member.created_at,
      };
    }),
  };
}

export default async function CommandCenterPage({
  searchParams,
}: {
  searchParams: Promise<{
    setupError?: string | string[];
    setupErrorDetails?: string | string[];
  }>;
}) {
  const { session, userId } = await resolveUserId();

  if (!session?.user) {
    const next = encodeURIComponent(routes.commandCenter);
    redirect(`${routes.auth.signIn}?next=${next}&callbackUrl=${next}` as Route);
  }

  const params = await searchParams;
  const setupErrorCode = Array.isArray(params.setupError)
    ? params.setupError[0]
    : params.setupError;
  const setupErrorDetails = Array.isArray(params.setupErrorDetails)
    ? params.setupErrorDetails[0]
    : params.setupErrorDetails;
  const setupError = getSetupErrorMessage(setupErrorCode, setupErrorDetails);

  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0F0F10]">
        <Header />
        <main id="main-content" className="flex-1">
          <CommandCenterOnboarding setupError={setupError} />
        </main>
        <Footer />
      </div>
    );
  }

  const commandCenterData = await loadCommandCenterData(userId);

  if (!commandCenterData.hasBusiness) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0F0F10]">
        <Header />
        <main id="main-content" className="flex-1">
          <CommandCenterOnboarding setupError={setupError} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!commandCenterData.isOwner) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0F0F10]">
        <Header />
        <main id="main-content" className="flex-1">
          <NotOwnerState />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0F0F10]">
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-screen-xl flex-1 bg-[#0F0F10] px-4 py-6"
      >
        <CommandCenterClient
          businessName={commandCenterData.businessName}
          joinCode={commandCenterData.joinCode}
          initialMembers={commandCenterData.members}
        />
      </main>
      <Footer />
    </div>
  );
}

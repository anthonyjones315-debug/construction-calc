"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BrickWall,
  Calculator,
  Copy,
  FileText,
  Hammer,
  HardHat,
  Layout,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Settings,
  Thermometer,
  Triangle,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { routes } from "@routes";
import { CalculatorPage } from "@/app/calculators/_components/CalculatorPage";
import { getTradePageByPath } from "@/app/calculators/_lib/trade-pages";
import { useProMode } from "@/hooks/useProMode";

type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
};

type RecentEstimate = {
  id: string;
  name: string;
  clientName: string | null;
  status: string | null;
  updatedAt: string;
};

type CommandCenterClientProps = {
  businessName: string;
  joinCode: string;
  initialMembers: TeamMember[];
  recentEstimates: RecentEstimate[];
  needsBusinessProfileSetup: boolean;
  draftMode?: boolean;
  initialToolSlug?: string;
};

type NavItem = {
  label: string;
  href?: Route;
  icon: LucideIcon;
  active?: boolean;
  slug: string;
  description?: string;
};

const primaryNavItems: NavItem[] = [
  {
    label: "Home",
    slug: "dashboard",
    href: routes.commandCenter,
    icon: HardHat,
    active: true,
    description: "Dashboard overview",
  },
  {
    label: "Clients",
    slug: "clients",
    href: routes.saved,
    icon: Users,
    description: "Saved clients and contacts",
  },
  {
    label: "Settings",
    slug: "settings",
    href: routes.settings,
    icon: Settings,
    description: "Business profile & permissions",
  },
];

const toolNavItems: NavItem[] = [
  {
    label: "Slab Thickness (Inches)",
    slug: "slab-thickness",
    href: "/calculators/concrete/slab" as Route,
    icon: BrickWall,
    description: "Compute slab thickness in inches and convert to volume.",
  },
  {
    label: "Running Lineal Feet",
    slug: "running-lineal-feet",
    href: "/calculators/concrete/block" as Route,
    icon: BrickWall,
    description: "Quick lineal foot math for footings and block walls.",
  },
  {
    label: "Cubic Yards",
    slug: "cubic-yards",
    href: "/calculators/concrete/slab" as Route,
    icon: BarChart3,
    description: "Translate area and thickness into cubic yard totals.",
  },
  {
    label: "Estimates",
    slug: "estimates",
    href: routes.saved,
    icon: FileText,
    description: "Saved proposals and contracts",
  },
  {
    label: "Trade Modules",
    slug: "trade-modules",
    href: routes.calculators,
    icon: HardHat,
    description: "Modular trade calculator hub",
  },
  {
    label: "Concrete & Masonry",
    slug: "masonry",
    href: "/calculators/concrete" as Route,
    icon: BrickWall,
    description: "Concrete pours, slabs, and masonry packs",
  },
  {
    label: "Framing & Lumber",
    slug: "framing",
    href: "/calculators/framing" as Route,
    icon: Hammer,
    description: "Dimension lumber, rafters, and studs",
  },
  {
    label: "Roofing & Siding",
    slug: "roofing",
    href: "/calculators/roofing" as Route,
    icon: Triangle,
    description: "Roofing pitches, coverage & siding",
  },
  {
    label: "Mechanical & Site",
    slug: "mechanical",
    href: "/calculators/mechanical" as Route,
    icon: Thermometer,
    description: "HVAC, ductwork, and equipment math",
  },
  {
    label: "Interior",
    slug: "interior",
    href: "/calculators/interior" as Route,
    icon: Layout,
    description: "Finish, trim, and interior trades",
  },
  {
    label: "Business",
    slug: "business",
    href: "/calculators/business" as Route,
    icon: BarChart3,
    description: "Profit, leads, workforce controls",
  },
  {
    label: "Calculator Library",
    slug: "calculator-library",
    href: routes.calculators,
    icon: Calculator,
    description: "Browse every field calculator",
  },
];

function formatRole(role: string): string {
  return role === "owner" ? "Owner" : "Member";
}

function formatJoinedAt(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialsForName(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "TM";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function formatEstimateStatus(status: string | null) {
  if (status === "SIGNED" || status === "Approved") return "Signed";
  if (status === "PENDING" || status === "Sent") return "Sent";
  return "Draft";
}

function estimateStatusClasses(status: string | null) {
  if (status === "SIGNED" || status === "Approved") {
    return "border-emerald-500/30 bg-emerald-500/12 text-emerald-300";
  }
  if (status === "PENDING" || status === "Sent") {
    return "border-orange-500/30 bg-orange-500/12 text-orange-300";
  }
  return "border-slate-700 bg-slate-800/80 text-slate-300";
}

export default function CommandCenterClient({
  businessName,
  joinCode,
  initialMembers,
  recentEstimates,
  needsBusinessProfileSetup,
  draftMode = false,
  initialToolSlug,
}: CommandCenterClientProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manageTargetId, setManageTargetId] = useState<string | null>(null);
  const [activeJoinCode, setActiveJoinCode] = useState(joinCode);
  const [isRefreshingInvite, setIsRefreshingInvite] = useState(false);
  const [activeTool, setActiveTool] = useState<NavItem | null>(null);
  const [toolFilter, setToolFilter] = useState("");
  const [handledDeepLink, setHandledDeepLink] = useState<string | null>(null);
  const { proMode, setProMode, mounted: proModeMounted } = useProMode();
  const searchParams = useSearchParams();
  const toolFromQuery = searchParams.get("tool") ?? initialToolSlug;

  const manageTarget = useMemo(
    () =>
      members.find((member) => member.membershipId === manageTargetId) ?? null,
    [members, manageTargetId],
  );

  const planName = "Pro Team";
  const seatLimit = 10;
  const seatsUsed = members.length;
  const seatsAvailable = Math.max(seatLimit - seatsUsed, 0);
  const normalizedFilter = toolFilter.trim().toLowerCase();
  const filteredToolItems = normalizedFilter
    ? toolNavItems.filter((item) => {
        const haystack = [
          item.label,
          item.slug,
          item.description ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedFilter);
      })
    : toolNavItems;
  const toolFromQuerySlug = toolFromQuery?.toLowerCase() ?? "";
  const activeToolHref = typeof activeTool?.href === "string" ? activeTool.href : null;
  const activeTradePage = activeToolHref ? getTradePageByPath(activeToolHref) : undefined;

  useEffect(() => {
    if (!toolFromQuerySlug) return;
    if (handledDeepLink === toolFromQuerySlug) return;
    const match = toolNavItems.find((entry) => entry.slug === toolFromQuerySlug);
    if (match) {
      setActiveTool(match);
      setHandledDeepLink(toolFromQuerySlug);
    }
  }, [toolFromQuerySlug, handledDeepLink]);

  async function refreshInviteCode() {
    if (isRefreshingInvite) return;
    setError(null);
    setSuccess(null);
    setIsRefreshingInvite(true);

    try {
      const response = await fetch("/api/command-center", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to refresh the invite code.");
      }

      const nextCode = payload.business?.joinCode ?? activeJoinCode;
      setActiveJoinCode(nextCode);

      if (Array.isArray(payload.members)) {
        setMembers(
          payload.members.map((member: TeamMember) => ({
            membershipId: member.membershipId,
            userId: member.userId,
            name: member.name,
            email: member.email,
            role: member.role,
            joinedAt: member.joinedAt,
          })),
        );
      }

      setSuccess("Invite code refreshed.");
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to refresh the invite code.",
      );
    } finally {
      setIsRefreshingInvite(false);
    }
  }

  async function copyJoinCode() {
    setError(null);
    setSuccess(null);

    try {
      await navigator.clipboard.writeText(activeJoinCode);
      setSuccess("Invite code copied.");
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? copyError.message
          : "Unable to copy the invite code.",
      );
    }
  }

  async function updateRole(memberId: string, role: "owner" | "member") {
    setBusyMemberId(memberId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/command-center/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to update member role.");
      }

      setMembers((current) =>
        current.map((member) =>
          member.membershipId === memberId ? { ...member, role } : member,
        ),
      );
      setSuccess("Member role updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update member role.",
      );
    } finally {
      setBusyMemberId(null);
      setManageTargetId(null);
    }
  }

  async function removeMember(memberId: string) {
    setBusyMemberId(memberId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/command-center/members/${memberId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to remove team member.");
      }

      setMembers((current) =>
        current.filter((member) => member.membershipId !== memberId),
      );
      setSuccess("Team member removed.");
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Failed to remove team member.",
      );
    } finally {
      setBusyMemberId(null);
      setManageTargetId(null);
    }
  }

  return (
    <div className="command-theme w-full overflow-hidden rounded-none border border-slate-800 bg-slate-950 shadow-[0_20px_48px_rgba(0,0,0,0.45)] sm:rounded-[30px]">
      <div className="grid min-h-[720px] lg:grid-cols-[240px,1fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-950 px-2 py-2 text-slate-300 lg:flex lg:flex-col">
          <div className="flex items-center gap-1.5 rounded-xl px-1.5 py-1">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[--color-orange-brand] text-xs font-bold text-white">
              P
            </div>
            <p className="truncate text-xs font-semibold text-white">
              Pro Construction Calc
            </p>
          </div>

          <nav className="mt-2 flex flex-col gap-0.5">
            {primaryNavItems.map((item) => {
              const sharedClasses =
                "flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-left text-sm font-semibold tracking-tight transition-colors";
              const stateClasses = item.active
                ? "bg-slate-900 border-slate-800 text-orange-600"
                : "text-slate-300 hover:bg-slate-900 hover:border-slate-800 hover:text-white";
              const className = `${sharedClasses} ${stateClasses}`;

              const navContent = (
                <>
                  <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </>
              );

              return (
                <Link key={item.label} href={item.href ?? routes.commandCenter} className={className}>
                  {navContent}
                </Link>
              );
            })}

          <div className="mt-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Tools
          </div>
          <div className="px-2 pt-2">
            <label
              htmlFor="command-center-tool-search"
              className="sr-only"
            >
              Search tools
            </label>
            <input
              id="command-center-tool-search"
              type="text"
              value={toolFilter}
              onChange={(event) => setToolFilter(event.target.value)}
              placeholder="Search tools"
              className="w-full rounded-xl border border-slate-500 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {filteredToolItems.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">
              No tools match that term.
            </div>
          ) : (
            filteredToolItems.map((item) => {
              const sharedClasses =
                "flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-left text-sm font-medium transition-colors";
              const className = `${sharedClasses} text-slate-300 hover:bg-slate-900 hover:border-slate-800 hover:text-white`;
              const href = item.href ?? routes.commandCenter;
              const opensCalculatorModal =
                typeof href === "string" && Boolean(getTradePageByPath(href));

              const navContent = (
                <>
                  <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </>
              );

              if (opensCalculatorModal && typeof href === "string") {
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setActiveTool(item)}
                    className={className}
                  >
                    {navContent}
                  </button>
                );
              }

            return (
              <Link key={item.label} href={href} className={className}>
                {navContent}
              </Link>
            );
            })
          )}
        </nav>

          <div className="mt-auto border-t border-slate-800 pt-2">
            <p className="px-2 text-[10px] text-white/65">
              Team access and permissions managed in Command Center.
            </p>
          </div>
        </aside>

        <section className="bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 sm:px-6">
            <p className="text-base font-black uppercase tracking-[0.12em] text-white">
              Dashboard
            </p>
            <div className="flex items-center gap-3">
              {proModeMounted ? (
                <button
                  type="button"
                  onClick={() => setProMode(!proMode)}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                    proMode
                      ? "border-orange-500/70 bg-orange-500/20 text-orange-400"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                  aria-pressed={proMode}
                >
                  Pro Mode
                </button>
              ) : null}
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid] transition hover:text-[--color-orange-brand]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[--color-orange-brand]" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-xs font-semibold text-[--color-ink-mid]">
                {initialsForName(members[0]?.name ?? "Owner")}
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 py-4 w-full max-w-full sm:px-6 sm:py-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Owner Controls Enabled
              </div>
              <span className="text-xs text-[--color-ink-dim]">
                Live status
              </span>
            </div>

            <h1 className="text-xl font-sans font-black uppercase leading-none tracking-tight text-white sm:text-3xl lg:text-[2.25rem]">
              Owner&apos;s Command Center
            </h1>

            {needsBusinessProfileSetup ? (
              <div className="rounded-2xl border border-orange-500/25 bg-orange-500/8 px-4 py-3 text-sm text-slate-200">
                <span className="font-semibold text-orange-300">
                  Setup your Business Profile.
                </span>{" "}
                Add your company name so PDFs, emails, and client-facing signing pages use your branding.
                <Link
                  href={routes.settings}
                  className="ml-2 font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  Open settings
                </Link>
              </div>
            ) : null}

            {draftMode && (
              <div className="rounded-2xl border border-[--color-orange-brand]/50 bg-[--color-orange-brand]/10 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                  Drafting mode
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Start a new estimate: open a trade calculator below or go to Saved Estimates to continue an existing draft.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={routes.calculators}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[--color-orange-brand] px-4 text-sm font-black text-white transition hover:bg-orange-700"
                  >
                    Open Calculators
                  </Link>
                  <Link
                    href={routes.saved}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-600 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Saved Estimates
                  </Link>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-slate-100">
                <h2 className="font-sans text-2xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">
                  Your Business Team
                </h2>
                <p className="mt-2 break-all text-sm text-white/60">
                  Business Name: {businessName} | Plan: {planName} ({seatsUsed}/
                  {seatLimit} Seats)
                </p>
              </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-100">
                <p className="text-sm font-black uppercase text-white">
                  Invite New Members
                </p>
                <p className="mt-1 text-center text-xs uppercase tracking-[0.22em] text-white/80">
                  Join Code
                </p>
                <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-center text-4xl font-sans font-black tracking-[0.14em] text-orange-600 md:text-5xl">
                  {activeJoinCode}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={copyJoinCode}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[--color-orange-brand] bg-[--color-orange-brand] px-2 py-2 font-bold text-white shadow-lg transition hover:bg-[--color-orange-dark]"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy Code
                  </button>
                  <button
                    type="button"
                    onClick={refreshInviteCode}
                    disabled={isRefreshingInvite}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border-2 border-orange-400 bg-transparent px-2 py-2 text-orange-300 transition hover:bg-orange-500/10 disabled:opacity-60"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    {isRefreshingInvite ? "Refreshing" : "Regenerate Code"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-white/70">
                  Seats remaining: {seatsAvailable} / {seatLimit}
                </p>
              </div>
            </div>

            {(error || success) && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm shadow ${
                  error
                    ? "border-red-500/25 bg-red-500/8"
                    : "border-emerald-500/25 bg-emerald-500/8"
                }`}
              >
                {error ? (
                  <p className="text-red-200">{error}</p>
                ) : (
                  <p className="text-emerald-200">{success}</p>
                )}
              </div>
            )}

            <div className="command-card space-y-4 p-5 xl:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                    Recent Estimates
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
                    Latest Activity
                  </h2>
                </div>
                <Link
                  href={routes.saved}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  View All
                </Link>
              </div>

              {recentEstimates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-5 text-sm text-slate-400">
                  No estimates yet. Start a draft from any calculator and it will appear here.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {recentEstimates.map((estimate) => (
                    <Link
                      key={estimate.id}
                      href={`${routes.saved}?id=${estimate.id}`}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                      aria-label={`Open estimate ${estimate.name}`}
                      prefetch={false}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {estimate.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {estimate.clientName || "No client name"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${estimateStatusClasses(estimate.status)}`}
                        >
                          {formatEstimateStatus(estimate.status)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Updated{" "}
                        {new Date(estimate.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="command-card space-y-4 p-0 xl:col-span-3">
              <div className="border-b border-[--color-border] px-5 py-4 text-xl font-sans font-black uppercase tracking-tight text-white">
                Current Team Members
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[--color-surface-alt] text-left text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[--color-ink-dim]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Join Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const isOwner = member.role === "owner";
                      return (
                        <tr
                          key={member.membershipId}
                          className="border-t border-[--color-border]/70 bg-[--color-surface] text-[--color-ink]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[11px] font-semibold text-[--color-ink-mid]">
                                {initialsForName(member.name)}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-[--color-ink-dim]">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                                isOwner
                                  ? "border-[--color-orange-brand] bg-[--color-orange-brand]/14 text-[--color-orange-brand]"
                                  : "border-[--color-border] bg-[--color-surface-alt] px-3 py-1 text-[--color-ink-mid]"
                              }`}
                            >
                              {formatRole(member.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[--color-ink-mid]">
                              {formatJoinedAt(member.joinedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isOwner ? (
                              <span className="text-xs text-[--color-ink-dim]">
                                Owner protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setManageTargetId(member.membershipId)
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[--color-ink-mid] transition hover:border-[--color-border] hover:bg-[--color-surface-alt] hover:text-[--color-ink]"
                                aria-label={`Manage ${member.name}`}
                              >
                                <MoreHorizontal
                                  className="h-4 w-4"
                                  aria-hidden
                                />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
      </section>
      </div>

      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:px-4 sm:py-4">
          <button
            type="button"
            onClick={() => setActiveTool(null)}
            className="absolute inset-0 bg-black/60"
          />
          {activeTradePage ? (
            <div className="relative z-10 flex h-full w-full max-w-6xl flex-col overflow-hidden border border-slate-800 bg-slate-950 shadow-[0_24px_50px_rgba(0,0,0,0.6)] sm:rounded-3xl">
              <div className="sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/95 px-3 backdrop-blur-sm">
                <nav className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Calculators &gt; {activeTradePage.heroKicker.split("/")[0]?.trim() ?? "Category"}
                </nav>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-700 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-200 transition hover:border-orange-600 hover:text-white"
                  >
                    Back
                  </button>
                  <p className="max-w-[220px] truncate text-xs font-black uppercase tracking-[0.08em] text-white">
                    {activeTradePage.heroKicker}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-orange-600 hover:text-white"
                    aria-label="Close calculator modal"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-950">
                <CalculatorPage page={activeTradePage} />
              </div>
            </div>
          ) : (
            <div className="relative z-10 ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-tl-3xl rounded-bl-3xl border border-slate-800 bg-slate-900 shadow-[0_24px_50px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Tool Details
                  </p>
                  <p className="text-lg font-black uppercase tracking-tight text-white">
                    {activeTool.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
                  className="rounded-full border border-slate-800 p-1 text-slate-300 transition hover:border-orange-600 hover:text-white"
                  aria-label="Close tool detail pane"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-slate-300">
                <p className="text-slate-400">
                  {activeTool.description ??
                    "Field-ready figures, templates, and workflow context for this tool."}
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href={activeTool.href ?? routes.commandCenter}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[--color-orange-brand] bg-[--color-orange-brand] px-4 py-2 text-sm font-black uppercase text-white transition hover:bg-orange-700"
                  >
                    Open {activeTool.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-600 hover:text-white"
                  >
                    Close panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {manageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => (busyMemberId ? undefined : setManageTargetId(null))}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[--color-orange-muted]">
              Account Control
            </p>
            <h2 className="mt-1 text-xl font-sans font-extrabold tracking-tight text-white">
              {manageTarget.name}
            </h2>
            <p className="text-sm text-slate-400">{manageTarget.email}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateRole(manageTarget.membershipId, "member")}
                disabled={busyMemberId === manageTarget.membershipId}
                className="rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[--color-orange-brand] hover:bg-white/6 disabled:opacity-60"
              >
                Set Member
              </button>
              <button
                type="button"
                onClick={() => updateRole(manageTarget.membershipId, "owner")}
                disabled={busyMemberId === manageTarget.membershipId}
                className="rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[--color-orange-brand] hover:bg-white/6 disabled:opacity-60"
              >
                Promote Owner
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeMember(manageTarget.membershipId)}
              disabled={busyMemberId === manageTarget.membershipId}
              className="mt-4 w-full rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {busyMemberId === manageTarget.membershipId
                ? "Working…"
                : "Remove from Business"}
            </button>
            <button
              type="button"
              onClick={() => setManageTargetId(null)}
              disabled={busyMemberId === manageTarget.membershipId}
              className="mt-2 w-full rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[--color-orange-brand] hover:bg-white/6 disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

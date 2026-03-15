"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import { routes } from "@routes";

type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
};

type CommandCenterClientProps = {
  businessName: string;
  joinCode: string;
  initialMembers: TeamMember[];
};

type NavItem = {
  label: string;
  href?: Route;
  icon: LucideIcon;
  active?: boolean;
};

const primaryNavItems: NavItem[] = [
  { label: "Home", href: routes.commandCenter, icon: HardHat, active: true },
  { label: "Clients", icon: Users },
  { label: "Settings", href: routes.settings, icon: Settings },
];

const toolNavItems: NavItem[] = [
  { label: "Estimates", href: routes.saved, icon: FileText },
  { label: "Trade Modules", href: routes.calculators, icon: HardHat },
  {
    label: "Concrete & Masonry",
    href: "/calculators/concrete" as Route,
    icon: BrickWall,
  },
  {
    label: "Framing & Lumber",
    href: "/calculators/framing" as Route,
    icon: Hammer,
  },
  {
    label: "Roofing & Siding",
    href: "/calculators/roofing" as Route,
    icon: Triangle,
  },
  {
    label: "Mechanical & Site",
    href: "/calculators/mechanical" as Route,
    icon: Thermometer,
  },
  {
    label: "Interior",
    href: "/calculators/interior" as Route,
    icon: Layout,
  },
  {
    label: "Business",
    href: "/calculators/business" as Route,
    icon: BarChart3,
  },
  { label: "Calculators", href: routes.calculators, icon: Calculator },
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

export default function CommandCenterClient({
  businessName,
  joinCode,
  initialMembers,
}: CommandCenterClientProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manageTargetId, setManageTargetId] = useState<string | null>(null);
  const [activeJoinCode, setActiveJoinCode] = useState(joinCode);
  const [isRefreshingInvite, setIsRefreshingInvite] = useState(false);

  const manageTarget = useMemo(
    () =>
      members.find((member) => member.membershipId === manageTargetId) ?? null,
    [members, manageTargetId],
  );

  const planName = "Pro Team";
  const seatLimit = 10;
  const seatsUsed = members.length;
  const seatsAvailable = Math.max(seatLimit - seatsUsed, 0);

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

      setActiveJoinCode(payload.business?.joinCode ?? activeJoinCode);

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
    <div className="command-theme overflow-hidden rounded-[30px] border border-white/10 bg-[#1A1A1C] shadow-[0_20px_48px_rgba(0,0,0,0.45)]">
      <div className="grid min-h-[740px] lg:grid-cols-[240px,1fr]">
        <aside className="hidden border-r border-[--color-border]/70 bg-[--color-nav-bg] px-2 py-2 text-[--color-nav-text] lg:flex lg:flex-col">
          <div className="flex items-center gap-1.5 rounded-xl px-1.5 py-1">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[--color-orange-brand] text-xs font-bold text-black">
              P
            </div>
            <p className="truncate text-xs font-semibold text-white">
              Pro Construction Calc
            </p>
          </div>

          <nav className="mt-2 flex flex-col gap-0.5">
            {primaryNavItems.map((item) => {
              const sharedClasses =
                "flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors";
              const stateClasses = item.active
                ? "bg-white/10 text-[--color-orange-brand]"
                : "text-white/80 hover:bg-white/8 hover:text-white";
              const className = `${sharedClasses} ${stateClasses}`;

              const navContent = (
                <>
                  <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </>
              );

              return item.href ? (
                <Link key={item.label} href={item.href} className={className}>
                  {navContent}
                </Link>
              ) : (
                <div key={item.label} className={className}>
                  {navContent}
                </div>
              );
            })}

            <div className="mt-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Tools
            </div>

            {toolNavItems.map((item) => {
              const sharedClasses =
                "flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors";
              const className = `${sharedClasses} text-white/80 hover:bg-white/8 hover:text-white`;

              const navContent = (
                <>
                  <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </>
              );

              return item.href ? (
                <Link key={item.label} href={item.href} className={className}>
                  {navContent}
                </Link>
              ) : (
                <div key={item.label} className={className}>
                  {navContent}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-2">
            <p className="px-2 text-[10px] text-white/65">
              Team access and permissions managed in Command Center.
            </p>
          </div>
        </aside>

        <section className="bg-[#1A1A1C]">
          <div className="flex items-center justify-between border-b border-[--color-border]/80 px-6 py-4">
            <p className="text-base font-black uppercase tracking-[0.12em] text-white">
              Dashboard
            </p>
            <div className="flex items-center gap-3">
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

          <div className="space-y-5 px-6 py-6">
            <div className="command-card flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[--color-orange-brand]">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Owner Controls Enabled
              </div>
              <span className="text-xs text-[--color-ink-dim]">
                Live status
              </span>
            </div>

            <h1 className="text-[2rem] font-sans font-black uppercase leading-none tracking-tight text-white sm:text-[2.25rem]">
              Owner&apos;s Command Center
            </h1>

            <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
              <div className="command-card px-5 py-4">
                <h2 className="font-sans text-4xl font-black uppercase leading-none tracking-tight text-white">
                  Your Business Team
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Business Name: {businessName} | Plan: {planName} ({seatsUsed}/
                  {seatLimit} Seats)
                </p>
              </div>

              <div className="command-card p-4 text-white">
                <p className="text-sm font-black uppercase text-white">
                  Invite New Members
                </p>
                <p className="mt-1 text-center text-xs uppercase tracking-[0.22em] text-white/80">
                  Join Code
                </p>
                <div className="mt-2 rounded-xl border border-[--color-border] bg-[--color-surface] px-4 py-2 text-center text-4xl font-sans font-black tracking-[0.14em] text-[--color-orange-brand] md:text-5xl">
                  {activeJoinCode}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={copyJoinCode}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[--color-orange-brand] bg-[--color-orange-brand] px-2 py-2 text-black transition hover:bg-[--color-orange-dark]"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy Code
                  </button>
                  <button
                    type="button"
                    onClick={refreshInviteCode}
                    disabled={isRefreshingInvite}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[--color-orange-brand]/70 bg-transparent px-2 py-2 text-[--color-orange-brand] transition hover:bg-[--color-orange-brand]/10 disabled:opacity-60"
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

            <div className="command-card space-y-4 p-0">
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

      {manageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => (busyMemberId ? undefined : setManageTargetId(null))}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
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

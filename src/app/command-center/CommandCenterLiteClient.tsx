"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  Settings,
  Users,
  Wrench,
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

type RecentEstimate = {
  id: string;
  name: string;
  clientName: string | null;
  status: string | null;
  updatedAt: string;
};

type CommandCenterLiteClientProps = {
  businessName: string;
  joinCode: string;
  initialMembers: TeamMember[];
  recentEstimates: RecentEstimate[];
  needsBusinessProfileSetup: boolean;
  userRole: string;
};

function formatStatus(status: string | null) {
  if (status === "SIGNED" || status === "Approved") return "Signed";
  if (status === "PENDING" || status === "Sent") return "Sent";
  return "Draft";
}

function statusClass(status: string | null) {
  if (status === "SIGNED" || status === "Approved") {
    return "border-emerald-500/35 bg-emerald-500/12 text-emerald-700";
  }

  if (status === "PENDING" || status === "Sent") {
    return "border-orange-500/35 bg-orange-500/12 text-orange-700";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
}

function formatRole(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "editor") return "Editor";
  return "Member";
}

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "TM";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export default function CommandCenterLiteClient({
  businessName,
  joinCode,
  initialMembers,
  recentEstimates,
  needsBusinessProfileSetup,
  userRole,
}: CommandCenterLiteClientProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const signedCount = useMemo(
    () =>
      recentEstimates.filter(
        (estimate) =>
          estimate.status === "SIGNED" || estimate.status === "Approved",
      ).length,
    [recentEstimates],
  );

  const draftCount = useMemo(
    () =>
      recentEstimates.filter(
        (estimate) =>
          estimate.status !== "SIGNED" && estimate.status !== "Approved",
      ).length,
    [recentEstimates],
  );

  const quickLinks: Array<{
    label: string;
    href: Route;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      label: "Calculators",
      href: routes.calculators,
      description: "Open trade calculators fast.",
      icon: Calculator,
    },
    {
      label: "Saved Estimates",
      href: routes.saved,
      description: "Pick up active quotes.",
      icon: FileText,
    },
    {
      label: "Price Book",
      href: routes.pricebook,
      description: "Keep pricing consistent.",
      icon: ClipboardList,
    },
    {
      label: "Business Settings",
      href: routes.settings,
      description: "Update account and team setup.",
      icon: Settings,
    },
    {
      label: "Field Notes",
      href: routes.fieldNotes,
      description: "Use practical pro tips onsite.",
      icon: Wrench,
    },
    {
      label: "Operator Guide",
      href: routes.guide,
      description: "Follow the fastest workflow.",
      icon: CheckCircle2,
    },
  ];

  async function copyJoinCode() {
    if (!joinCode) return;

    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3">
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Command center
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              A clean, calculator-first workspace for daily estimating.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`${routes.commandCenter}?mode=draft`}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-orange-700"
            >
              New estimate
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={routes.calculators}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-orange-400 hover:text-orange-700"
            >
              Open calculators
            </Link>
          </div>
        </div>

        {needsBusinessProfileSetup ? (
          <p className="mt-3 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
            Business profile setup is incomplete. Update it from Business
            Settings to keep estimates client-ready.
          </p>
        ) : null}
      </article>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Team
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {initialMembers.length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Signed
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {signedCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Draft / Sent
          </p>
          <p className="mt-1 text-2xl font-black text-orange-700">
            {draftCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Role
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {formatRole(userRole)}
          </p>
        </article>
      </div>

      <div className="grid min-h-0 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
            Quick access
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={false}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-2 text-slate-900">
                    <Icon className="h-4 w-4 text-orange-600" aria-hidden />
                    <p className="text-sm font-semibold">{link.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {link.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
            Crew access
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Share this join code with trusted team members.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <p className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm font-bold tracking-[0.1em] text-slate-900">
              {joinCode || "—"}
            </p>
            <button
              type="button"
              onClick={copyJoinCode}
              disabled={!joinCode}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-50"
              aria-label="Copy join code"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {copyState === "copied" ? (
            <p className="mt-2 text-xs text-emerald-700">Join code copied.</p>
          ) : null}
          {copyState === "error" ? (
            <p className="mt-2 text-xs text-red-700">
              Could not copy join code.
            </p>
          ) : null}

          <div className="mt-4 space-y-2">
            {initialMembers.slice(0, 4).map((member) => (
              <div
                key={member.membershipId}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-700">
                  {initials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-600">
                    {member.email}
                  </p>
                </div>
                <p className="ml-auto rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                  {formatRole(member.role)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
            Recent estimates
          </p>
          <Link
            href={routes.saved}
            prefetch={false}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 transition hover:text-orange-700"
          >
            View all
          </Link>
        </div>

        {recentEstimates.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            No estimates yet. Start from Calculators and save your first draft.
          </p>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {recentEstimates.slice(0, 6).map((estimate) => (
              <Link
                key={estimate.id}
                href={`${routes.saved}?id=${estimate.id}`}
                prefetch={false}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-orange-300 hover:bg-orange-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {estimate.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-600">
                      {estimate.clientName || "No client"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClass(estimate.status)}`}
                  >
                    {formatStatus(estimate.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

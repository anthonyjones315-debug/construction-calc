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
  Wrench,
  BookOpen,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { routes, getEstimateDetailRoute } from "@routes";
import SignedEstimatesNotificationsClient from "./SignedEstimatesNotificationsClient";

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
    return "border-[--color-blue-brand]/35 bg-[--color-blue-brand]/12 text-[--color-blue-dark]";
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

const POPULAR_CALCULATORS: Array<{ label: string; href: Route }> = [
  { label: "Concrete Slab", href: "/calculators/concrete/slab" as Route },
  { label: "Wall Studs", href: "/calculators/framing/wall-studs" as Route },
  { label: "Roof Pitch", href: "/calculators/roofing/pitch-slope" as Route },
  { label: "Labor Rate", href: "/calculators/business/labor-rate" as Route },
  {
    label: "Profit Margin",
    href: "/calculators/business/profit-margin" as Route,
  },
  {
    label: "Shingle Bundles",
    href: "/calculators/roofing/shingle-bundles" as Route,
  },
];

const PRO_TIPS = [
  {
    tip: "Always add 10–15% waste factor to material takeoffs — especially on non-rectangular slabs and irregular roof planes.",
    href: routes.fieldNotes,
  },
  {
    tip: "Lock your labor rate before building an estimate. Start with Field Notes → Labor Rate to set a solid floor.",
    href: routes.fieldNotes,
  },
  {
    tip: "Send estimates as soon as they're ready — signed estimates start at 'Sent', not 'Draft'.",
    href: routes.guide,
  },
];

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

  const sentCount = useMemo(
    () =>
      recentEstimates.filter(
        (estimate) =>
          estimate.status === "PENDING" || estimate.status === "Sent",
      ).length,
    [recentEstimates],
  );

  const draftCount = useMemo(
    () =>
      recentEstimates.filter(
        (estimate) =>
          estimate.status !== "SIGNED" &&
          estimate.status !== "Approved" &&
          estimate.status !== "PENDING" &&
          estimate.status !== "Sent",
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
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
      <SignedEstimatesNotificationsClient />
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
              Command center
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              A clean, calculator-first workspace for daily estimating.
            </p>
            <p className="mt-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Role: {formatRole(userRole)}
            </p>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <Link
              href={routes.newEstimate}
              prefetch={false}
              className="btn-primary w-full justify-center gap-2 text-xs font-black uppercase tracking-[0.1em]"
            >
              New Estimate
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Link
                href={routes.calculators}
                prefetch={false}
                className="btn-ghost justify-center px-2 py-2 text-[11px]"
              >
                <Calculator className="h-3.5 w-3.5" aria-hidden />
                Calculators
              </Link>
              <Link
                href={routes.pricebook}
                prefetch={false}
                className="btn-ghost justify-center px-2 py-2 text-[11px]"
              >
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Price Book
              </Link>
              <Link
                href={routes.fieldNotes}
                prefetch={false}
                className="btn-ghost justify-center px-2 py-2 text-[11px]"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Field Notes
              </Link>
            </div>
          </div>
        </div>

        {needsBusinessProfileSetup ? (
          <p className="mt-3 rounded-xl border border-[--color-blue-rim] bg-[--color-blue-soft] px-3 py-2 text-xs font-semibold text-[--color-blue-dark]">
            Business profile setup is incomplete.{" "}
            <Link
              href={routes.settingsBusinessProfile}
              prefetch={false}
              className="font-bold text-[--color-blue-brand] underline-offset-2 hover:underline"
            >
              Complete your business profile
            </Link>{" "}
            to keep estimates client-ready.
          </p>
        ) : null}
      </article>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-300 border-l-4 border-l-slate-400 bg-white px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Total Estimates
          </p>
          <p className="mt-1.5 text-2xl font-black text-slate-900">
            {recentEstimates.length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 border-l-4 border-l-emerald-500 bg-white px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Signed
          </p>
          <p className="mt-1.5 text-2xl font-black text-emerald-700">
            {signedCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 border-l-4 border-l-blue-500 bg-white px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Sent
          </p>
          <p className="mt-1.5 text-2xl font-black text-blue-700">
            {sentCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-300 border-l-4 border-l-[--color-blue-brand] bg-white px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Drafts
          </p>
          <p className="mt-1.5 text-2xl font-black text-[--color-blue-dark]">
            {draftCount}
          </p>
        </article>
      </div>

      <div className="grid min-h-0 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
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
                  className="rounded-xl border border-[--color-border] bg-white px-3 py-3.5 transition hover:border-[--color-blue-rim] hover:bg-[--color-blue-soft]/90"
                >
                  <div className="flex items-center gap-2 text-slate-900">
                    <Icon className="h-4 w-4 text-blue-brand" aria-hidden />
                    <p className="text-sm font-bold">{link.label}</p>
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
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
            Crew access
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Share this join code with trusted team members.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <p className="min-w-0 flex-1 break-all rounded-lg border border-[--color-blue-rim] bg-[--color-blue-soft] px-3 py-2.5 font-mono text-sm font-bold tracking-[0.1em] text-slate-900">
              {joinCode ? joinCode.replace(/(.{4})(?=.)/g, "$1-") : "—"}
            </p>
            <button
              type="button"
              onClick={copyJoinCode}
              disabled={!joinCode}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[--color-blue-rim] bg-[--color-blue-soft] text-slate-700 transition hover:border-[--color-blue-rim] hover:text-[--color-blue-dark] disabled:opacity-50"
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--color-blue-brand]/12 text-[11px] font-bold text-[--color-blue-dark]">
                  {initials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-snug break-words text-slate-900">
                    {member.name}
                  </p>
                  <p className="text-[11px] leading-snug break-all text-slate-600">
                    {member.email}
                  </p>
                </div>
                <p className="ml-auto rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                  {formatRole(member.role)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
            Recent estimates
          </p>
          <Link
            href={routes.saved}
            prefetch={false}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 transition hover:text-[--color-blue-dark]"
          >
            View all
          </Link>
        </div>

        {recentEstimates.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
            <FileText
              className="mx-auto mb-2 h-8 w-8 text-slate-300"
              aria-hidden
            />
            <p className="text-sm font-semibold text-slate-700">
              No estimates yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Open a calculator, run the numbers, and save your first draft.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={routes.newEstimate}
                prefetch={false}
                className="btn-primary text-xs"
              >
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                Start First Estimate
              </Link>
              <Link
                href={routes.calculators}
                prefetch={false}
                className="btn-ghost text-xs"
              >
                Browse Calculators
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {recentEstimates.slice(0, 6).map((estimate) => (
              <Link
                key={estimate.id}
                href={getEstimateDetailRoute(estimate.id)}
                prefetch={false}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 transition hover:border-[--color-blue-rim] hover:bg-[--color-blue-soft]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug break-words text-slate-900">
                      {estimate.name}
                    </p>
                    <p className="text-[11px] leading-snug break-words text-slate-600">
                      {estimate.clientName || "No client"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(estimate.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
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

      {/* Popular Calculators */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
            Popular Calculators
          </p>
          <Link
            href={routes.calculators}
            prefetch={false}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 transition hover:text-[--color-blue-dark]"
          >
            View all
          </Link>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {POPULAR_CALCULATORS.map((calc) => (
            <Link
              key={calc.label}
              href={calc.href}
              prefetch={false}
              className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[--color-blue-rim] hover:bg-[--color-blue-soft] hover:text-[--color-blue-dark]"
            >
              {calc.label}
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </article>

      {/* Pro Tips */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-brand">
          Pro Tips
        </p>
        <div className="mt-2.5 space-y-2">
          {PRO_TIPS.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              prefetch={false}
              className={`relative flex min-h-12 gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-[--color-blue-rim] hover:bg-[--color-blue-soft] ${
                i === 0 ? "bg-[--color-blue-soft]/50" : "bg-slate-50"
              }`}
            >
              <Lightbulb
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-brand"
                aria-hidden
              />
              <p className="text-xs leading-relaxed text-slate-700">
                {item.tip}
              </p>
              <span className="absolute right-3 top-2 text-[10px] font-black text-slate-300">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </div>
      </article>
    </section>
  );
}

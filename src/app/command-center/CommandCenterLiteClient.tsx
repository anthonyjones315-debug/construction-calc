"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  FileText,
  Lightbulb,
  Mail,
  Settings,
  Shield,
  Users,
  Wrench,
  BookOpen,
  Crown,
  UserCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { routes, getEstimateDetailRoute } from "@routes";

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
  businessEmail: string;
  joinCode: string;
  initialMembers: TeamMember[];
  recentEstimates: RecentEstimate[];
  needsBusinessProfileSetup: boolean;
  userRole: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function roleIcon(role: string) {
  if (role === "owner") return Crown;
  if (role === "admin") return Shield;
  if (role === "editor") return UserCheck;
  return Users;
}

function roleBadgeClass(role: string) {
  if (role === "owner") return "border-orange-300 bg-orange-50 text-orange-700";
  if (role === "admin") return "border-blue-300 bg-blue-50 text-blue-700";
  if (role === "editor") return "border-purple-300 bg-purple-50 text-purple-700";
  return "border-slate-300 bg-white text-slate-600";
}

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "TM";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

// ─── Static data ────────────────────────────────────────────────────────────

const POPULAR_CALCULATORS: Array<{ label: string; href: Route }> = [
  { label: "Concrete Slab", href: "/calculators/concrete/slab" as Route },
  { label: "Wall Studs", href: "/calculators/framing/wall-studs" as Route },
  { label: "Roof Pitch", href: "/calculators/roofing/pitch-slope" as Route },
  { label: "Labor Rate", href: "/calculators/business/labor-rate" as Route },
  { label: "Profit Margin", href: "/calculators/business/profit-margin" as Route },
  { label: "Shingle Bundles", href: "/calculators/roofing/shingle-bundles" as Route },
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-slate-300 border-l-4 ${accent} bg-white px-4 py-3.5 shadow-sm`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-black`}>{value}</p>
    </article>
  );
}

function RecentEstimatesPanel({
  estimates,
}: {
  estimates: RecentEstimate[];
}) {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
          Recent Estimates
        </p>
        <Link
          href={routes.saved}
          prefetch={false}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 transition hover:text-orange-700"
        >
          View all
        </Link>
      </div>

      {estimates.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
          <p className="text-sm font-semibold text-slate-700">No estimates yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Open a calculator, run the numbers, and save your first draft.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Link href={routes.newEstimate} prefetch={false} className="btn-primary text-xs">
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              Start First Estimate
            </Link>
            <Link href={routes.calculators} prefetch={false} className="btn-ghost text-xs">
              Browse Calculators
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {estimates.slice(0, 6).map((estimate) => (
            <Link
              key={estimate.id}
              href={getEstimateDetailRoute(estimate.id)}
              prefetch={false}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 transition hover:border-orange-300 hover:bg-orange-50"
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
                    {new Date(estimate.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
  );
}

function PopularCalculatorsPanel() {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
          Popular Calculators
        </p>
        <Link
          href={routes.calculators}
          prefetch={false}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 transition hover:text-orange-700"
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
            className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            {calc.label}
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          </Link>
        ))}
      </div>
    </article>
  );
}

function ProTipsPanel() {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
        Pro Tips
      </p>
      <div className="mt-2.5 space-y-2">
        {PRO_TIPS.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            prefetch={false}
            className={`relative flex min-h-12 gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-orange-300 hover:bg-orange-50 ${
              i === 0 ? "bg-orange-50/50" : "bg-slate-50"
            }`}
          >
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            <p className="text-xs leading-relaxed text-slate-700">{item.tip}</p>
            <span className="absolute right-3 top-2 text-[10px] font-black text-slate-300">
              {String(i + 1).padStart(2, "0")}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

// ─── Owner Dashboard ─────────────────────────────────────────────────────────

function OwnerDashboard({
  businessName,
  businessEmail: initialBusinessEmail,
  joinCode,
  initialMembers,
  recentEstimates,
  needsBusinessProfileSetup,
}: Omit<CommandCenterLiteClientProps, "userRole">) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [fromEmail, setFromEmail] = useState(initialBusinessEmail);
  const [emailInput, setEmailInput] = useState(initialBusinessEmail);
  const [emailSaveState, setEmailSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [members, setMembers] = useState(initialMembers);

  const signedCount = useMemo(
    () => recentEstimates.filter((e) => e.status === "SIGNED" || e.status === "Approved").length,
    [recentEstimates],
  );
  const sentCount = useMemo(
    () => recentEstimates.filter((e) => e.status === "PENDING" || e.status === "Sent").length,
    [recentEstimates],
  );
  const draftCount = useMemo(
    () =>
      recentEstimates.filter(
        (e) =>
          e.status !== "SIGNED" &&
          e.status !== "Approved" &&
          e.status !== "PENDING" &&
          e.status !== "Sent",
      ).length,
    [recentEstimates],
  );

  async function saveFromEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || trimmed === fromEmail) return;
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setEmailSaveState("error");
      setTimeout(() => setEmailSaveState("idle"), 2500);
      return;
    }
    setEmailSaveState("saving");
    try {
      const res = await fetch("/api/business-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_email: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      setFromEmail(trimmed);
      setEmailInput(trimmed);
      setEmailSaveState("saved");
      setTimeout(() => setEmailSaveState("idle"), 2000);
    } catch {
      setEmailSaveState("error");
      setTimeout(() => setEmailSaveState("idle"), 2500);
    }
  }

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

  async function removeMember(membershipId: string) {
    setRemovingId(membershipId);
    try {
      const res = await fetch(`/api/command-center/members/${membershipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove.");
      setMembers((prev) => prev.filter((m) => m.membershipId !== membershipId));
    } catch {
      // silently fail — keep member in list
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
      {/* ── Header ── */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Command Center · Owner
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Full control — crew, estimates, settings, and business health at a glance.
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700">
              <Crown className="h-3 w-3" aria-hidden /> Owner
            </span>
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
              <Link href={routes.calculators} prefetch={false} className="btn-ghost justify-center px-2 py-2 text-[11px]">
                <Calculator className="h-3.5 w-3.5" aria-hidden />
                Calcs
              </Link>
              <Link href={routes.pricebook} prefetch={false} className="btn-ghost justify-center px-2 py-2 text-[11px]">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Prices
              </Link>
              <Link href={routes.settings} prefetch={false} className="btn-ghost justify-center px-2 py-2 text-[11px]">
                <Settings className="h-3.5 w-3.5" aria-hidden />
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Setup warnings */}
        {(needsBusinessProfileSetup || !fromEmail) && (
          <div className="mt-3 space-y-1.5">
            {needsBusinessProfileSetup && (
              <p className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Business name missing — add it in{" "}
                <Link href={routes.settings} className="underline underline-offset-2 hover:text-orange-900">
                  Business Settings
                </Link>{" "}
                to keep estimates client-ready.
              </p>
            )}
            {!fromEmail && (
              <p className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Reply-to email not set — clients can&apos;t reply to your estimates. Set it below.
              </p>
            )}
          </div>
        )}
      </article>

      {/* ── KPI Stats ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Estimates" value={recentEstimates.length} accent="border-l-slate-400 text-slate-900" />
        <StatCard label="Signed" value={signedCount} accent="border-l-emerald-500 text-emerald-700" />
        <StatCard label="Sent" value={sentCount} accent="border-l-blue-500 text-blue-700" />
        <StatCard label="Drafts" value={draftCount} accent="border-l-orange-500 text-orange-700" />
      </div>

      {/* ── Two-column: Business Setup + Crew Management ── */}
      <div className="grid min-h-0 gap-3 xl:grid-cols-2">
        {/* Business Profile Quick-Edit */}
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
            Business Profile
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Keep your business info current — it appears on every estimate you send.
          </p>

          {/* From Email */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Reply-to email
              </p>
              {fromEmail ? (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Check className="h-2.5 w-2.5" aria-hidden /> Set
                </span>
              ) : (
                <span className="ml-auto inline-flex items-center rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                  Not set
                </span>
              )}
            </div>
            <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
              Clients reply to this address when you send estimates.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveFromEmail()}
                placeholder="you@yourbusiness.com"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={saveFromEmail}
                disabled={emailSaveState === "saving" || emailInput.trim() === fromEmail}
                className="inline-flex h-9 min-w-[60px] items-center justify-center rounded-lg bg-orange-600 px-3 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {emailSaveState === "saving" ? "…" : emailSaveState === "saved" ? "Saved!" : "Save"}
              </button>
            </div>
            {emailSaveState === "error" && (
              <p className="mt-1.5 text-[11px] text-red-600">Invalid email address.</p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Business name, logo, phone, and address live in Settings.
            </p>
            <Link
              href={routes.settings}
              prefetch={false}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
            >
              <Settings className="h-3 w-3" aria-hidden />
              Open Settings
            </Link>
          </div>
        </article>

        {/* Crew Management */}
        <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Crew Management
            </p>
            <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          {/* Join code */}
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Invite Code
            </p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 break-all rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 font-mono text-sm font-bold tracking-[0.1em] text-slate-900">
                {joinCode ? joinCode.replace(/(.{4})(?=.)/g, "$1-") : "—"}
              </p>
              <button
                type="button"
                onClick={copyJoinCode}
                disabled={!joinCode}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-50"
                aria-label="Copy invite code"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            {copyState === "copied" && (
              <p className="mt-1 text-[11px] text-emerald-700">Invite code copied.</p>
            )}
            {copyState === "error" && (
              <p className="mt-1 text-[11px] text-red-700">Could not copy.</p>
            )}
            <p className="mt-1.5 text-[11px] text-slate-400">
              Share with crew — they enter this code on first sign-in to join your business.
            </p>
          </div>

          {/* Member roster */}
          <div className="mt-3 space-y-2">
            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
                <Users className="mx-auto mb-1.5 h-6 w-6 text-slate-300" aria-hidden />
                <p className="text-xs font-semibold text-slate-600">No crew yet</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Share the invite code above to add your first crew member.
                </p>
              </div>
            ) : (
              members.map((member) => {
                const RoleIcon = roleIcon(member.role);
                const isOwnerRow = member.role === "owner";
                return (
                  <div
                    key={member.membershipId}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-700">
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-snug text-slate-900 break-words">
                        {member.name}
                      </p>
                      <p className="text-[11px] leading-snug text-slate-500 break-all">
                        {member.email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${roleBadgeClass(member.role)}`}
                    >
                      <RoleIcon className="h-2.5 w-2.5" aria-hidden />
                      {formatRole(member.role)}
                    </span>
                    {!isOwnerRow && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.membershipId)}
                        disabled={removingId === member.membershipId}
                        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400">
            Full role management and permissions are in{" "}
            <Link href={routes.settings} className="font-semibold text-orange-600 hover:text-orange-700">
              Settings → Team
            </Link>
            .
          </p>
        </article>
      </div>

      {/* ── Recent Estimates ── */}
      <RecentEstimatesPanel estimates={recentEstimates} />

      {/* ── Popular Calculators ── */}
      <PopularCalculatorsPanel />

      {/* ── Pro Tips ── */}
      <ProTipsPanel />
    </section>
  );
}

// ─── Crew Dashboard ───────────────────────────────────────────────────────────

function CrewDashboard({
  businessName,
  businessEmail,
  recentEstimates,
  userRole,
}: Pick<CommandCenterLiteClientProps, "businessName" | "businessEmail" | "recentEstimates" | "userRole">) {
  const crewLinks: Array<{
    label: string;
    href: Route;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { label: "Calculators", href: routes.calculators, description: "Open any trade calculator in seconds.", icon: Calculator },
    { label: "Saved Estimates", href: routes.saved, description: "Review and pick up active quotes.", icon: FileText },
    { label: "Price Book", href: routes.pricebook, description: "Look up consistent material pricing.", icon: ClipboardList },
    { label: "Field Notes", href: routes.fieldNotes, description: "Use practical tips right on the job.", icon: Wrench },
    { label: "Operator Guide", href: routes.guide, description: "Follow the fastest workflow.", icon: CheckCircle2 },
    { label: "Resources", href: routes.fieldNotes, description: "Formulas, references, and trade tables.", icon: BookOpen },
  ];

  const signedCount = useMemo(
    () => recentEstimates.filter((e) => e.status === "SIGNED" || e.status === "Approved").length,
    [recentEstimates],
  );
  const sentCount = useMemo(
    () => recentEstimates.filter((e) => e.status === "PENDING" || e.status === "Sent").length,
    [recentEstimates],
  );
  const draftCount = useMemo(
    () =>
      recentEstimates.filter(
        (e) =>
          e.status !== "SIGNED" &&
          e.status !== "Approved" &&
          e.status !== "PENDING" &&
          e.status !== "Sent",
      ).length,
    [recentEstimates],
  );

  const RoleIcon = roleIcon(userRole);

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
      {/* ── Header ── */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Command Center · {formatRole(userRole)}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your workspace for fast estimates and field-ready calculations.
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${roleBadgeClass(userRole)}`}
            >
              <RoleIcon className="h-3 w-3" aria-hidden />
              {formatRole(userRole)}
            </span>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Link
              href={routes.newEstimate}
              prefetch={false}
              className="btn-primary w-full justify-center gap-2 text-xs font-black uppercase tracking-[0.1em]"
            >
              New Estimate
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={routes.calculators} prefetch={false} className="btn-ghost justify-center px-2 py-2 text-[11px]">
                <Calculator className="h-3.5 w-3.5" aria-hidden />
                Calculators
              </Link>
              <Link href={routes.saved} prefetch={false} className="btn-ghost justify-center px-2 py-2 text-[11px]">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                Estimates
              </Link>
            </div>
          </div>
        </div>

        {businessEmail && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
            <p className="text-xs text-slate-600">
              Estimates reply to:{" "}
              <span className="font-semibold text-slate-900">{businessEmail}</span>
            </p>
          </div>
        )}
      </article>

      {/* ── Stats ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Estimates" value={recentEstimates.length} accent="border-l-slate-400 text-slate-900" />
        <StatCard label="Signed" value={signedCount} accent="border-l-emerald-500 text-emerald-700" />
        <StatCard label="Drafts" value={draftCount} accent="border-l-orange-500 text-orange-700" />
      </div>

      {/* ── Quick Access ── */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
          Quick Access
        </p>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {crewLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3.5 transition hover:border-orange-300 hover:bg-orange-50/50"
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <Icon className="h-4 w-4 text-orange-600" aria-hidden />
                  <p className="text-sm font-bold">{link.label}</p>
                </div>
                <p className="mt-1 text-xs text-slate-600">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </article>

      {/* ── Recent Estimates ── */}
      <RecentEstimatesPanel estimates={recentEstimates} />

      {/* ── Popular Calculators ── */}
      <PopularCalculatorsPanel />

      {/* ── Pro Tips ── */}
      <ProTipsPanel />
    </section>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function CommandCenterLiteClient({
  businessName,
  businessEmail,
  joinCode,
  initialMembers,
  recentEstimates,
  needsBusinessProfileSetup,
  userRole,
}: CommandCenterLiteClientProps) {
  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin";

  if (isOwnerOrAdmin) {
    return (
      <OwnerDashboard
        businessName={businessName}
        businessEmail={businessEmail}
        joinCode={joinCode}
        initialMembers={initialMembers}
        recentEstimates={recentEstimates}
        needsBusinessProfileSetup={needsBusinessProfileSetup}
      />
    );
  }

  return (
    <CrewDashboard
      businessName={businessName}
      businessEmail={businessEmail}
      recentEstimates={recentEstimates}
      userRole={userRole}
    />
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import NewEstimateClient from "@/app/command-center/estimates/new/NewEstimateClient";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BrickWall,
  Calculator,
  ClipboardList,
  Copy,
  FileText,
  Hammer,
  HardHat,
  Home,
  Layout,
  MoreHorizontal,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Thermometer,
  Trash2,
  Triangle,
  Users,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { routes } from "@routes";
import { CommandCenterCalculator } from "./CommandCenterCalculator";
import { getTradePageByPath, tradePages } from "@/app/calculators/_lib/trade-pages";
import { useProMode } from "@/hooks/useProMode";
import { useStore } from "@/lib/store";

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
  /** The current user's role in this business. */
  userRole: string;
};

type NavItem = {
  label: string;
  href?: Route;
  icon: LucideIcon;
  slug: string;
  description?: string;
};

type WorkspaceSlug =
  | "overview"
  | "launch"
  | "workflow"
  | "crew"
  | "pages";

type ToolCategory =
  | "all"
  | "concrete"
  | "structure"
  | "envelope"
  | "systems"
  | "business"
  | "workspace";

type SentryFeedbackWidget = {
  appendToDom: () => void;
  removeFromDom: () => void;
};

const workspaceTabs: Array<{
  slug: WorkspaceSlug;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  {
    slug: "overview",
    label: "Overview",
    icon: HardHat,
    description: "Daily shop brief and owner controls.",
  },
  {
    slug: "launch",
    label: "Launch Pad",
    icon: Calculator,
    description: "Fast calculator access without rail clutter.",
  },
  {
    slug: "workflow",
    label: "Workflow",
    icon: ShoppingCart,
    description: "Estimate cart and saved-job activity.",
  },
  {
    slug: "crew",
    label: "Crew",
    icon: Users,
    description: "Invite code, seats, and member controls.",
  },
  {
    slug: "pages",
    label: "Pages",
    icon: Layout,
    description: "Guide, glossary, field notes, and account links.",
  },
];

const toolCategoryTabs: Array<{ slug: ToolCategory; label: string }> = [
  { slug: "all", label: "All Tools" },
  { slug: "concrete", label: "Concrete" },
  { slug: "structure", label: "Structure" },
  { slug: "envelope", label: "Envelope" },
  { slug: "systems", label: "Systems" },
  { slug: "business", label: "Business" },
  { slug: "workspace", label: "Workspace" },
];

const toolNavItems: NavItem[] = [
  {
    label: "Estimates",
    slug: "estimates",
    href: routes.saved,
    icon: FileText,
    description: "Saved proposals, sent jobs, and signed work.",
  },
  {
    label: "Trade Calculators",
    slug: "trade-modules",
    href: routes.calculators,
    icon: HardHat,
    description: "Open the full calculator library — concrete, framing, roofing, and more.",
  },
  {
    label: "Concrete & Masonry",
    slug: "masonry",
    href: "/calculators/concrete" as Route,
    icon: BrickWall,
    description: "Concrete pours, slabs, and masonry packs.",
  },
  {
    label: "Framing & Lumber",
    slug: "framing",
    href: "/calculators/framing" as Route,
    icon: Hammer,
    description: "Dimension lumber, rafters, and studs.",
  },
  {
    label: "Roofing & Siding",
    slug: "roofing",
    href: "/calculators/roofing" as Route,
    icon: Triangle,
    description: "Roofing pitches, coverage, and siding.",
  },
  {
    label: "Mechanical & Site",
    slug: "mechanical",
    href: "/calculators/mechanical" as Route,
    icon: Thermometer,
    description: "HVAC, ductwork, and equipment math.",
  },
  {
    label: "Interior",
    slug: "interior",
    href: "/calculators/interior" as Route,
    icon: Layout,
    description: "Finish, trim, and interior trades.",
  },
  {
    label: "Business",
    slug: "business",
    href: "/calculators/business" as Route,
    icon: BarChart3,
    description: "Profit, leads, workforce, and tax controls.",
  },
];

const commandPages: Array<{
  label: string;
  href: Route;
  icon: LucideIcon;
  description: string;
  group: "Operations" | "Reference";
}> = [
  {
    label: "CRM & Clients",
    href: routes.crm,
    icon: Users,
    description: "Manage customer profiles and job history.",
    group: "Operations",
  },
  {
    label: "Saved Estimates",
    href: routes.saved,
    icon: FileText,
    description: "Reopen drafts, sent proposals, and signed work.",
    group: "Operations",
  },
  {
    label: "Price Book",
    href: routes.pricebook,
    icon: BarChart3,
    description: "Keep crew pricing standards and materials aligned.",
    group: "Operations",
  },
  {
    label: "Business Settings",
    href: routes.settings,
    icon: Settings,
    description: "Branding, owner controls, and account-level setup.",
    group: "Operations",
  },
  {
    label: "User Guide",
    href: routes.guide,
    icon: Layout,
    description: "Fast workflow reference for crews and office handoff.",
    group: "Reference",
  },
  {
    label: "Field Notes",
    href: routes.fieldNotes,
    icon: HardHat,
    description: "Regional construction notes and workflow tips.",
    group: "Reference",
  },
  {
    label: "Glossary",
    href: routes.glossary,
    icon: Calculator,
    description: "Shared estimating terms across every workflow.",
    group: "Reference",
  },
  {
    label: "Financial Terms",
    href: routes.financialTerms,
    icon: ShieldCheck,
    description: "Markup, margin, burden, CAC, and tax definitions.",
    group: "Reference",
  },
  {
    label: "FAQ",
    href: routes.faq,
    icon: Bell,
    description: "Common questions before a crew calls the office.",
    group: "Reference",
  },
];

function formatRole(role: string): string {
  switch (role) {
    case "owner":   return "Owner";
    case "admin":   return "Admin";
    case "editor":  return "Editor";
    case "member":  return "Member";
    default:        return "Member";
  }
}

function roleBadgeClasses(role: string): string {
  switch (role) {
    case "owner":
      return "border-blue-600/40 bg-blue-600/10 text-blue-800";
    case "admin":
      return "border-blue-500/40 bg-blue-500/10 text-blue-700";
    case "editor":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
    default:
      return "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-dim]";
  }
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
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
  }
  if (status === "PENDING" || status === "Sent") {
    return "border-blue-600/40 bg-blue-600/10 text-blue-800";
  }
  return "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid]";
}

function categorizeTool(item: NavItem): ToolCategory {
  if (
    ["slab-thickness", "running-lineal-feet", "cubic-yards", "masonry"].includes(
      item.slug,
    )
  ) {
    return "concrete";
  }

  if (["framing", "interior"].includes(item.slug)) {
    return "structure";
  }

  if (item.slug === "roofing") {
    return "envelope";
  }

  if (item.slug === "mechanical") {
    return "systems";
  }

  if (item.slug === "business") {
    return "business";
  }

  return "workspace";
}

function formatCartValue(value: string | number | undefined) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }

  return value ?? "Ready";
}

function WorkspaceTabButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-[--color-blue-brand]/50 bg-[--color-blue-soft] text-[--color-blue-brand] shadow-[0_0_0_1px_rgba(234,88,12,0.12)]"
          : "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid] hover:border-[--color-blue-brand]/40 hover:text-[--color-blue-brand]"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-[--color-blue-brand]" : "text-[--color-ink-dim]"}`} aria-hidden />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function CommandStatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <article className="flex min-h-[120px] flex-col justify-between gap-3 rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
        {label}
      </p>
      <div>
        <p className={`text-3xl font-black tracking-tight ${tone ?? "text-[--color-ink]"}`}>
          {value}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[--color-ink-dim]">{detail}</p>
      </div>
    </article>
  );
}

function ToolLaunchCard({
  item,
  onOpen,
  onCategoryClick,
  onInternalLinkClick,
}: {
  item: NavItem;
  onOpen: (item: NavItem) => void;
  onCategoryClick?: (category: ToolCategory) => void;
  onInternalLinkClick?: (workspace: WorkspaceSlug) => void;
}) {
  const href = item.href ?? routes.commandCenter;
  const tp = typeof href === "string" ? getTradePageByPath(href) : undefined;
  const opensCalculatorModal = Boolean(tp && tp.type === "calculator");
  const isCategoryLink = Boolean(tp && tp.type === "category");

  const handleOpen = (e: React.MouseEvent) => {
    if (isCategoryLink && onCategoryClick && tp) {
      e.preventDefault();
      onCategoryClick(tp.category as ToolCategory);
      return;
    }
    if (opensCalculatorModal) {
      e.preventDefault();
      onOpen(item);
    }
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black tracking-tight text-[--color-ink]">{item.label}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[--color-ink-mid]">
            {item.description ?? "Open this field tool from Command Center."}
          </p>
        </div>
        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[--color-blue-brand]" aria-hidden />
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
        Open tool
        <ArrowRight className="h-3 w-3" aria-hidden />
      </div>
    </>
  );

  if ((opensCalculatorModal || isCategoryLink) && typeof href === "string") {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-h-0 flex-col justify-between rounded-2xl border border-[--color-border] bg-white px-5 py-5 text-left transition-all hover:border-[--color-blue-brand]/40 hover:bg-[--color-blue-soft] hover:shadow-sm"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={(e) => {
        if (onInternalLinkClick) {
          if (href === routes.calculators) {
            e.preventDefault();
            onInternalLinkClick("launch");
          } else if (href === routes.saved) {
            e.preventDefault();
            onInternalLinkClick("pages");
          }
        }
      }}
      className="flex min-h-0 flex-col justify-between rounded-2xl border border-[--color-border] bg-white px-5 py-5 text-left transition-all hover:border-[--color-blue-brand]/40 hover:bg-[--color-blue-soft] hover:shadow-sm"
    >
      {content}
    </Link>
  );
}

function CommandPageCard({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: Route;
  icon: LucideIcon;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex min-h-0 flex-col justify-between gap-3 rounded-2xl border border-[--color-border] bg-white px-5 py-5 transition-all hover:border-[--color-blue-brand]/40 hover:bg-[--color-blue-soft] hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-black tracking-tight text-[--color-ink]">{label}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[--color-ink-mid]">{description}</p>
        </div>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[--color-blue-brand]" aria-hidden />
      </div>
      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
        Open page
        <ArrowRight className="h-3 w-3" aria-hidden />
      </span>
    </Link>
  );
}

export default function CommandCenterClient({
  businessName,
  joinCode,
  initialMembers,
  recentEstimates,
  needsBusinessProfileSetup,
  draftMode = false,
  initialToolSlug,
  userRole,
}: CommandCenterClientProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manageTargetId, setManageTargetId] = useState<string | null>(null);
  const [activeJoinCode, setActiveJoinCode] = useState(joinCode);
  const [isRefreshingInvite, setIsRefreshingInvite] = useState(false);
  const [joinCodeRotatable, setJoinCodeRotatable] = useState(true);
  const [activeTool, setActiveTool] = useState<NavItem | null>(null);
  const [toolFilter, setToolFilter] = useState("");
  const [toolCategory, setToolCategory] = useState<ToolCategory>("all");
  const [handledDeepLink, setHandledDeepLink] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSlug>(
    initialToolSlug ? "launch" : draftMode ? "workflow" : "overview",
  );
  const [showNewEstimate, setShowNewEstimate] = useState(false);
  const { proMode, setProMode, mounted: proModeMounted } = useProMode();
  const estimateCart = useStore((s) => s.estimateCart);
  const removeCartItem = useStore((s) => s.removeCartItem);
  const clearCart = useStore((s) => s.clearCart);
  const searchParams = useSearchParams();
  const toolFromQuery = searchParams.get("tool") ?? initialToolSlug;

  const manageTarget = useMemo(
    () =>
      members.find((member) => member.membershipId === manageTargetId) ?? null,
    [members, manageTargetId],
  );

  // Capability flags derived from the current user's role.
  // owner + admin → can manage members and rotate join codes.
  const canManageCrew = userRole === "owner" || userRole === "admin";

  const planName = "Pro Team";
  const seatLimit = 10;
  const seatsUsed = members.length;
  const seatsAvailable = Math.max(seatLimit - seatsUsed, 0);
  const utilizationPercent = Math.round((seatsUsed / seatLimit) * 100);
  const normalizedFilter = toolFilter.trim().toLowerCase();
  const filteredToolItems = useMemo(() => {
    let baseItems = toolNavItems;

    if (toolCategory !== "all") {
      baseItems = Object.values(tradePages)
        .filter((p) => p.category === toolCategory && p.type === "calculator")
        .map((p) => ({
          label: p.title,
          slug: p.key,
          href: p.canonicalPath as Route,
          icon: Calculator,
          description: p.description,
        }));
    }

    return baseItems.filter((item) => {
      if (toolCategory === "all") {
        const matchesCategory =
          toolCategory === "all" || categorizeTool(item) === toolCategory;
        if (!matchesCategory) return false;
      }

      if (!normalizedFilter) return true;

      const haystack = [item.label, item.slug, item.description ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedFilter);
    });
  }, [toolCategory, normalizedFilter]);
  const visibleToolItems = filteredToolItems.slice(0, 6);
  const toolFromQuerySlug = toolFromQuery?.toLowerCase() ?? "";
  const activeToolHref =
    typeof activeTool?.href === "string" ? activeTool.href : null;
  const activeTradePage = activeToolHref
    ? getTradePageByPath(activeToolHref)
    : undefined;
  const latestCartItems = estimateCart.slice(-3).reverse();
  const cartItemCount = estimateCart.length;
  const signedEstimateCount = recentEstimates.filter((estimate) =>
    ["SIGNED", "Approved"].includes(estimate.status ?? ""),
  ).length;
  const sentEstimateCount = recentEstimates.filter((estimate) =>
    ["PENDING", "Sent"].includes(estimate.status ?? ""),
  ).length;
  const draftEstimateCount = Math.max(
    recentEstimates.length - signedEstimateCount - sentEstimateCount,
    0,
  );
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const lastEstimateLabel = recentEstimates[0]
    ? new Date(recentEstimates[0].updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No estimate activity yet";
  const recentEstimatePreview = recentEstimates.slice(0, 4);
  const memberPreview = members.slice(0, 6);

  useEffect(() => {
    if (!toolFromQuerySlug) return;
    if (handledDeepLink === toolFromQuerySlug) return;
    const match = toolNavItems.find((entry) => entry.slug === toolFromQuerySlug);
    if (!match) return;

    setToolCategory(categorizeTool(match));
    setActiveWorkspace("launch");
    setActiveTool(match);
    setHandledDeepLink(toolFromQuerySlug);
  }, [toolFromQuerySlug, handledDeepLink]);

  useEffect(() => {
    const feedbackApi = Sentry.getFeedback?.() as
      | {
          createWidget?: (options?: {
            triggerLabel?: string;
            colorScheme?: "light" | "dark" | "system";
          }) => SentryFeedbackWidget;
        }
      | undefined;
    const widget = feedbackApi?.createWidget?.({
      triggerLabel: "Report a bug",
      colorScheme: "system",
    });
    widget?.appendToDom?.();
    return () => widget?.removeFromDom?.();
  }, []);

  async function refreshInviteCode() {
    if (isRefreshingInvite) return;
    setError(null);
    setSuccess(null);
    setIsRefreshingInvite(true);

    try {
      const response = await fetch("/api/command-center", {
        method: "PATCH",
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 503) {
        // Migration not yet applied — column doesn't exist.
        setJoinCodeRotatable(false);
        setError(
          "Code rotation requires a one-time database update. Contact your administrator to apply the join_code migration.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to refresh the invite code.");
      }

      const nextCode = payload.business?.joinCode ?? activeJoinCode;
      setActiveJoinCode(nextCode);
      setJoinCodeRotatable(true);
      setSuccess("Invite code rotated. Previous codes are now invalid.");
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

  const renderOverview = () => (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* ── Compact status bar — 44px ─────────────────────────────── */}
      {/* ── Compact status bar — 44px ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-px rounded-2xl border border-[--color-border] bg-[--color-surface-alt] overflow-hidden">
        <div className="status-bar-cell flex-1 border-r border-[--color-border] py-3.5 px-4 font-bold tracking-wide">
          <span className={`status-dot h-2 w-2 rounded-full flex-shrink-0 ${cartItemCount > 0 ? " status-dot-warn" : ""}`} />
          {cartItemCount > 0 ? `${cartItemCount} item${cartItemCount === 1 ? "" : "s"} in cart` : "Cart clear"}
        </div>
        <div className="status-bar-cell flex-1 border-r border-[--color-border] py-3.5 px-4 font-bold tracking-wide">
          <span className={`status-dot h-2 w-2 rounded-full flex-shrink-0 ${sentEstimateCount > 0 ? " status-dot-warn" : ""}`} />
          {sentEstimateCount > 0 ? `${sentEstimateCount} proposal${sentEstimateCount === 1 ? "" : "s"} waiting` : "No follow-ups pending"}
        </div>
        <div className="status-bar-cell flex-1 py-3.5 px-4 font-bold tracking-wide">
          <span className={`status-dot h-2 w-2 rounded-full flex-shrink-0 ${needsBusinessProfileSetup ? " status-dot-warn" : ""}`} />
          {needsBusinessProfileSetup ? "Profile needs setup" : "Profile ready"}
        </div>
      </div>

      {/* ── Quick-action bar — 44px ───────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowNewEstimate(true)}
          className="action-bar-btn action-bar-btn-primary"
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden />
          New Estimate
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkspace("pages")}
          className="action-bar-btn"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Open Drafts
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkspace("pages")}
          className="action-bar-btn"
        >
          <Settings className="h-3.5 w-3.5" aria-hidden />
          Business Setup
        </button>
        {/* Modal for New Estimate */}
        <Modal isOpen={showNewEstimate} onClose={() => setShowNewEstimate(false)}>
          <div className="max-w-4xl w-full">
            <NewEstimateClient onOpenCalculators={() => {
              setShowNewEstimate(false);
              setActiveWorkspace("launch");
            }} />
          </div>
        </Modal>
        <button
          type="button"
          onClick={() => setActiveWorkspace("pages")}
          className="action-bar-btn"
        >
          <HardHat className="h-3.5 w-3.5" aria-hidden />
          Owner Guide
        </button>
      </div>

      {/* ── 4-up KPI row — 64px ───────────────────────────────────── */}
      {/* ── 4-up KPI row — 64px ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex min-h-[80px] flex-col justify-center rounded-2xl border border-[--color-border] bg-white px-5 py-2 shadow-sm">
          <span className="text-3xl font-black text-[--color-ink]">{signedEstimateCount}</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">Closed / Signed</span>
        </div>
        <div className="flex min-h-[80px] flex-col justify-center rounded-2xl border border-[--color-border] bg-[--color-blue-brand]/5 px-5 py-2 shadow-sm">
          <span className="text-3xl font-black text-[--color-blue-brand]">{sentEstimateCount}</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-dark]">Sent / Waiting</span>
        </div>
        <div className="flex min-h-[80px] flex-col justify-center rounded-2xl border border-[--color-border] bg-white px-5 py-2 shadow-sm">
          <span className="text-3xl font-black text-[--color-ink]">{draftEstimateCount}</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">Drafts Active</span>
        </div>
        <div className="flex min-h-[80px] flex-col justify-center rounded-2xl border border-[--color-border] bg-white px-5 py-2 shadow-sm">
          <span className="text-3xl font-black text-[--color-ink]">{utilizationPercent}%</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">Crew Seats</span>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.2fr,0.88fr]">
        <article className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
                Owner Controls
              </p>
              <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[--color-ink]">Live readiness</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-blue-rim] bg-[--color-blue-soft] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Locked
            </span>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">Launch Pad</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[--color-ink-mid]">Six high-value tools stay one tap away.</p>
              <button
                type="button"
                onClick={() => setActiveWorkspace("launch")}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[--color-border] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
              >
                Open Launch Pad
              </button>
            </div>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">Workflow</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[--color-ink-mid]">Cart items and estimate handoff in one view.</p>
              <button
                type="button"
                onClick={() => setActiveWorkspace("workflow")}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[--color-border] bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
              >
                Open Workflow
              </button>
            </div>
          </div>
        </article>

        <article className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
              Recent Activity
            </p>
            <Link
              href={routes.saved}
              prefetch={false}
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim] transition hover:text-[--color-blue-brand]"
            >
              View All →
            </Link>
          </div>
          {recentEstimates.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-[--color-surface-alt] px-4 py-6 text-center text-sm font-semibold text-[--color-ink-dim]">
              No estimates yet. Start a draft from any calculator.
            </div>
          ) : (
            <div className="mt-2 space-y-3 overflow-y-auto">
              {recentEstimates.map((estimate) => (
                <div
                  key={estimate.id}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3.5 transition hover:border-[--color-blue-brand]/35 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-black tracking-tight text-[--color-ink]">{estimate.name}</p>
                      <p className="mt-0.5 truncate text-[12px] font-semibold text-[--color-ink-dim]">{estimate.clientName || "No client"}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${estimateStatusClasses(estimate.status)}`}>
                      {formatEstimateStatus(estimate.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveWorkspace("launch");
                        setSuccess(`Select a tool in Launch Pad to calculate and append to ${estimate.name}.`);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-[--color-border] bg-white px-2.5 py-1.5 text-xs font-bold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                    >
                      <Calculator className="h-3.5 w-3.5" aria-hidden />
                      Calc
                    </button>
                    <Link
                      href={`${routes.saved}?id=${estimate.id}`}
                      prefetch={false}
                      className="flex items-center gap-1.5 rounded-lg border border-[--color-blue-brand] bg-[--color-blue-soft] px-3 py-1.5 text-xs font-bold text-[--color-blue-brand] transition hover:bg-[--color-blue-brand] hover:text-white"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );

  const renderLaunchPad = () => (
    <div className="flex flex-col gap-4 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[0.9fr,1.1fr]">
      <article className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
            Tool Launch
          </p>
          <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[--color-ink]">
            Open field math without menu sprawl
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[--color-ink-mid]">
            Search once, switch category bars, and open the calculator directly
            from this screen.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
            Search tools
          </span>
          <input
            id="command-center-tool-search"
            type="text"
            value={toolFilter}
            onChange={(event) => setToolFilter(event.target.value)}
            placeholder="Search calculators, estimates, or workflow tools"
            className="h-11 rounded-2xl border border-[--color-border] bg-white px-3 text-sm text-[--color-ink] placeholder:text-[--color-ink-dim] focus:border-[--color-blue-brand] focus:ring-2 focus:ring-[--color-blue-brand]/20"
          />
        </label>

        <div className="flex flex-wrap gap-2 pb-1">
          {toolCategoryTabs.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setToolCategory(category.slug)}
              className={`inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                toolCategory === category.slug
                  ? "border-[--color-blue-brand]/50 bg-[--color-blue-soft] text-[--color-blue-brand]"
                  : "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid] hover:border-[--color-blue-brand]/40 hover:text-[--color-blue-brand]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>


      </article>

      <div className="grid min-h-0 gap-4 content-start">
        {visibleToolItems.length === 0 ? (
          <article className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-[--color-border] bg-white px-5 py-5 text-center shadow-sm">
            <div>
              <p className="text-sm font-bold text-[--color-ink]">No tools match that search.</p>
              <p className="mt-2 text-sm text-[--color-ink-dim]">
                Clear the term or switch the category bar to reopen the launch grid.
              </p>
            </div>
          </article>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleToolItems.map((item) => (
              <ToolLaunchCard
                key={item.slug}
                item={item}
                onOpen={(nextItem) => setActiveTool(nextItem)}
                onCategoryClick={(cat) => {
                  setToolCategory(cat);
                  setToolFilter("");
                }}
                onInternalLinkClick={(ws) => {
                  setActiveWorkspace(ws);
                  if (ws === "launch") setToolCategory("all");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderWorkflow = () => (
    <div className="flex flex-col gap-4 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[1fr,0.95fr]">
      <article className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
              Field Cart
            </p>
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[--color-ink]">
              Batch estimate work in one locked view
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[--color-ink-mid]">
              Calculator outputs stay visible here until you clear the batch or
              hand them off.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[--color-border] bg-white px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
                Open items
              </p>
              <p className="mt-1 text-3xl font-black text-[--color-ink]">{cartItemCount}</p>
            </div>
            <div className="rounded-2xl border border-[--color-border] bg-white px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
                Workflow
              </p>
              <p className="mt-1 text-sm font-bold text-[--color-ink]">Cart to saved handoff</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveWorkspace("launch")}
            className="flex min-h-12 w-full max-w-[200px] shrink-0 items-center justify-center rounded-2xl bg-[--color-blue-brand] px-6 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_2px_12px_rgba(0,102,255,0.2)] transition hover:bg-[--color-blue-brand]/90 active:scale-95 sm:w-auto sm:max-w-none"
          >
            New Estimate
          </button>
          <Link
            href={routes.cart}
            prefetch={false}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-blue-700"
          >
            Review Cart
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={routes.calculators}
            prefetch={false}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[--color-border] px-4 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand]/60 hover:text-[--color-blue-brand]"
          >
            Add More Estimates
          </Link>
          <button
            type="button"
            onClick={clearCart}
            disabled={cartItemCount === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 text-sm font-semibold text-[--color-ink-mid] transition hover:border-red-400/50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Clear Cart
          </button>
        </div>

        {cartItemCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-[--color-border] bg-[--color-surface-alt] px-4 py-4 text-sm text-[--color-ink-mid]">
            No estimates in the cart yet. Use any calculator&apos;s
            <span className="font-semibold text-[--color-ink]"> Add to Cart </span>
            action and it will stay visible here.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {latestCartItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[--color-border] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
                      {item.calculatorLabel}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-[--color-ink]">
                      {item.estimateName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCartItem(item.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--color-border] text-[--color-ink-dim] transition hover:border-red-400/50 hover:text-red-600"
                    aria-label={`Remove ${item.estimateName} from cart`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-3 text-sm text-[--color-ink-mid]">
                  {item.primaryResult.label}:{" "}
                  <span className="font-mono font-semibold text-[--color-ink]">
                    {formatCartValue(item.primaryResult.value)} {item.primaryResult.unit}
                  </span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[--color-ink-dim]">
                  {item.materialList.length > 0
                    ? item.materialList.slice(0, 3).join(" • ")
                    : "Estimate ready for batch checkout."}
                </p>
              </article>
            ))}
          </div>
        )}
      </article>

      <div className="grid min-h-0 gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <CommandStatCard
            label="Sent / waiting"
            value={sentEstimateCount}
            detail="Quotes already with clients."
            tone="text-[--color-blue-brand]"
          />
          <CommandStatCard
            label="Last activity"
            value={lastEstimateLabel}
            detail="Most recent saved-estimate touchpoint."
          />
        </div>

        <article className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-blue-brand]">
                Recent Estimates
              </p>
              <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[--color-ink]">
                Latest activity
              </h2>
            </div>
            <Link
              href={routes.saved}
              prefetch={false}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[--color-border] px-4 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
            >
              View All
            </Link>
          </div>

          {recentEstimatePreview.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[--color-border] bg-[--color-surface-alt] px-4 py-5 text-sm text-[--color-ink-dim]">
              No estimates yet. Start a draft from any calculator and it will
              appear here.
            </div>
          ) : (
            <div className="grid gap-3">
              {recentEstimatePreview.map((estimate) => (
                <div
                  key={estimate.id}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-4 transition hover:border-[--color-blue-brand]/35 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[--color-ink]">
                        {estimate.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-[--color-ink-dim]">
                        {estimate.clientName || "No client name"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${estimateStatusClasses(estimate.status)}`}
                    >
                      {formatEstimateStatus(estimate.status)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-[--color-ink-dim]">
                      Updated{" "}
                      {new Date(estimate.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                       <button
                         type="button"
                         onClick={() => {
                            // First, switch to the launchpad workspace
                            setActiveWorkspace("launch");
                            // Set a cookie or search param or state to indicate we are picking a calculator for this estimate?
                            // For a truly cohesive UX, we should just let them use the generic cart flow. "fill the data to the estimate" implies it goes straight to the DB.
                            // In Command Center, anything added to the cart can be attached to an estimate via "Review Cart".
                            // I'll show a quick UI toast for now
                            setSuccess(`Select a tool in Launch Pad to calculate and append to ${estimate.name}.`);
                         }}
                         className="flex items-center gap-1.5 rounded-lg border border-[--color-border] bg-white px-2.5 py-1.5 text-xs font-bold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                       >
                         <Calculator className="h-3.5 w-3.5" aria-hidden />
                         Open Calculator
                       </button>
                       <Link
                         href={`${routes.saved}?id=${estimate.id}`}
                         aria-label={`Open estimate ${estimate.name}`}
                         className="flex items-center gap-1.5 rounded-lg bg-[--color-blue-brand] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[--color-blue-dark]"
                         prefetch={false}
                       >
                         Open Estimate
                         <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                       </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );

  const renderCrew = () => (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* ── Top 2-col row: team info + invite code ─────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Your Team</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-[--color-ink]">{planName} · {seatsUsed}/{seatLimit} seats</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-ink-dim]">Remaining</p>
              <p className="mt-1 text-2xl font-black text-[--color-ink]">{seatsAvailable}</p>
            </div>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-blue-brand]/5 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-blue-dark]">Utilization</p>
              <p className="mt-1 text-2xl font-black text-[--color-blue-brand]">{utilizationPercent}%</p>
            </div>
          </div>
        </article>

        <article className="public-panel-strong px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Invite New Member</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[--color-ink-dim]">Join Code</p>
          {/* Compact monospace code pill + inline copy */}
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 font-mono text-2xl font-black tracking-[0.1em] text-[--color-blue-brand]">
              {activeJoinCode}
            </code>
            <button
              type="button"
              onClick={copyJoinCode}
              className="action-bar-btn action-bar-btn-primary shrink-0"
              aria-label="Copy join code"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </button>
          </div>
          {canManageCrew && (
            <button
              type="button"
              onClick={refreshInviteCode}
              disabled={isRefreshingInvite || !joinCodeRotatable}
              title={
                !joinCodeRotatable
                  ? "Rotation requires the join_code migration to be applied."
                  : "Rotate invite code — old codes become invalid immediately"
              }
              className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[--color-border] px-3 text-xs font-semibold text-[--color-ink-dim] transition hover:border-[--color-blue-brand]/60 hover:text-[--color-blue-brand] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              {isRefreshingInvite ? "Refreshing…" : "Rotate Code"}
            </button>
          )}
          <p className="mt-2 text-xs text-[--color-ink-dim]">Share with your crew. Old codes invalidate on rotate.</p>
        </article>
      </div>

      {/* ── Crew roster table ──────────────────────────────────────── */}
      <article className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Active Crew Roster</p>
          <Link
            href={routes.settings}
            prefetch={false}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-ink-dim] transition hover:text-[--color-blue-brand]"
          >
            Open Settings →
          </Link>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-ink-dim]">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Joined</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 5).map((member) => {
                const isOwner = member.role === "owner";
                return (
                  <tr key={member.membershipId} className="border-b border-[--color-border]/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[10px] font-semibold text-[--color-ink-mid]">
                          {initialsForName(member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[--color-ink]">{member.name}</p>
                          <p className="truncate text-[10px] text-[--color-ink-dim]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${roleBadgeClasses(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[10px] text-[--color-ink-dim]">{formatJoinedAt(member.joinedAt)}</td>
                    <td className="py-2.5">
                      {!isOwner && canManageCrew ? (
                        <button
                          type="button"
                          onClick={() => setManageTargetId(member.membershipId)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[--color-border] text-[--color-ink-dim] transition hover:border-[--color-blue-brand]/50 hover:text-[--color-blue-brand]"
                          aria-label={`Manage ${member.name}`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      ) : (
                        <span className="text-[10px] text-[--color-ink-dim]">Owner protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {members.length > 5 && (
          <p className="text-[10px] text-[--color-ink-dim]">
            Showing {memberPreview.length} of {members.length}. Open Settings for full roster.
          </p>
        )}
      </article>
    </div>
  );

  const renderPages = () => {
    const operationsPages = commandPages.filter((page) => page.group === "Operations");
    const referencePages = commandPages.filter((page) => page.group === "Reference");

    return (
      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:grid-cols-[0.9fr,1.1fr]">
        <article className="public-panel-strong flex min-h-0 flex-col gap-4 px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
              Pages & References
            </p>
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-[--color-ink]">
              Consolidated menus for the rest of the system
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[--color-ink-mid]">
              Instead of keeping every destination in a tall rail, the command
              center now gives you focused pages and a clean page launcher.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={routes.privacy}
              prefetch={false}
              className="rounded-2xl border border-[--color-border] bg-white px-4 py-4 transition hover:border-[--color-blue-brand]/50"
            >
              <p className="text-sm font-bold text-[--color-ink]">Privacy Policy</p>
              <p className="mt-1 text-xs leading-relaxed text-[--color-ink-dim]">
                Consent and privacy references for production launch.
              </p>
            </Link>
            <Link
              href={routes.terms}
              prefetch={false}
              className="rounded-2xl border border-[--color-border] bg-white px-4 py-4 transition hover:border-[--color-blue-brand]/50"
            >
              <p className="text-sm font-bold text-[--color-ink]">Terms of Service</p>
              <p className="mt-1 text-xs leading-relaxed text-[--color-ink-dim]">
                Legal operating guardrails for crews and exports.
              </p>
            </Link>
          </div>
          <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim]">
              Recommended launch loop
            </p>
            <ol className="mt-3 grid gap-2 text-sm text-[--color-ink-mid]">
              <li>1. Start in Overview to check queue and owner controls.</li>
              <li>2. Open Launch Pad for calculators.</li>
              <li>3. Move to Workflow before sending or saving.</li>
              <li>4. Use Crew for invite codes and role changes.</li>
            </ol>
          </div>
        </article>

        <div className="grid min-h-0 gap-4">
          <section className="flex min-h-0 flex-col gap-3 rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
                  Operations
                </p>
                <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-[--color-ink]">
                  Core business pages
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {operationsPages.map((page) => (
                <CommandPageCard key={page.label} {...page} />
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-col gap-3 rounded-2xl border border-[--color-border] bg-white px-5 py-5 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
                Reference
              </p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-[--color-ink]">
                Guides and definitions
              </h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {referencePages.map((page) => (
                <CommandPageCard key={page.label} {...page} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderActiveWorkspace = () => {
    if (activeWorkspace === "launch") return renderLaunchPad();
    if (activeWorkspace === "workflow") return renderWorkflow();
    if (activeWorkspace === "crew") return renderCrew();
    if (activeWorkspace === "pages") return renderPages();
    return renderOverview();
  };

  const handleModalInterceptClick = (e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    if (href.startsWith("/calculators/")) {
      e.preventDefault();
      e.stopPropagation();
      const match = toolNavItems.find((t) => t.href === href);
      if (match) {
        setActiveTool(match);
      } else {
        const slug = href.split("/").pop() || "";
        setActiveTool({
          label: "Calculator",
          slug,
          href: href as Route,
          icon: Triangle,
        });
      }
    } else if (href === "/calculators") {
      e.preventDefault();
      e.stopPropagation();
      setActiveTool(null);
    }
  };

  return (
    <div className="command-center-shell command-theme flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none xl:rounded-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--color-border] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
            Command Center
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[--color-ink-dim]">
            <span className="truncate font-semibold text-[--color-ink]">{businessName}</span>
            <span>{todayLabel}</span>
            <span>{workspaceTabs.find((t) => t.slug === activeWorkspace)?.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {proModeMounted ? (
            <button
              type="button"
              onClick={() => setProMode(!proMode)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                proMode
                  ? "border-[--color-blue-brand]/70 bg-[--color-blue-soft] text-[--color-blue-brand]"
                  : "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid]"
              }`}
              aria-pressed={proMode}
            >
              Pro Mode
            </button>
          ) : null}
          <Link
            href={routes.home}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid] transition hover:text-[--color-blue-brand]"
            aria-label="Back to Public Site"
          >
            <Home className="h-4 w-4" aria-hidden />
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Site Home
            </span>
          </Link>
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid] transition hover:text-[--color-blue-brand]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[--color-blue-brand]" />
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonPopoverCard: "rounded-2xl",
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                href={routes.settings}
                label="Business Profile"
                labelIcon={<Settings className="h-4 w-4" aria-hidden />}
              />
              <UserButton.Link
                href={routes.saved}
                label="My Estimates"
                labelIcon={<ClipboardList className="h-4 w-4" aria-hidden />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>

      <div className="border-b border-[--color-border] px-4 py-3 sm:px-5">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {workspaceTabs.map((item) => (
            <WorkspaceTabButton
              key={item.slug}
              label={item.label}
              icon={item.icon}
              active={activeWorkspace === item.slug}
              onClick={() => setActiveWorkspace(item.slug)}
            />
          ))}
        </div>
      </div>

      {(error || success) && (
        <div
          className={`mx-4 mt-4 rounded-2xl border px-4 py-3 text-sm shadow sm:mx-5 ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? success}
        </div>
      )}

      {needsBusinessProfileSetup ? (
        <div className="mx-4 mt-4 rounded-2xl border border-[--color-blue-brand]/25 bg-[--color-blue-soft] px-4 py-3 text-sm text-[--color-ink-mid] sm:mx-5">
          <span className="font-semibold text-[--color-blue-brand]">
            Setup your Business Profile.
          </span>{" "}
          Add your company name so PDFs, emails, and client-facing signing pages use your branding.
          <Link
            href={routes.settings}
            prefetch={false}
            className="ml-2 font-semibold text-[--color-blue-brand] transition hover:text-[--color-blue-brand]"
          >
            Open settings
          </Link>
        </div>
      ) : null}

      {draftMode ? (
        <div className="mx-4 mt-4 rounded-2xl border border-blue-600/30 bg-blue-600/10 px-4 py-3 sm:mx-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--color-blue-brand]">
            Drafting mode
          </p>
          <p className="mt-1 text-sm text-[--color-ink-mid]">
            Start a new estimate from Launch Pad or open Workflow to continue an existing draft.
          </p>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5 lg:overflow-y-auto">
        <div className="h-full min-h-[max-content] lg:min-h-0">
          {renderActiveWorkspace()}
        </div>
      </div>

      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:px-4 sm:py-4">
          <button
            type="button"
            onClick={() => setActiveTool(null)}
            className="absolute inset-0 bg-[--color-ink]/40"
          />
          {activeTradePage ? (
            <div onClickCapture={handleModalInterceptClick} className="relative z-10 flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[--color-border] bg-[--color-bg] shadow-[0_24px_50px_rgba(0,0,0,0.3)] sm:rounded-3xl">
              <div className="sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b border-[--color-border] bg-[--color-nav-bg]/95 px-3 backdrop-blur-sm">
                <nav className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[--color-ink-dim]">
                  Calculators &gt;{" "}
                  {activeTradePage.heroKicker.split("/")[0]?.trim() ?? "Category"}
                </nav>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex h-8 items-center rounded-lg border border-[--color-border] px-2 text-[10px] font-bold uppercase tracking-widest text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                  >
                    Back
                  </button>
                  <p className="max-w-[220px] truncate text-xs font-black uppercase tracking-[0.08em] text-[--color-ink]">
                    {activeTradePage.heroKicker}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[--color-border] text-[--color-ink-dim] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                    aria-label="Close calculator modal"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-[--color-bg]">
                <CommandCenterCalculator page={activeTradePage} closeModal={() => setActiveTool(null)} />
              </div>
            </div>
          ) : (
            <div className="relative z-10 ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-tl-3xl rounded-bl-3xl border border-[--color-border] bg-white shadow-[0_24px_50px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[--color-ink-dim]">
                    Tool Details
                  </p>
                  <p className="text-lg font-black uppercase tracking-tight text-[--color-ink]">
                    {activeTool.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
                  className="rounded-full border border-[--color-border] p-1 text-[--color-ink-dim] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                  aria-label="Close tool detail pane"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-[--color-ink-mid]">
                <p className="text-[--color-ink-dim]">
                  {activeTool.description ??
                    "Field-ready figures, templates, and workflow context for this tool."}
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href={activeTool.href ?? routes.commandCenter}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[--color-blue-brand] bg-[--color-blue-brand] px-4 py-2 text-sm font-black uppercase text-white transition hover:bg-[--color-blue-dark]"
                  >
                    Open {activeTool.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-[--color-border] px-4 py-2 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:text-[--color-blue-brand]"
                  >
                    Close panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {manageTarget && canManageCrew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => (busyMemberId ? undefined : setManageTargetId(null))}
            className="absolute inset-0 bg-[--color-ink]/30"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[--color-border] bg-white p-6 shadow-[0_24px_50px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[--color-blue-brand]">
              Account Control
            </p>
            <h2 className="mt-1 text-xl font-sans font-extrabold tracking-tight text-[--color-ink]">
              {manageTarget.name}
            </h2>
            <p className="text-sm text-[--color-ink-dim]">{manageTarget.email}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateRole(manageTarget.membershipId, "member")}
                disabled={busyMemberId === manageTarget.membershipId}
                className="rounded-2xl border border-[--color-border] px-3 py-2 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:bg-[--color-blue-soft] disabled:opacity-60"
              >
                Set Member
              </button>
              {/* Only the business owner can transfer ownership to another member */}
              {userRole === "owner" && (
                <button
                  type="button"
                  onClick={() => updateRole(manageTarget.membershipId, "owner")}
                  disabled={busyMemberId === manageTarget.membershipId}
                  className="rounded-2xl border border-[--color-border] px-3 py-2 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:bg-[--color-blue-soft] disabled:opacity-60"
                >
                  Promote Owner
                </button>
              )}
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
              className="mt-2 w-full rounded-2xl border border-[--color-border] px-3 py-2 text-sm font-semibold text-[--color-ink-mid] transition hover:border-[--color-blue-brand] hover:bg-[--color-blue-soft] disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

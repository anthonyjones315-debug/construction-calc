"use client";

import {
  Check,
  ChevronLeft,
  FileDown,
  Mail,
  Share2,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { SafeEstimateDTO } from "@/lib/dal/estimates";
import { normalizeEstimateStatus, type EstimateStatus } from "@/lib/estimates/status";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { useContractorProfile } from "@/components/pdf/useContractorProfile";
import { useHaptic } from "@/hooks/useHaptic";
import { supabase } from "@/lib/supabase/client";
import {
  centsToDollars,
  multiplyDollars,
  normalizeDollars,
  toCents,
  sumDollars,
} from "@/utils/money";

// ─── Local types ────────────────────────────────────────────────────────────

type InvoiceStatus = "Draft" | "Sent" | "Partially Paid" | "Paid";

type BudgetRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  actualCost: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: string;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod: string;
  paymentInstructions: string;
  notes: string;
};

type EditDraft = {
  name: string;
  status: EstimateStatus;
  totalCost: string;
  clientName: string;
  jobSiteAddress: string;
  budgetRows: BudgetRow[];
  invoices: Invoice[];
};

function normalizeControlNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  return normalized.length > 0 ? normalized : null;
}

function fallbackEstimateControlNumber(estimateId: string): string {
  const seed = estimateId
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 8);
  return `PC-${seed || "ESTIMATE"}`;
}

function getEstimateControlNumber(estimate: SafeEstimateDTO): string {
  const inputs = estimate.inputs as Record<string, unknown> | null;
  return (
    normalizeControlNumber(inputs?.control_number) ||
    normalizeControlNumber(inputs?.controlNumber) ||
    normalizeControlNumber(inputs?.internal_control_number) ||
    normalizeControlNumber(inputs?.internalControlNumber) ||
    fallbackEstimateControlNumber(estimate.id)
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
function addDaysIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function toNum(s: string): number {
  const n = Number(s);
  return isFinite(n) ? n : 0;
}
function toFixed2(s: string): number {
  return normalizeDollars(toNum(s));
}

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(6);
  let code = "";

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    crypto.getRandomValues(array);
    for (let i = 0; i < 6; i++) code += chars[array[i]! % chars.length];
    return code;
  }

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function parseInvoiceStatus(v: unknown): InvoiceStatus {
  if (v === "Sent" || v === "Partially Paid" || v === "Paid") return v;
  return "Draft";
}
function parseEstimateStatus(v: unknown): EstimateStatus {
  return normalizeEstimateStatus(v);
}

function parseBudgetRows(estimate: SafeEstimateDTO): BudgetRow[] {
  if (!Array.isArray(estimate.budgetItems)) return [];
  return estimate.budgetItems.flatMap((item, i) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return [
      {
        id:
          (typeof row.id === "string" && row.id) ||
          `line-${i}-${crypto.randomUUID()}`,
        name:
          (typeof row.name === "string" && row.name) ||
          (typeof row.label === "string" && row.label) ||
          `Line ${i + 1}`,
        category:
          (typeof row.category === "string" && row.category) || "material",
        quantity: Math.max(
          0,
          Number.isFinite(Number(row.quantity ?? row.qty))
            ? Number(row.quantity ?? row.qty)
            : 1,
        ),
        pricePerUnit: Number.isFinite(
          Number(row.pricePerUnit ?? row.unit_cost ?? row.unitCost),
        )
          ? Number(row.pricePerUnit ?? row.unit_cost ?? row.unitCost)
          : 0,
        actualCost:
          row.actual_cost != null && row.actual_cost !== undefined
            ? String(row.actual_cost)
            : "",
      },
    ];
  });
}

function parseInvoices(estimate: SafeEstimateDTO): Invoice[] {
  const controlNumber = getEstimateControlNumber(estimate);
  const billing = (estimate.inputs as Record<string, unknown> | null)?.billing;
  if (!billing || typeof billing !== "object") return [];
  const rawInvoices = (billing as Record<string, unknown>).invoices;
  if (!Array.isArray(rawInvoices)) return [];
  return rawInvoices
    .map((inv, i) => {
      if (!inv || typeof inv !== "object") return null;
      const row = inv as Record<string, unknown>;
      return {
        id: (typeof row.id === "string" && row.id) || crypto.randomUUID(),
        invoiceNumber:
          (typeof row.invoiceNumber === "string" && row.invoiceNumber) ||
          `${controlNumber}-INV-${String(i + 1).padStart(3, "0")}`,
        amount: typeof row.amount === "number" ? String(row.amount) : "",
        issuedDate:
          (typeof row.issuedDate === "string" && row.issuedDate) || todayIso(),
        dueDate:
          (typeof row.dueDate === "string" && row.dueDate) || addDaysIso(14),
        status: parseInvoiceStatus(row.status),
        paymentMethod:
          (typeof row.paymentMethod === "string" && row.paymentMethod) || "",
        paymentInstructions:
          (typeof row.paymentInstructions === "string" &&
            row.paymentInstructions) ||
          "",
        notes: (typeof row.notes === "string" && row.notes) || "",
      };
    })
    .filter(Boolean) as Invoice[];
}

function makeInvoice(index: number, controlNumber: string): Invoice {
  return {
    id: crypto.randomUUID(),
    invoiceNumber: `${controlNumber}-INV-${String(index).padStart(3, "0")}`,
    amount: "",
    issuedDate: todayIso(),
    dueDate: addDaysIso(14),
    status: "Draft",
    paymentMethod: "",
    paymentInstructions: "",
    notes: "",
  };
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getClientEmail(inputs: Record<string, unknown> | null): string {
  if (!inputs) return "";
  const candidates = [
    inputs.client_email,
    inputs.clientEmail,
    inputs.email,
    (inputs.client as Record<string, unknown> | null | undefined)?.email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) return c.trim();
  }
  return "";
}

function openMailto(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  estimate: SafeEstimateDTO;
};

export function EstimateDetail({ estimate }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const contractor = useContractorProfile();
  const estimateControlNumber = getEstimateControlNumber(estimate);

  const canDelete =
    estimate.viewerRole === "owner" || estimate.viewerRole === "admin";

  const [draft, setDraft] = useState<EditDraft>(() => ({
    name: estimate.name,
    status: parseEstimateStatus(estimate.status),
    totalCost: estimate.totalCost != null ? String(estimate.totalCost) : "",
    clientName: estimate.clientName ?? "",
    jobSiteAddress: estimate.jobSiteAddress ?? "",
    budgetRows: parseBudgetRows(estimate),
    invoices: parseInvoices(estimate),
  }));

  const [saving, setSaving] = useState(false);
  const [saveButtonLocked, setSaveButtonLocked] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(
    estimate.shareCode ?? null,
  );
  const [regenShareBusy, setRegenShareBusy] = useState(false);

  const haptic = useHaptic();
  const saveLockStart = useRef<number>(0);

  // Auto-dismiss "Saved successfully." banner after 2 s
  useEffect(() => {
    if (!saveSuccess) return;
    const t = setTimeout(() => setSaveSuccess(null), 2000);
    return () => clearTimeout(t);
  }, [saveSuccess]);
  const [busy, setBusy] = useState<string | null>(null); // invoice id being generated

  function patchDraft(partial: Partial<EditDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setSaveSuccess(null);
    setSaveError(null);
  }

  function updateInvoice(id: string, partial: Partial<Invoice>) {
    setDraft((d) => ({
      ...d,
      invoices: d.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...partial } : inv,
      ),
    }));
  }

  function addInvoice() {
    setDraft((d) => ({
      ...d,
      invoices: [
        ...d.invoices,
        makeInvoice(d.invoices.length + 1, estimateControlNumber),
      ],
    }));
  }

  function removeInvoice(id: string) {
    setDraft((d) => ({
      ...d,
      invoices: d.invoices.filter((inv) => inv.id !== id),
    }));
  }

  function buildEstimatePdfPayload() {
    const inputs =
      estimate.inputs && typeof estimate.inputs === "object"
        ? (estimate.inputs as Record<string, unknown>)
        : {};
    const finalize =
      inputs.finalize && typeof inputs.finalize === "object"
        ? (inputs.finalize as Record<string, unknown>)
        : {};
    const signing =
      inputs.signing && typeof inputs.signing === "object"
        ? (inputs.signing as Record<string, unknown>)
        : {};
    const storedMaterialList = Array.isArray(finalize.materialList)
      ? finalize.materialList.filter(
          (line): line is string => typeof line === "string" && line.trim().length > 0,
        )
      : [];
    const draftMaterialList = draft.budgetRows
      .filter((row) => row.name.trim())
      .map(
        (row) =>
          `Order ${row.quantity || 0} ${row.name.trim()} @ ${USD.format(row.pricePerUnit || 0)}`,
      );

    return {
      name: draft.name || estimate.name,
      calculator_id: estimate.calculatorId,
      client_name: draft.clientName || null,
      job_site_address: draft.jobSiteAddress || null,
      total_cost: draft.totalCost.trim()
        ? normalizeDollars(Number(draft.totalCost))
        : null,
      results: estimate.results.map((result) => ({
        label: result.label,
        value: result.value,
        unit: result.unit ?? "",
      })),
      material_list:
        storedMaterialList.length > 0
          ? storedMaterialList
          : draftMaterialList.length > 0
            ? draftMaterialList
            : [`Order estimate for ${draft.name || estimate.name}`],
      inputs,
      metadata: {
        title: draft.name || estimate.name,
        calculatorLabel:
          typeof finalize.calculatorLabel === "string" && finalize.calculatorLabel
            ? finalize.calculatorLabel
            : estimate.calculatorId,
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        jobName:
          typeof finalize.jobName === "string" && finalize.jobName
            ? finalize.jobName
            : draft.name || estimate.name,
      },
      signature: {
        signerName:
          typeof signing.signerName === "string" ? signing.signerName : null,
        signerEmail:
          typeof signing.signerEmail === "string" ? signing.signerEmail : null,
        signatureDataUrl:
          typeof signing.signatureDataUrl === "string"
            ? signing.signatureDataUrl
            : null,
        signedAt: typeof signing.signedAt === "string" ? signing.signedAt : null,
      },
    };
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (saveButtonLocked) return;
    setSaveButtonLocked(true);
    saveLockStart.current = Date.now();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const parsedTotal = draft.totalCost.trim()
        ? Number(draft.totalCost)
        : null;
      const totalCost =
        parsedTotal === null || !Number.isFinite(parsedTotal)
          ? null
          : normalizeDollars(parsedTotal);

      const budgetItems = draft.budgetRows.map((row) => {
        const actual = row.actualCost.trim() ? Number(row.actualCost) : null;
        const pricePerUnit = normalizeDollars(row.pricePerUnit);
        return {
          id: row.id,
          name: row.name,
          category: row.category,
          quantity: row.quantity,
          pricePerUnit,
          estimated_cost: multiplyDollars(pricePerUnit, row.quantity),
          actual_cost:
            actual !== null && Number.isFinite(actual)
              ? normalizeDollars(actual)
              : null,
          cost_type: row.category.toLowerCase().includes("labor")
            ? "labor"
            : "material",
        };
      });

      const invoices = draft.invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber.trim(),
        amount: toFixed2(inv.amount),
        issuedDate: inv.issuedDate,
        dueDate: inv.dueDate,
        status: inv.status,
        paymentMethod: inv.paymentMethod.trim(),
        paymentInstructions: inv.paymentInstructions.trim(),
        notes: inv.notes.trim(),
      }));

      const existingInputs =
        estimate.inputs && typeof estimate.inputs === "object"
          ? (estimate.inputs as Record<string, unknown>)
          : {};

      const res = await fetch(`/api/estimates/${estimate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim() || "Untitled Estimate",
          status: draft.status,
          total_cost: totalCost,
          client_name: draft.clientName.trim() || null,
          job_site_address: draft.jobSiteAddress.trim() || null,
          budget_items: budgetItems,
          inputs: {
            ...existingInputs,
            owner: {
              user_id: session?.user?.id ?? null,
              user_email: session?.user?.email ?? null,
              user_name: session?.user?.name ?? null,
            },
            billing: { invoices },
          },
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save.");

      haptic(10);
      setSaveSuccess("Saved successfully.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
      // Enforce 1-second minimum lock to prevent double-tap duplicates
      const elapsed = Date.now() - saveLockStart.current;
      setTimeout(() => setSaveButtonLocked(false), Math.max(0, 1000 - elapsed));
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!confirm("Delete this estimate? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/estimates/${estimate.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/saved");
    } else {
      const payload = await res.json().catch(() => ({}));
      setSaveError(
        payload?.error ?? "Delete failed. You may not have permission.",
      );
      setDeleting(false);
    }
  }

  // ── Estimate PDF ──────────────────────────────────────────────────────────

  async function downloadEstimatePdf() {
    setBusy("estimate-pdf");
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildEstimatePdfPayload()),
      });
      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "PDF generation failed." }));
        throw new Error(payload?.error ?? "PDF generation failed.");
      }

      const blob = await response.blob();
      triggerDownload(
        blob,
        `${sanitizeFilename(draft.name || estimate.name, "estimate")}.pdf`,
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "PDF generation failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function shareEstimate() {
    setBusy("estimate-share");
    try {
      const filename = `${sanitizeFilename(draft.name || estimate.name, "estimate")}.pdf`;
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildEstimatePdfPayload()),
      });
      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Failed to share estimate." }));
        throw new Error(payload?.error ?? "Failed to share estimate.");
      }

      const blob = await response.blob();

      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const file = new File([blob], filename, { type: "application/pdf" });

      if (isMobile() && nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          title: `${draft.name} Estimate`,
          text: "Please review the attached estimate.",
          files: [file],
        });
        setSaveSuccess("Estimate shared.");
        return;
      }

      triggerDownload(blob, filename);
      const subject = encodeURIComponent(`${draft.name} - Estimate`);
      const body = encodeURIComponent(
        `Hi ${draft.clientName || "there"},\n\nPlease review the attached estimate.\n\nThanks,\n${contractor.businessName || "Contractor"}`,
      );
      const to = encodeURIComponent(
        getClientEmail(estimate.inputs as Record<string, unknown> | null),
      );
      openMailto(`mailto:${to}?subject=${subject}&body=${body}`);
      setSaveSuccess(
        "Email compose opened. Estimate downloaded for attachment.",
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to share estimate.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function regenCode() {
    setRegenShareBusy(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      let shareCodeCandidate = generateShareCode();
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from("saved_estimates")
          .update({ share_code: shareCodeCandidate })
          .eq("id", estimate.id)
          .select("share_code")
          .maybeSingle();

        if (!error) {
          const nextCode = data?.share_code ?? shareCodeCandidate;
          setShareCode(nextCode);
          setSaveSuccess("Share code updated.");
          haptic(10);
          return;
        }

        if ((error as { code?: string }).code === "23505") {
          attempts++;
          shareCodeCandidate = generateShareCode();
          continue;
        }

        // Most commonly: auth/RLS on anon browser client. Fall back to server route.
        break;
      }

      const res = await fetch(`/api/estimates/${estimate.id}/regen-share`, {
        method: "POST",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Failed to regenerate share code.");
      }

      const newCode = payload.share_code as string | undefined;
      if (typeof newCode === "string" && newCode.trim()) {
        setShareCode(newCode.trim());
        setSaveSuccess("Share code updated.");
        haptic(10);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to regenerate share code.");
    } finally {
      setRegenShareBusy(false);
    }
  }

  // ── Invoice PDF / Email ───────────────────────────────────────────────────

  async function downloadInvoicePdf(invoice: Invoice) {
    setBusy(invoice.id);
    try {
      const [{ pdf }, { createInvoicePDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/InvoicePDF"),
      ]);
      const contractTotal = normalizeDollars(toNum(draft.totalCost));
      const billedToDate = sumDollars(
        draft.invoices.map((inv) => toNum(inv.amount)),
      );
      const remaining = centsToDollars(
        Math.max(0, toCents(contractTotal) - toCents(billedToDate)),
      );
      const invoiceAmount = toFixed2(invoice.amount);

      const lineItems =
        draft.budgetRows.length > 0
          ? draft.budgetRows
              .filter((r) => r.quantity > 0 && r.pricePerUnit > 0)
              .map((r) => {
                const unitCost = normalizeDollars(r.pricePerUnit);
                return {
                  serviceItem: r.name,
                  quantity: r.quantity,
                  unitCost,
                  total: multiplyDollars(unitCost, r.quantity),
                };
              })
          : [
              {
                serviceItem: draft.name || estimate.name,
                quantity: 1,
                unitCost: invoiceAmount,
                total: invoiceAmount,
              },
            ];

      const blob = await pdf(
        createInvoicePDF({
          estimateTitle: draft.name || estimate.name,
          generatedAt: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          invoiceNumber: invoice.invoiceNumber,
          issuedDate: invoice.issuedDate,
          dueDate: invoice.dueDate,
          invoiceAmount,
          contractTotal,
          billedToDate,
          remainingBalance: remaining,
          invoiceStatus: invoice.status,
          paymentMethod: invoice.paymentMethod,
          paymentInstructions: invoice.paymentInstructions,
          clientName: draft.clientName || undefined,
          clientAddress: draft.jobSiteAddress || undefined,
          contractorProfile: {
            businessName: contractor.businessName,
            businessAddress: contractor.businessAddress,
            businessPhone: contractor.businessPhone,
            businessEmail: contractor.businessEmail,
          },
          lineItems,
        }),
      ).toBlob();

      triggerDownload(
        blob,
        `${sanitizeFilename(draft.name || estimate.name, "estimate")}-${invoice.invoiceNumber}.pdf`,
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Invoice PDF generation failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function emailInvoice(invoice: Invoice) {
    setBusy(`email-${invoice.id}`);
    try {
      const invoiceAmount = toFixed2(invoice.amount);
      const filename = `${sanitizeFilename(draft.name || estimate.name, "estimate")}-${invoice.invoiceNumber}.pdf`;

      await downloadInvoicePdf(invoice);

      const subject = encodeURIComponent(
        `${draft.name || estimate.name} - ${invoice.invoiceNumber}`,
      );
      const body = encodeURIComponent(
        `Hi ${draft.clientName || "there"},\n\nAttached is invoice ${invoice.invoiceNumber} for ${USD.format(invoiceAmount)}.\n\nPayment method: ${invoice.paymentMethod || "to be provided"}\n${invoice.paymentInstructions ? `\n${invoice.paymentInstructions}` : ""}\n\nThanks,\n${contractor.businessName || "Contractor"}`,
      );
      const to = encodeURIComponent(
        getClientEmail(estimate.inputs as Record<string, unknown> | null),
      );
      openMailto(
        `mailto:${to}?subject=${subject}&body=${body}&x-attachment=${encodeURIComponent(filename)}`,
      );
      setSaveSuccess(
        "Email compose opened. Invoice downloaded for attachment.",
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to email invoice.",
      );
    } finally {
      setBusy(null);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalBilled = sumDollars(draft.invoices.map((inv) => toNum(inv.amount)));
  const contractTotal = normalizeDollars(toNum(draft.totalCost));
  const remaining = centsToDollars(
    Math.max(0, toCents(contractTotal) - toCents(totalBilled)),
  );
  const signLinkPath = shareCode ? `/estimate/sign/${shareCode}` : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back / header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/saved"
          className="inline-flex items-center gap-1.5 text-sm text-[--color-ink-mid] hover:text-[--color-ink] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Saved Estimates
        </Link>
        <span className="text-xs text-[--color-ink-dim]">
          Created{" "}
          {new Date(estimate.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <h1 className="text-2xl font-display font-bold text-[--color-ink] leading-tight">
        {draft.name || "Untitled Estimate"}
      </h1>

      {/* Status messages */}
      {saveError && (
        <p className="rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2 text-sm text-red-700">
          {saveError}
        </p>
      )}
      {saveSuccess && (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-sm text-emerald-700">
          {saveSuccess}
        </p>
      )}

      {/* ── Project details ── */}
      <section className="content-card p-4 md:p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[--color-ink-dim]">
          Project Details
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
            Control Number
            <input
              value={estimateControlNumber}
              readOnly
              className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
            Estimate Name
            <input
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
              className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
            Status
            <select
              value={draft.status}
              onChange={(e) =>
                patchDraft({ status: e.target.value as EstimateStatus })
              }
              className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="PENDING">Pending Signature</option>
              <option value="Approved">Approved</option>
              <option value="SIGNED">Signed</option>
              <option value="Lost">Lost</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
            Quote Total ($)
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.totalCost}
              onChange={(e) => patchDraft({ totalCost: e.target.value })}
              className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
            Client Name
            <input
              value={draft.clientName}
              onChange={(e) => patchDraft({ clientName: e.target.value })}
              className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
          Job Site Address
          <input
            value={draft.jobSiteAddress}
            onChange={(e) => patchDraft({ jobSiteAddress: e.target.value })}
            className="rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>
      </section>

      {/* ── Budget line items ── */}
      {draft.budgetRows.length > 0 && (
        <section className="content-card p-4 md:p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[--color-ink-dim]">
            Actual Cost Tracking
          </h2>
          <div className="space-y-2">
            {draft.budgetRows.map((row, i) => {
              const estimated = multiplyDollars(row.pricePerUnit, row.quantity);
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[--color-ink] truncate">
                      {row.name}
                    </p>
                    <p className="text-xs text-[--color-ink-dim]">
                      Estimated: {USD.format(estimated)}
                    </p>
                  </div>
                  <span className="text-xs text-[--color-ink-dim] shrink-0">
                    Actual $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.actualCost}
                    onChange={(e) => {
                      const next = [...draft.budgetRows];
                      next[i] = { ...next[i], actualCost: e.target.value };
                      patchDraft({ budgetRows: next });
                    }}
                    className="w-28 rounded-lg border border-slate-500 bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Progress billing ── */}
      <section className="content-card p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[--color-ink-dim]">
            Progress Billing
          </h2>
          <button
            type="button"
            onClick={addInvoice}
            className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-500 px-3 py-1.5 text-xs font-medium text-[--color-ink] transition-colors hover:border-orange-400"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
            Add Invoice
          </button>
        </div>

        {draft.invoices.length > 0 ? (
          <>
            {/* Billing summary */}
            <div className="content-card-muted flex flex-wrap gap-x-6 gap-y-1 rounded-lg px-4 py-3 text-sm text-[--color-ink-mid]">
              <span>
                Contract:{" "}
                <strong className="text-[--color-ink]">
                  {USD.format(contractTotal)}
                </strong>
              </span>
              <span>
                Billed:{" "}
                <strong className="text-[--color-ink]">
                  {USD.format(totalBilled)}
                </strong>
              </span>
              <span>
                Remaining:{" "}
                <strong className="text-[--color-ink]">
                  {USD.format(remaining)}
                </strong>
              </span>
            </div>

            {/* Invoice cards */}
            <div className="space-y-3">
              {draft.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-4 space-y-3"
                >
                  <div className="grid gap-2 sm:grid-cols-4">
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                      Invoice #
                      <input
                        value={invoice.invoiceNumber}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            invoiceNumber: e.target.value,
                          })
                        }
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                      Amount ($)
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={invoice.amount}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            amount: e.target.value,
                          })
                        }
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                      Issued
                      <input
                        type="date"
                        value={invoice.issuedDate}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            issuedDate: e.target.value,
                          })
                        }
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                      Due
                      <input
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            dueDate: e.target.value,
                          })
                        }
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      />
                    </label>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                      Status
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            status: e.target.value as InvoiceStatus,
                          })
                        }
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid] sm:col-span-2">
                      Payment Method
                      <input
                        value={invoice.paymentMethod}
                        onChange={(e) =>
                          updateInvoice(invoice.id, {
                            paymentMethod: e.target.value,
                          })
                        }
                        placeholder="ACH, Check, Card, Cash…"
                        className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-xs text-[--color-ink-mid]">
                    Payment Instructions
                    <textarea
                      rows={2}
                      value={invoice.paymentInstructions}
                      onChange={(e) =>
                        updateInvoice(invoice.id, {
                          paymentInstructions: e.target.value,
                        })
                      }
                      placeholder="Bank info, mailing address, or payment portal…"
                      className="rounded-lg border border-[--color-border] bg-[--color-surface] px-2 py-1.5 text-xs text-[--color-ink]"
                    />
                  </label>

                  {/* Invoice actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => downloadInvoicePdf(invoice)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[--color-border] px-3 py-1.5 text-xs font-medium text-[--color-ink] hover:border-[--color-orange-brand] transition-colors disabled:opacity-50"
                    >
                      <FileDown className="w-3.5 h-3.5" aria-hidden />
                      {busy === invoice.id
                        ? "Generating…"
                        : "Download Invoice PDF"}
                    </button>
                    <button
                      type="button"
                      onClick={() => emailInvoice(invoice)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[--color-orange-brand]/40 px-3 py-1.5 text-xs font-medium text-[--color-orange-brand] hover:border-[--color-orange-brand] transition-colors disabled:opacity-50"
                    >
                      {isMobile() ? (
                        <Share2 className="w-3.5 h-3.5" aria-hidden />
                      ) : (
                        <Mail className="w-3.5 h-3.5" aria-hidden />
                      )}
                      {busy === `email-${invoice.id}`
                        ? "Opening…"
                        : isMobile()
                          ? "Share Invoice"
                          : "Email Invoice"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeInvoice(invoice.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[--color-ink-dim]">
            No invoices yet. Add one to start progress billing for this project.
          </p>
        )}
      </section>

      {/* ── Share code ── */}
      <section className="mb-6 rounded-2xl border border-[--color-border] bg-[--color-surface-alt] p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[--color-ink-mid]">
          Sign link
        </h3>
        <p className="mt-1 text-xs text-[--color-ink-dim]">
          Client-facing short code for signature links. Regenerate to invalidate the previous code.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm font-mono font-semibold text-[--color-ink]">
            {shareCode || "—"}
          </code>
          {signLinkPath ? (
            <Link
              href={signLinkPath as import("next").Route}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[--color-border] px-4 py-2 text-sm font-medium text-[--color-ink] hover:border-[--color-orange-brand] transition-colors"
            >
              Open Sign Page
            </Link>
          ) : null}
          <button
            type="button"
            onClick={regenCode}
            disabled={regenShareBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-[--color-orange-brand]/40 px-4 py-2 text-sm font-medium text-[--color-orange-brand] hover:border-[--color-orange-brand] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${regenShareBusy ? "animate-spin" : ""}`} aria-hidden />
            {regenShareBusy ? "Regenerating…" : "Regenerate code"}
          </button>
        </div>
      </section>

      {/* ── Action bar ── */}
      <div className="flex flex-wrap items-center gap-3 pb-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saveButtonLocked}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[--color-orange-brand] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[--color-orange-dark] transition-all duration-200 disabled:opacity-60 ${saveButtonLocked ? "scale-95" : ""}`}
        >
          {saving ? (
            "Saving…"
          ) : saveButtonLocked ? (
            <>
              <Check className="h-4 w-4 text-white" aria-hidden />
              Synced
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        <button
          type="button"
          onClick={downloadEstimatePdf}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-[--color-border] bg-[--color-surface] px-6 py-2.5 text-sm font-medium text-[--color-ink] hover:border-[--color-orange-brand] disabled:opacity-50 transition-colors"
        >
          <FileDown className="w-4 h-4" aria-hidden />
          {busy === "estimate-pdf" ? "Generating…" : "Estimate PDF"}
        </button>

        <button
          type="button"
          onClick={shareEstimate}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-[--color-orange-brand]/40 px-6 py-2.5 text-sm font-medium text-[--color-orange-brand] hover:border-[--color-orange-brand] disabled:opacity-50 transition-colors"
        >
          {isMobile() ? (
            <Share2 className="w-4 h-4" aria-hidden />
          ) : (
            <Mail className="w-4 h-4" aria-hidden />
          )}
          {busy === "estimate-share"
            ? "Opening…"
            : isMobile()
              ? "Share Estimate"
              : "Email Estimate"}
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
            {deleting ? "Deleting…" : "Delete Estimate"}
          </button>
        )}
      </div>
    </div>
  );
}

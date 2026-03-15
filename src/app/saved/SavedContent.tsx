"use client";

import {
  Bookmark,
  FileDown,
  Trash2,
  Calculator,
  LogIn,
  PackagePlus,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FinancialDashboard,
  formatStatus,
  getEstimateStatus,
  getProjectProfitMargin,
  type SavedEstimate,
} from "@/components/financial/FinancialDashboard";
import type { FinancialData } from "@/components/financial/FinancialDataFetcher";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { useContractorProfile } from "@/components/pdf/useContractorProfile";

const LIVE_REFRESH_MS = 15000;

const USD_CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type SavedContentProps = {
  serverFinancialData: FinancialData;
  initialEstimates: SavedEstimate[];
  isAuthenticated: boolean;
};

type PriceBookItem = {
  id: string;
  material_name: string;
  category?: string | null;
  unit_type?: string | null;
  unit_cost: number;
};

type BuilderRow = {
  materialId: string;
  quantity: number;
};

type EstimateStatus = "Draft" | "Sent" | "Approved" | "Lost";

type EstimateBudgetRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  actualCost: string;
};

type EstimateEditDraft = {
  name: string;
  ownerName: string;
  status: EstimateStatus;
  totalCost: string;
  clientName: string;
  jobSiteAddress: string;
  budgetRows: EstimateBudgetRow[];
  invoices: ProgressInvoice[];
};

type InvoiceStatus = "Draft" | "Sent" | "Partially Paid" | "Paid";

type ProgressInvoice = {
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

type EstimateInputsShape = {
  control_number?: string;
  controlNumber?: string;
  internal_control_number?: string;
  internalControlNumber?: string;
  owner?: {
    user_id?: string;
    user_email?: string;
    user_name?: string;
  };
  billing?: {
    invoices?: Array<{
      id?: string;
      invoiceNumber?: string;
      amount?: number;
      issuedDate?: string;
      dueDate?: string;
      status?: InvoiceStatus;
      paymentMethod?: string;
      paymentInstructions?: string;
      notes?: string;
    }>;
  };
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

export function SavedContent({
  serverFinancialData,
  initialEstimates,
  isAuthenticated,
}: SavedContentProps) {
  const { data: session, status } = useSession();
  const contractorProfile = useContractorProfile();
  const effectiveServerFinancialData = isAuthenticated
    ? serverFinancialData
    : undefined;
  const [estimates, setEstimates] = useState<SavedEstimate[]>(initialEstimates);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedEstimate | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [materials, setMaterials] = useState<PriceBookItem[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [creatingEstimate, setCreatingEstimate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [openEstimateId, setOpenEstimateId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EstimateEditDraft | null>(null);
  const [, setUpdatingEstimateId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [, setInvoiceBusyId] = useState<string | null>(null);
  const [builderName, setBuilderName] = useState("Price Book Estimate");
  const [builderClientName, setBuilderClientName] = useState("");
  const [builderJobSiteAddress, setBuilderJobSiteAddress] = useState("");
  const [builderRows, setBuilderRows] = useState<BuilderRow[]>([]);
  const [attachedEstimateId, setAttachedEstimateId] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(
    isAuthenticated ? new Date() : null,
  );

  function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysIso(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function toNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function toCurrencyFixed(value: string): number {
    return Number(toNumber(value).toFixed(2));
  }

  function getEstimateControlNumber(estimate: SavedEstimate): string {
    const inputs = estimate.inputs as EstimateInputsShape | null;
    return (
      normalizeControlNumber(inputs?.control_number) ||
      normalizeControlNumber(inputs?.controlNumber) ||
      normalizeControlNumber(inputs?.internal_control_number) ||
      normalizeControlNumber(inputs?.internalControlNumber) ||
      fallbackEstimateControlNumber(estimate.id)
    );
  }

  function formatInvoiceNumber(controlNumber: string, index: number): string {
    return `${controlNumber}-INV-${String(index).padStart(3, "0")}`;
  }

  function createInvoiceDraft(
    index: number,
    controlNumber: string,
  ): ProgressInvoice {
    return {
      id: crypto.randomUUID(),
      invoiceNumber: formatInvoiceNumber(controlNumber, index),
      amount: "",
      issuedDate: todayIsoDate(),
      dueDate: addDaysIso(14),
      status: "Draft",
      paymentMethod: "",
      paymentInstructions: "",
      notes: "",
    };
  }

  function parseInvoices(estimate: SavedEstimate): ProgressInvoice[] {
    const inputs = estimate.inputs as EstimateInputsShape | null;
    const controlNumber = getEstimateControlNumber(estimate);
    const rawInvoices = inputs?.billing?.invoices;
    if (!Array.isArray(rawInvoices)) return [];

    return rawInvoices.map((invoice, index) => ({
      id: (typeof invoice.id === "string" && invoice.id) || crypto.randomUUID(),
      invoiceNumber:
        (typeof invoice.invoiceNumber === "string" && invoice.invoiceNumber) ||
        formatInvoiceNumber(controlNumber, index + 1),
      amount:
        typeof invoice.amount === "number" && Number.isFinite(invoice.amount)
          ? String(invoice.amount)
          : "",
      issuedDate:
        (typeof invoice.issuedDate === "string" && invoice.issuedDate) ||
        todayIsoDate(),
      dueDate:
        (typeof invoice.dueDate === "string" && invoice.dueDate) ||
        addDaysIso(14),
      status:
        invoice.status === "Draft" ||
        invoice.status === "Sent" ||
        invoice.status === "Partially Paid" ||
        invoice.status === "Paid"
          ? invoice.status
          : "Draft",
      paymentMethod:
        (typeof invoice.paymentMethod === "string" && invoice.paymentMethod) ||
        "",
      paymentInstructions:
        (typeof invoice.paymentInstructions === "string" &&
          invoice.paymentInstructions) ||
        "",
      notes: (typeof invoice.notes === "string" && invoice.notes) || "",
    }));
  }

  function toPdfBudgetItems(estimate: SavedEstimate) {
    if (!Array.isArray(estimate.budget_items)) return undefined;

    return estimate.budget_items
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const quantity = Number(row.quantity ?? row.qty ?? 0);
        const pricePerUnit = Number(
          row.pricePerUnit ?? row.unit_cost ?? row.unitCost ?? 0,
        );
        if (!Number.isFinite(quantity) || !Number.isFinite(pricePerUnit)) {
          return null;
        }

        return {
          id:
            (typeof row.id === "string" && row.id) ||
            `line-${index}-${crypto.randomUUID()}`,
          name:
            (typeof row.name === "string" && row.name) ||
            (typeof row.label === "string" && row.label) ||
            `Line ${index + 1}`,
          quantity,
          unit:
            (typeof row.unit === "string" && row.unit) ||
            (typeof row.unit_type === "string" && row.unit_type) ||
            "unit",
          pricePerUnit,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  }

  function isMobileSharePreferred(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getClientEmail(estimate: SavedEstimate): string | null {
    const inputs =
      estimate.inputs && typeof estimate.inputs === "object"
        ? (estimate.inputs as Record<string, unknown>)
        : null;

    const directCandidates = [
      inputs?.client_email,
      inputs?.clientEmail,
      inputs?.contact_email,
      inputs?.contactEmail,
      inputs?.email,
    ];

    for (const candidate of directCandidates) {
      if (typeof candidate === "string" && candidate.includes("@")) {
        return candidate.trim();
      }
    }

    const nestedClient =
      inputs?.client && typeof inputs.client === "object"
        ? (inputs.client as Record<string, unknown>)
        : null;
    const nestedEmail = nestedClient?.email;
    if (typeof nestedEmail === "string" && nestedEmail.includes("@")) {
      return nestedEmail.trim();
    }

    return null;
  }

  function openDefaultMailClient(mailtoUrl: string): boolean {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return false;
    }

    try {
      const link = document.createElement("a");
      link.href = mailtoUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch {
      try {
        window.location.assign(mailtoUrl);
        return true;
      } catch {
        return false;
      }
    }
  }

  async function createInvoiceBlob(
    estimate: SavedEstimate,
    invoice: ProgressInvoice,
    invoices: ProgressInvoice[],
  ) {
    const { pdf } = await import("@react-pdf/renderer");
    const { createInvoicePDF } = await import("@/components/pdf/InvoicePDF");

    const contractTotal = Number(estimate.total_cost ?? 0);
    const billedToDate = Number(
      invoices.reduce((sum, row) => sum + toNumber(row.amount), 0).toFixed(2),
    );
    const remainingBalance = Number(
      Math.max(0, contractTotal - billedToDate).toFixed(2),
    );
    const invoiceAmount = toCurrencyFixed(invoice.amount);

    const lineItems = Array.isArray(estimate.budget_items)
      ? estimate.budget_items
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const quantity = Number(row.quantity ?? row.qty ?? 1);
            const unitCost = Number(
              row.pricePerUnit ?? row.unit_cost ?? row.unitCost ?? 0,
            );
            const serviceItem = String(
              row.name ?? row.label ?? "Service Item",
            ).trim();
            if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) {
              return null;
            }
            return {
              serviceItem: serviceItem || "Service Item",
              quantity,
              unitCost,
              total: Number((quantity * unitCost).toFixed(2)),
            };
          })
          .filter((row): row is NonNullable<typeof row> => Boolean(row))
      : [];

    const invoiceDoc = createInvoicePDF({
      estimateTitle: estimate.name,
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
      remainingBalance,
      invoiceStatus: invoice.status,
      paymentMethod: invoice.paymentMethod,
      paymentInstructions: invoice.paymentInstructions,
      clientName: estimate.client_name ?? undefined,
      clientAddress: estimate.job_site_address ?? undefined,
      contractorProfile: {
        businessName: contractorProfile.businessName,
        businessAddress: contractorProfile.businessAddress,
        businessPhone: contractorProfile.businessPhone,
        businessEmail: contractorProfile.businessEmail,
      },
      lineItems:
        lineItems.length > 0
          ? lineItems
          : [
              {
                serviceItem: estimate.name,
                quantity: 1,
                unitCost: invoiceAmount,
                total: invoiceAmount,
              },
            ],
    });

    return pdf(invoiceDoc).toBlob();
  }

  async function shareOrEmailInvoice(
    estimate: SavedEstimate,
    invoice: ProgressInvoice,
    invoices: ProgressInvoice[],
  ) {
    const invoiceAmount = toCurrencyFixed(invoice.amount);
    const sanitizedEstimate = sanitizeFilename(estimate.name, "estimate");
    const invoiceFileName = `${sanitizedEstimate}-${invoice.invoiceNumber || "invoice"}.pdf`;

    setInvoiceBusyId(invoice.id);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const blob = await createInvoiceBlob(estimate, invoice, invoices);

      if (isMobileSharePreferred() && typeof navigator !== "undefined") {
        const mobileNavigator = navigator as Navigator & {
          canShare?: (data?: ShareData) => boolean;
        };

        const file = new File([blob], invoiceFileName, {
          type: "application/pdf",
        });

        if (
          typeof mobileNavigator.share === "function" &&
          typeof mobileNavigator.canShare === "function" &&
          mobileNavigator.canShare({ files: [file] })
        ) {
          await mobileNavigator.share({
            title: `${estimate.name} - ${invoice.invoiceNumber}`,
            text: `Invoice ${invoice.invoiceNumber} for ${USD_CURRENCY.format(invoiceAmount)}.`,
            files: [file],
          });
          setUpdateSuccess("Invoice shared.");
          return;
        }

        if (typeof mobileNavigator.share === "function") {
          await mobileNavigator.share({
            title: `${estimate.name} - ${invoice.invoiceNumber}`,
            text: `Invoice ${invoice.invoiceNumber} for ${USD_CURRENCY.format(invoiceAmount)}. Please sign and return via email.`,
          });
          triggerDownload(blob, invoiceFileName);
          setUpdateSuccess("Share sheet opened. Invoice also downloaded.");
          return;
        }
      }

      triggerDownload(blob, invoiceFileName);
      const subject = encodeURIComponent(
        `${estimate.name} - ${invoice.invoiceNumber}`,
      );
      const body = encodeURIComponent(
        `Hi ${estimate.client_name || "there"},\n\nAttached is invoice ${invoice.invoiceNumber} for ${USD_CURRENCY.format(invoiceAmount)}.\n\nPlease review, sign, and return this invoice by email.\n\nPayment details:\nMethod: ${invoice.paymentMethod || "Not specified"}\nInstructions: ${invoice.paymentInstructions || "Not specified"}\n\nThanks,\n${contractorProfile.businessName || "Contractor"}`,
      );
      const emailTo = getClientEmail(estimate) ?? "";
      const opened = openDefaultMailClient(
        `mailto:${encodeURIComponent(emailTo)}?subject=${subject}&body=${body}`,
      );
      if (!opened) {
        setUpdateError(
          "Could not open your email client automatically. Invoice was downloaded—attach it manually.",
        );
        return;
      }
      setUpdateSuccess(
        "Email compose opened. Invoice downloaded for attachment.",
      );
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to send invoice.",
      );
    } finally {
      setInvoiceBusyId(null);
    }
  }

  async function sendEstimateForSignature(estimate: SavedEstimate) {
    setInvoiceBusyId(`estimate-${estimate.id}`);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { createEstimatePDF } =
        await import("@/components/pdf/EstimatePDF");
      const blob = await pdf(
        createEstimatePDF({
          title: estimate.name,
          calculatorLabel: estimate.calculator_id,
          controlNumber: getEstimateControlNumber(estimate),
          clientName: estimate.client_name ?? null,
          jobSiteAddress: estimate.job_site_address ?? null,
          results: estimate.results,
          budgetItems: toPdfBudgetItems(estimate),
          totalCost: Number(estimate.total_cost ?? 0),
          contractorProfile: {
            businessName: contractorProfile.businessName,
            logoUrl: contractorProfile.logoUrl,
            businessAddress: contractorProfile.businessAddress,
            businessPhone: contractorProfile.businessPhone,
            businessEmail: contractorProfile.businessEmail,
          },
          generatedAt: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }),
      ).toBlob();

      const estimateFileName = `${sanitizeFilename(estimate.name, "estimate")}.pdf`;

      if (isMobileSharePreferred() && typeof navigator !== "undefined") {
        const mobileNavigator = navigator as Navigator & {
          canShare?: (data?: ShareData) => boolean;
        };

        const file = new File([blob], estimateFileName, {
          type: "application/pdf",
        });

        if (
          typeof mobileNavigator.share === "function" &&
          typeof mobileNavigator.canShare === "function" &&
          mobileNavigator.canShare({ files: [file] })
        ) {
          await mobileNavigator.share({
            title: `${estimate.name} Estimate`,
            text: "Please review, sign, and return this estimate via email.",
            files: [file],
          });
          setUpdateSuccess("Estimate shared.");
          return;
        }
      }

      triggerDownload(blob, estimateFileName);
      const subject = encodeURIComponent(`${estimate.name} - Estimate`);
      const body = encodeURIComponent(
        `Hi ${estimate.client_name || "there"},\n\nPlease review the attached estimate and return a signed copy by email to proceed.\n\nThanks,\n${contractorProfile.businessName || "Contractor"}`,
      );
      const emailTo = getClientEmail(estimate) ?? "";
      const opened = openDefaultMailClient(
        `mailto:${encodeURIComponent(emailTo)}?subject=${subject}&body=${body}`,
      );
      if (!opened) {
        setUpdateError(
          "Could not open your email client automatically. Estimate was downloaded—attach it manually.",
        );
        return;
      }
      setUpdateSuccess(
        "Email compose opened. Estimate downloaded for attachment.",
      );
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to send estimate.",
      );
    } finally {
      setInvoiceBusyId(null);
    }
  }

  function getEstimateOwnerLabel(estimate: SavedEstimate): string {
    const owner = (estimate.inputs as EstimateInputsShape | null)?.owner;
    const ownerName = owner?.user_name?.trim();
    const ownerEmail = owner?.user_email?.trim();

    if (ownerName && ownerEmail) return `${ownerName} (${ownerEmail})`;
    if (ownerName) return ownerName;
    if (ownerEmail) return ownerEmail;
    if (session?.user?.name?.trim()) return session.user.name;
    return session?.user?.email || "You";
  }

  function parseBudgetRows(estimate: SavedEstimate): EstimateBudgetRow[] {
    if (!Array.isArray(estimate.budget_items)) return [];

    return estimate.budget_items
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;

        const id =
          (typeof row.id === "string" && row.id) ||
          `line-${index}-${crypto.randomUUID()}`;
        const name =
          (typeof row.name === "string" && row.name) ||
          (typeof row.label === "string" && row.label) ||
          `Line ${index + 1}`;
        const category =
          (typeof row.category === "string" && row.category) || "material";
        const quantity = Number(row.quantity ?? row.qty ?? 1);
        const pricePerUnit = Number(
          row.pricePerUnit ?? row.unit_cost ?? row.unitCost ?? 0,
        );
        const rawActual = row.actual_cost ?? row.actualCost ?? "";

        return {
          id,
          name,
          category,
          quantity:
            Number.isFinite(quantity) && quantity > 0
              ? quantity
              : Number.isFinite(pricePerUnit) && pricePerUnit > 0
                ? 1
                : 0,
          pricePerUnit: Number.isFinite(pricePerUnit) ? pricePerUnit : 0,
          actualCost:
            rawActual === null || rawActual === undefined
              ? ""
              : String(rawActual),
        };
      })
      .filter((row): row is EstimateBudgetRow => Boolean(row));
  }

  function openEstimateEditor(estimate: SavedEstimate) {
    const owner = (estimate.inputs as EstimateInputsShape | null)?.owner;
    setOpenEstimateId(estimate.id);
    setUpdateError(null);
    setUpdateSuccess(null);
    setEditDraft({
      name: estimate.name,
      ownerName: owner?.user_name?.trim() || session?.user?.name?.trim() || "",
      status: getEstimateStatus(estimate),
      totalCost:
        estimate.total_cost !== null && Number.isFinite(estimate.total_cost)
          ? String(estimate.total_cost)
          : "",
      clientName: estimate.client_name ?? "",
      jobSiteAddress: estimate.job_site_address ?? "",
      budgetRows: parseBudgetRows(estimate),
      invoices: parseInvoices(estimate),
    });
  }

  async function saveEstimateFinancials(estimateId: string) {
    if (!editDraft) return;

    setUpdatingEstimateId(estimateId);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const trimmedTotal = editDraft.totalCost.trim();
      const parsedTotal = trimmedTotal === "" ? null : Number(trimmedTotal);
      const totalCost =
        parsedTotal === null
          ? null
          : Number.isFinite(parsedTotal)
            ? parsedTotal
            : null;

      const budget_items = editDraft.budgetRows.map((row) => {
        const parsedActual = Number(row.actualCost);
        const actualCost =
          row.actualCost.trim() === ""
            ? null
            : Number.isFinite(parsedActual)
              ? parsedActual
              : null;
        const estimated = (row.quantity || 0) * (row.pricePerUnit || 0);

        return {
          id: row.id,
          name: row.name,
          category: row.category,
          quantity: row.quantity,
          pricePerUnit: row.pricePerUnit,
          estimated_cost: Number(estimated.toFixed(2)),
          actual_cost: actualCost,
          cost_type: row.category.toLowerCase().includes("labor")
            ? "labor"
            : "material",
        };
      });

      const response = await fetch(`/api/estimates/${estimateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: (() => {
          const existingEstimate = estimates.find(
            (row) => row.id === estimateId,
          );
          const existingInputs =
            existingEstimate &&
            existingEstimate.inputs &&
            typeof existingEstimate.inputs === "object"
              ? (existingEstimate.inputs as Record<string, unknown>)
              : {};

          const serializedInvoices = editDraft.invoices.map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber.trim(),
            amount: toCurrencyFixed(invoice.amount),
            issuedDate: invoice.issuedDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            paymentMethod: invoice.paymentMethod.trim(),
            paymentInstructions: invoice.paymentInstructions.trim(),
            notes: invoice.notes.trim(),
          }));

          return JSON.stringify({
            name: editDraft.name.trim() || "Untitled Estimate",
            status: editDraft.status,
            total_cost: totalCost,
            client_name: editDraft.clientName.trim() || null,
            job_site_address: editDraft.jobSiteAddress.trim() || null,
            budget_items,
            inputs: {
              ...existingInputs,
              owner: {
                user_id: session?.user?.id ?? null,
                user_email: session?.user?.email ?? null,
                user_name:
                  editDraft.ownerName.trim() || session?.user?.name || null,
              },
              billing: {
                invoices: serializedInvoices,
              },
            },
          });
        })(),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to update estimate.");
      }

      setEstimates((prev) =>
        prev.map((estimate) =>
          estimate.id === estimateId
            ? {
                ...estimate,
                name: editDraft.name.trim() || "Untitled Estimate",
                status: editDraft.status,
                total_cost: totalCost,
                client_name: editDraft.clientName.trim() || null,
                job_site_address: editDraft.jobSiteAddress.trim() || null,
                budget_items,
                inputs: {
                  ...(typeof estimate.inputs === "object" && estimate.inputs
                    ? estimate.inputs
                    : {}),
                  owner: {
                    user_id: session?.user?.id ?? null,
                    user_email: session?.user?.email ?? null,
                    user_name:
                      editDraft.ownerName.trim() || session?.user?.name || null,
                  },
                  billing: {
                    invoices: editDraft.invoices.map((invoice) => ({
                      id: invoice.id,
                      invoiceNumber: invoice.invoiceNumber,
                      amount: toCurrencyFixed(invoice.amount),
                      issuedDate: invoice.issuedDate,
                      dueDate: invoice.dueDate,
                      status: invoice.status,
                      paymentMethod: invoice.paymentMethod,
                      paymentInstructions: invoice.paymentInstructions,
                      notes: invoice.notes,
                    })),
                  },
                },
                updated_at: new Date().toISOString(),
              }
            : estimate,
        ),
      );
      setUpdateSuccess("Estimate financials updated.");
      setLastUpdatedAt(new Date());
      await fetchEstimates();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update estimate.",
      );
    } finally {
      setUpdatingEstimateId(null);
    }
  }

  function addInvoiceToDraft() {
    const controlNumber =
      (openEstimateId &&
        estimates.find((estimate) => estimate.id === openEstimateId) &&
        getEstimateControlNumber(
          estimates.find((estimate) => estimate.id === openEstimateId)!,
        )) ||
      "PC-ESTIMATE";

    setEditDraft((current) => {
      if (!current) return current;
      const nextInvoice = createInvoiceDraft(
        current.invoices.length + 1,
        controlNumber,
      );
      return {
        ...current,
        invoices: [...current.invoices, nextInvoice],
      };
    });
  }

  function updateInvoiceInDraft(
    invoiceId: string,
    next: Partial<ProgressInvoice>,
  ) {
    setEditDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        invoices: current.invoices.map((invoice) =>
          invoice.id === invoiceId ? { ...invoice, ...next } : invoice,
        ),
      };
    });
  }

  function removeInvoiceFromDraft(invoiceId: string) {
    setEditDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        invoices: current.invoices.filter(
          (invoice) => invoice.id !== invoiceId,
        ),
      };
    });
  }

  async function downloadInvoicePdf(
    estimate: SavedEstimate,
    invoice: ProgressInvoice,
    invoices: ProgressInvoice[],
  ) {
    setInvoiceBusyId(invoice.id);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const blob = await createInvoiceBlob(estimate, invoice, invoices);
      const invoiceFileName = `${sanitizeFilename(estimate.name, "estimate")}-${invoice.invoiceNumber || "invoice"}.pdf`;
      triggerDownload(blob, invoiceFileName);
      setUpdateSuccess("Invoice downloaded.");
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to generate invoice.",
      );
    } finally {
      setInvoiceBusyId(null);
    }
  }

  void shareOrEmailInvoice;
  void sendEstimateForSignature;
  void openEstimateEditor;
  void saveEstimateFinancials;
  void addInvoiceToDraft;
  void updateInvoiceInDraft;
  void removeInvoiceFromDraft;
  void downloadInvoicePdf;

  const attachedEstimate = useMemo(() => {
    if (!attachedEstimateId) return null;
    return (
      estimates.find((estimate) => estimate.id === attachedEstimateId) ?? null
    );
  }, [attachedEstimateId, estimates]);

  const selectedMaterialRows = useMemo(() => {
    return builderRows
      .map((row) => {
        const material = materials.find((item) => item.id === row.materialId);
        if (!material) return null;

        const quantity =
          Number.isFinite(row.quantity) && row.quantity > 0 ? row.quantity : 0;
        const lineTotal = quantity * Number(material.unit_cost || 0);

        return {
          material,
          quantity,
          lineTotal,
        };
      })
      .filter(
        (
          row,
        ): row is {
          material: PriceBookItem;
          quantity: number;
          lineTotal: number;
        } => Boolean(row),
      );
  }, [builderRows, materials]);

  const priceBookSubtotal = useMemo(() => {
    return selectedMaterialRows.reduce((sum, row) => sum + row.lineTotal, 0);
  }, [selectedMaterialRows]);

  const fetchEstimates = useCallback(
    async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
      if (!isAuthenticated && !session?.user?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await fetch("/api/estimates", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load estimates");
        }

        setEstimates((payload.estimates as SavedEstimate[]) ?? []);
        setFetchError(null);
        setLastUpdatedAt(new Date());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load estimates";
        setFetchError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, session?.user?.id],
  );

  useEffect(() => {
    if (status === "loading" && !isAuthenticated) return;
    if (!isAuthenticated && !session?.user?.id) {
      setLoading(false);
      return;
    }

    fetchEstimates({ showLoading: !isAuthenticated });
  }, [fetchEstimates, isAuthenticated, session?.user?.id, status]);

  useEffect(() => {
    if (!isAuthenticated && !session?.user?.id) return;

    const interval = window.setInterval(() => {
      fetchEstimates();
    }, LIVE_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [fetchEstimates, isAuthenticated, session?.user?.id]);

  useEffect(() => {
    if (!showBuilder || !session?.user?.id) return;

    let cancelled = false;
    setMaterialsLoading(true);
    setMaterialsError(null);

    fetch("/api/materials", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load price book items.");
        }
        return (payload?.data ?? []) as PriceBookItem[];
      })
      .then((rows) => {
        if (cancelled) return;
        setMaterials(rows);
      })
      .catch((error) => {
        if (cancelled) return;
        setMaterialsError(
          error instanceof Error
            ? error.message
            : "Failed to load price book items.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setMaterialsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showBuilder, session?.user?.id]);

  function addBuilderRow() {
    setBuilderRows((rows) => [...rows, { materialId: "", quantity: 1 }]);
  }

  function removeBuilderRow(index: number) {
    setBuilderRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateBuilderRow(index: number, next: Partial<BuilderRow>) {
    setBuilderRows((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              ...next,
            }
          : row,
      ),
    );
  }

  async function createEstimateFromBuilder() {
    if (!session?.user?.id) return;

    if (!selectedMaterialRows.length && !attachedEstimate) {
      setCreateError(
        "Add at least one price book line item or attach an existing calculator estimate.",
      );
      return;
    }

    setCreatingEstimate(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const sourceChannels = ["pricebook"];
      if (attachedEstimate) sourceChannels.push("calculator");

      const budgetItems = selectedMaterialRows.map(
        ({ material, quantity, lineTotal }) => ({
          id: material.id,
          name: material.material_name,
          category: material.category ?? "Other",
          unit_type: material.unit_type ?? "each",
          quantity,
          pricePerUnit: material.unit_cost,
          line_total: lineTotal,
          cost_type: "material",
          source: "pricebook",
        }),
      );

      const attachedTotal = attachedEstimate?.total_cost ?? 0;
      const combinedTotal = priceBookSubtotal + attachedTotal;
      const calculatorResults = attachedEstimate?.results ?? [];
      const results = [
        ...calculatorResults,
        {
          label: "Price Book Subtotal",
          value: Number(priceBookSubtotal.toFixed(2)),
          unit: "USD",
          highlight: priceBookSubtotal > 0,
        },
        {
          label: "Combined Estimate Total",
          value: Number(combinedTotal.toFixed(2)),
          unit: "USD",
          highlight: true,
        },
      ];

      const response = await fetch("/api/estimates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: builderName.trim() || "Price Book Estimate",
          calculator_id: attachedEstimate?.calculator_id ?? "pricebook_direct",
          client_name: builderClientName.trim() || null,
          job_site_address: builderJobSiteAddress.trim() || null,
          budget_items: budgetItems,
          total_cost:
            combinedTotal > 0 ? Number(combinedTotal.toFixed(2)) : null,
          results,
          inputs: {
            source_channels: sourceChannels,
            attached_estimate_id: attachedEstimate?.id ?? null,
            owner: {
              user_id: session.user.id,
              user_email: session.user.email ?? null,
              user_name: session.user.name ?? null,
            },
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to save estimate.");
      }

      setCreateSuccess("Estimate saved successfully.");
      setBuilderRows([]);
      setAttachedEstimateId("");
      setBuilderClientName("");
      setBuilderJobSiteAddress("");
      await fetchEstimates();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to save estimate.",
      );
    } finally {
      setCreatingEstimate(false);
    }
  }

  function requestDeleteEstimate(estimate: SavedEstimate) {
    setUpdateError(null);
    setUpdateSuccess(null);
    setDeleteTarget(estimate);
  }

  async function confirmDeleteEstimate() {
    if (!deleteTarget) return;

    setDeleting(deleteTarget.id);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/estimates/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Failed to delete estimate.",
        );
      }

      setEstimates((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      if (openEstimateId === deleteTarget.id) {
        setOpenEstimateId(null);
        setEditDraft(null);
      }
      setDeleteTarget(null);
      setUpdateSuccess("Estimate deleted.");
      setLastUpdatedAt(new Date());
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to delete estimate.",
      );
    } finally {
      setDeleting(null);
    }
  }

  async function downloadPDF(estimate: SavedEstimate) {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { createEstimatePDF } =
        await import("@/components/pdf/EstimatePDF");
      const blob = await pdf(
        createEstimatePDF({
          title: estimate.name,
          calculatorLabel: estimate.calculator_id,
          controlNumber: getEstimateControlNumber(estimate),
          clientName: estimate.client_name ?? null,
          jobSiteAddress: estimate.job_site_address ?? null,
          results: estimate.results,
          budgetItems: toPdfBudgetItems(estimate),
          totalCost: Number(estimate.total_cost ?? 0),
          contractorProfile: {
            businessName: contractorProfile.businessName,
            logoUrl: contractorProfile.logoUrl,
            businessAddress: contractorProfile.businessAddress,
            businessPhone: contractorProfile.businessPhone,
            businessEmail: contractorProfile.businessEmail,
          },
          generatedAt: new Date(estimate.created_at).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" },
          ),
        }),
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(estimate.name, "estimate")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("PDF export failed — try again");
      setTimeout(() => setDownloadError(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && status !== "authenticated") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[--color-orange-soft] flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-[--color-orange-brand]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-2">
          Sign In to View Saved Estimates
        </h1>
        <p className="text-[--color-ink-dim] mb-6">
          Create a free account to save estimates and access them from any
          device.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          Sign In Free
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-[--color-ink]">
            Saved Estimates
          </h1>
          <p className="text-sm text-[--color-ink-dim] mt-1">
            {estimates.length} estimate{estimates.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBuilder((current) => !current)}
            className="flex items-center gap-2 text-sm font-medium border border-[--color-border] bg-[--color-surface] hover:border-[--color-orange-brand] text-[--color-ink] px-4 py-2 rounded-lg transition-all"
          >
            <PackagePlus className="w-4 h-4" aria-hidden />
            {showBuilder ? "Close Builder" : "Build from Price Book"}
          </button>
          <Link
            href="/calculators"
            className="flex items-center gap-2 text-sm font-medium bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white px-4 py-2 rounded-lg transition-all"
          >
            <Calculator className="w-4 h-4" aria-hidden />
            New from Calculator
          </Link>
        </div>
      </div>

      {showBuilder && (
        <section className="mb-6 rounded-2xl border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
          <h2 className="font-display text-lg uppercase tracking-wide text-[--color-ink]">
            Build Estimate from Price Book
          </h2>
          <p className="mt-1 text-sm text-[--color-ink-dim]">
            Build directly from your price book and optionally attach an
            existing calculator estimate in the same saved record.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
              Estimate Name
              <input
                value={builderName}
                onChange={(event) => setBuilderName(event.target.value)}
                className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
              Attach Calculator Estimate (Optional)
              <select
                value={attachedEstimateId}
                onChange={(event) => setAttachedEstimateId(event.target.value)}
                className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
              >
                <option value="">None</option>
                {estimates.map((estimate) => (
                  <option key={estimate.id} value={estimate.id}>
                    {estimate.name} ({estimate.calculator_id})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
              Client Name
              <input
                value={builderClientName}
                onChange={(event) => setBuilderClientName(event.target.value)}
                className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[--color-ink-mid]">
              Job Site Address
              <input
                value={builderJobSiteAddress}
                onChange={(event) =>
                  setBuilderJobSiteAddress(event.target.value)
                }
                className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-[--color-ink-mid] font-medium">
              Price Book Items
            </p>
            <button
              type="button"
              onClick={addBuilderRow}
              className="rounded-lg border border-[--color-border] px-3 py-1.5 text-sm text-[--color-ink] hover:border-[--color-orange-brand]"
            >
              + Add Line
            </button>
          </div>

          {materialsLoading && (
            <p className="mt-2 text-sm text-[--color-ink-dim]">
              Loading price book…
            </p>
          )}

          {materialsError && (
            <p className="mt-2 text-sm text-red-600">{materialsError}</p>
          )}

          <div className="mt-3 space-y-2">
            {builderRows.map((row, index) => (
              <div
                key={`${index}-${row.materialId}`}
                className="grid grid-cols-[1fr_auto_auto] gap-2"
              >
                <select
                  value={row.materialId}
                  onChange={(event) =>
                    updateBuilderRow(index, { materialId: event.target.value })
                  }
                  className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
                >
                  <option value="">Select material</option>
                  {materials.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.material_name} ·{" "}
                      {USD_CURRENCY.format(item.unit_cost)}/
                      {item.unit_type ?? "each"}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={row.quantity}
                  onChange={(event) =>
                    updateBuilderRow(index, {
                      quantity: Number(event.target.value) || 0,
                    })
                  }
                  className="w-28 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 py-2 text-sm text-[--color-ink]"
                />
                <button
                  type="button"
                  onClick={() => removeBuilderRow(index)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm text-[--color-ink-mid]">
            <p>
              Price Book Subtotal:{" "}
              <span className="font-semibold text-[--color-ink]">
                {USD_CURRENCY.format(priceBookSubtotal)}
              </span>
            </p>
            {attachedEstimate && (
              <p>
                Attached Calculator:{" "}
                <span className="font-semibold text-[--color-ink]">
                  {attachedEstimate.name}
                </span>
              </p>
            )}
            <p>
              Ownership:{" "}
              <span className="font-semibold text-[--color-ink]">
                {session?.user?.email ?? "Current signed-in user"}
              </span>
            </p>
          </div>

          {createError && (
            <p className="mt-3 text-sm text-red-600">{createError}</p>
          )}
          {createSuccess && (
            <p className="mt-3 text-sm text-green-700">{createSuccess}</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={createEstimateFromBuilder}
              disabled={creatingEstimate}
              className="rounded-lg bg-[--color-orange-brand] px-4 py-2 text-sm font-semibold text-white hover:bg-[--color-orange-dark] disabled:opacity-60"
            >
              {creatingEstimate ? "Saving…" : "Save Price Book Estimate"}
            </button>
          </div>
        </section>
      )}

      {downloadError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-4">
          {downloadError}
        </p>
      )}

      {fetchError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-4">
          {fetchError}
        </p>
      )}

      {updateError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-4">
          {updateError}
        </p>
      )}

      {updateSuccess && (
        <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">
          {updateSuccess}
        </p>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 bg-black/45"
            onClick={() => (deleting ? undefined : setDeleteTarget(null))}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[--color-border] bg-[--color-surface] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[--color-orange-brand]">
              Confirm Delete
            </p>
            <h2 className="mt-1 text-xl font-display font-bold text-[--color-ink]">
              Delete this estimate?
            </h2>
            <p className="mt-2 text-sm text-[--color-ink-dim]">
              This action removes the estimate and associated progress billing
              data from your saved records.
            </p>

            <div className="mt-4 rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-3 text-sm text-[--color-ink-mid] space-y-1">
              <p>
                <span className="font-semibold text-[--color-ink]">Name:</span>{" "}
                {deleteTarget.name}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Client:
                </span>{" "}
                {deleteTarget.client_name || "Not set"}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Status:
                </span>{" "}
                {formatStatus(getEstimateStatus(deleteTarget))}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">Total:</span>{" "}
                {deleteTarget.total_cost !== null
                  ? USD_CURRENCY.format(deleteTarget.total_cost)
                  : "Not set"}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Created:
                </span>{" "}
                {new Date(deleteTarget.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deleting)}
                className="rounded-lg border border-[--color-border] px-4 py-2 text-sm font-medium text-[--color-ink] hover:border-[--color-orange-brand] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEstimate}
                disabled={Boolean(deleting)}
                className="rounded-lg border border-red-500/25 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Estimate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {estimates.length > 0 && (
        <FinancialDashboard
          estimates={estimates}
          refreshing={refreshing}
          lastUpdatedAt={lastUpdatedAt}
          serverData={effectiveServerFinancialData}
        />
      )}

      {estimates.length === 0 ? (
        <div className="content-card py-16 text-center">
          <Bookmark className="w-12 h-12 text-[--color-ink-dim] mx-auto mb-4 opacity-40" />
          <p className="text-[--color-ink-dim] mb-4">No saved estimates yet.</p>
          <Link
            href="/calculators"
            className="text-[--color-orange-brand] font-medium hover:underline text-sm"
          >
            Run your first calculation →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => {
            const hero = est.results?.find((r) => r.highlight);
            return (
              <div key={est.id} className="content-card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[--color-ink] truncate">
                      {est.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-[--color-ink-dim]">
                        {new Date(est.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {hero && (
                        <span className="inline-flex items-center rounded-full border border-[--color-orange-brand]/35 bg-[--color-orange-brand]/10 px-2 py-0.5 text-xs font-bold text-[--color-orange-brand]">
                          {hero.value} {hero.unit}
                        </span>
                      )}
                      {est.total_cost !== null && (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          {USD_CURRENCY.format(est.total_cost)}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full border border-[--color-border] bg-[--color-surface-alt] px-2 py-0.5 text-xs text-[--color-ink-dim]">
                        {formatStatus(getEstimateStatus(est))}
                      </span>
                      {getProjectProfitMargin(est) !== null && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${
                            (getProjectProfitMargin(est) ?? 0) < 0
                              ? "border-red-500/35 bg-red-500/10 text-red-500"
                              : (getProjectProfitMargin(est) ?? 0) > 0
                                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700"
                                : "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-dim]"
                          }`}
                        >
                          Margin {getProjectProfitMargin(est)?.toFixed(1)}%
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full border border-[--color-border] bg-[--color-surface-alt] px-2 py-0.5 text-xs text-[--color-ink-dim]">
                        Owner: {getEstimateOwnerLabel(est)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/saved/${est.id}` as import("next").Route}
                      className="flex items-center gap-1.5 rounded-lg border border-[--color-border] px-2.5 py-1.5 text-xs font-medium text-[--color-ink] transition-all hover:border-[--color-orange-brand]"
                      title="Open estimate"
                    >
                      <FolderOpen className="w-3.5 h-3.5" aria-hidden />
                      Open
                    </Link>
                    <button
                      onClick={() => {
                        if (typeof window === "undefined") return;
                        window.open(
                          `/saved/estimates/${est.id}`,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-[--color-border] px-2.5 py-1.5 text-xs font-medium text-[--color-ink] transition-all hover:border-[--color-orange-brand]"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                      Window
                    </button>
                    <button
                      onClick={() => downloadPDF(est)}
                      className="flex items-center gap-1.5 rounded-lg border border-[--color-orange-brand]/30 px-2.5 py-1.5 text-xs font-medium text-[--color-orange-brand] transition-all hover:border-[--color-orange-brand] hover:bg-[--color-orange-soft]"
                      title="Download PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" aria-hidden />
                      PDF
                    </button>
                    <button
                      onClick={() => requestDeleteEstimate(est)}
                      disabled={deleting === est.id}
                      className="flex items-center p-1.5 text-[--color-ink-dim] transition-colors hover:text-red-500"
                      title="Delete estimate"
                      aria-label="Delete estimate"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

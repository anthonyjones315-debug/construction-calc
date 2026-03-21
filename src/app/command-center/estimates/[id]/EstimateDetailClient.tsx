"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { routes } from "@routes";

interface EstimateDetailProps {
  canDelete?: boolean;
  estimate: {
    id: string;
    name: string;
    clientName: string | null;
    jobSiteAddress: string | null;
    status: string | null;
    results: Array<{ label: string; value: string | number; unit?: string }>;
    totalCost: number | null;
    shareCode: string | null;
    calculatorLabel: string;
    jobName: string;
    materialList: string[];
    lineItems: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;
    createdAt: string;
    updatedAt: string;
    contractorSignatureDataUrl: string | null;
    contractorSignedAt: string | null;
    clientSignatureDataUrl: string | null;
    clientSignedAt: string | null;
    clientSignerName: string | null;
    signUrl: string | null;
  };
}

function formatStatus(status: string | null) {
  if (status === "SIGNED" || status === "Approved") return "Signed";
  if (status === "PENDING" || status === "Sent") return "Sent";
  return "Draft";
}

function statusClass(status: string | null) {
  if (status === "SIGNED" || status === "Approved")
    return "border-emerald-500/35 bg-emerald-50 text-emerald-700";
  if (status === "PENDING" || status === "Sent")
    return "border-blue-300 bg-blue-50 text-blue-700";
  return "border-slate-300 bg-slate-100 text-slate-700";
}

function formatDollars(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function EstimateDetailClient({
  estimate,
  canDelete = false,
}: EstimateDetailProps) {
  const router = useRouter();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isSigned =
    estimate.status === "SIGNED" || estimate.status === "Approved";
  const hasBothSigs =
    Boolean(estimate.contractorSignatureDataUrl) &&
    Boolean(estimate.clientSignatureDataUrl);

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      const lineItemResults =
        estimate.lineItems.length > 0
          ? estimate.lineItems.map((item) => ({
              label: item.description || "Item",
              value: Math.round(item.quantity * item.unitPrice * 100) / 100,
              unit: item.unit || "ea",
            }))
          : estimate.results;

      const material_list =
        estimate.lineItems.length > 0
          ? estimate.lineItems.map(
              (item) =>
                `${item.description} — ${item.quantity} ${item.unit} × $${item.unitPrice.toFixed(2)} = $${(Math.round(item.quantity * item.unitPrice * 100) / 100).toFixed(2)}`,
            )
          : estimate.materialList;

      const payload = {
        name: estimate.name,
        calculator_id: "manual/estimate-builder",
        client_name: estimate.clientName,
        job_site_address: estimate.jobSiteAddress,
        total_cost: estimate.totalCost,
        results: lineItemResults,
        material_list: material_list.length > 0 ? material_list : ["Estimate"],
        inputs: {},
        metadata: {
          title: estimate.name,
          calculatorLabel: estimate.calculatorLabel,
          generatedAt: estimate.createdAt,
          jobName: estimate.jobName,
        },
      };

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        alert(json.error ?? "Failed to generate PDF.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = estimate.name
        .replace(/[^a-zA-Z0-9\-_ ]/g, "")
        .trim()
        .slice(0, 80);
      a.href = url;
      a.download = `${safeName || "estimate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Delete this estimate permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/estimates/${estimate.id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(
          json.error ?? "Delete failed. You may not have permission.",
        );
        return;
      }
      router.push(routes.commandCenter);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
              Estimate
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              {estimate.name}
            </h1>
            {estimate.clientName && (
              <p className="mt-1 text-sm text-slate-600">
                Client: {estimate.clientName}
              </p>
            )}
            {estimate.jobSiteAddress && (
              <p className="text-xs text-slate-500">
                {estimate.jobSiteAddress}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Created{" "}
              {new Date(estimate.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${statusClass(estimate.status)}`}
            >
              {formatStatus(estimate.status)}
            </span>
            {isSigned && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          </div>
        </div>

        {/* Total */}
        {estimate.totalCost != null && (
          <div className="mt-4 rounded-xl border border-[--color-orange-soft] bg-[--color-orange-soft] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-orange-dark]">
              Total
            </p>
            <p className="mt-0.5 text-2xl font-black text-[--color-orange-dark]">
              {formatDollars(estimate.totalCost)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-brand px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[--color-orange-dark] disabled:opacity-60"
          >
            {downloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloadingPdf ? "Generating…" : "Download PDF"}
          </button>

          {estimate.signUrl && !isSigned && (
            <>
              <a
                href={estimate.signUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark]"
              >
                <ExternalLink className="h-4 w-4" />
                Open Signing Link
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(estimate.signUrl!);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark]"
              >
                {copiedLink ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </>
          )}

          {canDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              {deleting ? "Deleting…" : "Delete estimate"}
            </button>
          ) : null}
        </div>
        {deleteError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {deleteError}
          </p>
        ) : null}
      </article>

      {/* Line Items */}
      {estimate.lineItems.length > 0 && (
        <article className="rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="px-4 pt-4 sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
              Line Items
            </p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  <th className="py-2 pl-5 pr-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Qty
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Unit
                  </th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Unit Price
                  </th>
                  <th className="py-2 pl-2 pr-5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {estimate.lineItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 pl-5 pr-2 text-slate-900">
                      {item.description}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-2 text-slate-500">{item.unit}</td>
                    <td className="px-2 py-2 text-right text-slate-700">
                      {formatDollars(item.unitPrice)}
                    </td>
                    <td className="py-2 pl-2 pr-5 text-right font-semibold text-slate-900">
                      {formatDollars(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* Signatures */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
          Signatures
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Contractor signature */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Contractor
            </p>
            {estimate.contractorSignatureDataUrl ? (
              <div className="space-y-1">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={estimate.contractorSignatureDataUrl}
                    alt="Contractor signature"
                    className="h-20 w-full object-contain"
                  />
                </div>
                {estimate.contractorSignedAt && (
                  <p className="text-[10px] text-slate-500">
                    Signed{" "}
                    {new Date(estimate.contractorSignedAt).toLocaleString(
                      "en-US",
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
                <p className="text-xs text-slate-500">Not signed yet</p>
              </div>
            )}
          </div>

          {/* Client signature */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Client
              {estimate.clientSignerName
                ? ` — ${estimate.clientSignerName}`
                : ""}
            </p>
            {estimate.clientSignatureDataUrl ? (
              <div className="space-y-1">
                <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white p-2">
                  <img
                    src={estimate.clientSignatureDataUrl}
                    alt="Client signature"
                    className="h-20 w-full object-contain"
                  />
                </div>
                {estimate.clientSignedAt && (
                  <p className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Signed{" "}
                    {new Date(estimate.clientSignedAt).toLocaleString("en-US")}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
                <p className="text-xs text-slate-500">
                  Awaiting client signature
                </p>
                {estimate.signUrl && (
                  <a
                    href={estimate.signUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-orange-brand hover:text-[--color-orange-dark]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open signing link
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {hasBothSigs && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">
              Fully executed — both parties have signed.
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

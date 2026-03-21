"use client";

import { useReducer, useMemo, useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import type { EstimateCartItem, MarketPrices } from "@/types";
import type {
  EstimateFormState,
  EstimateFormAction,
  EstimateLineItem,
  EstimateTotals,
} from "./new-estimate-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function generateControlNumber(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(2, 12);
  const suffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `PC-${stamp}-${suffix}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Default State ────────────────────────────────────────────────────────────

export function getDefaultFormState(): EstimateFormState {
  return {
    estimateName: "",
    clientName: "",
    clientEmail: "",
    projectName: "",
    jobSiteAddress: "",
    estimateDate: todayIso(),
    controlNumber: generateControlNumber(),
    lineItems: [],
    taxRatePercent: 0,
    taxCounty: "",
    estimateNotes: "",
    terms: "",
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function estimateFormReducer(
  state: EstimateFormState,
  action: EstimateFormAction,
): EstimateFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "ADD_LINE_ITEMS":
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          ...action.items.map((item) => ({ ...item, id: generateId() })),
        ],
      };

    case "UPDATE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item,
        ),
      };

    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      };

    case "REORDER_LINE_ITEMS": {
      const items = [...state.lineItems];
      const [moved] = items.splice(action.fromIndex, 1);
      if (moved) items.splice(action.toIndex, 0, moved);
      return { ...state, lineItems: items };
    }

    case "SET_TAX":
      return {
        ...state,
        taxCounty: action.county,
        taxRatePercent: action.ratePercent,
      };

    case "RESET":
      return getDefaultFormState();

    default:
      return state;
  }
}

// ─── Serialization Helpers ────────────────────────────────────────────────────

function serializeForSave(state: EstimateFormState, totals: EstimateTotals) {
  return {
    name: state.estimateName || "Untitled Estimate",
    calculator_id: "manual/estimate-builder",
    client_name: state.clientName || null,
    job_site_address: state.jobSiteAddress || null,
    total_cost: totals.totalCents / 100,
    status: "Draft" as const,
    results: state.lineItems.map((item) => ({
      label: item.description || "Item",
      value: Math.round(item.quantity * item.unitPrice * 100) / 100,
      unit: item.unit || "ea",
    })),
    inputs: {
      control_number: state.controlNumber,
      client_email: state.clientEmail || null,
      project_name: state.projectName || null,
      estimate_date: state.estimateDate,
      estimate_notes: state.estimateNotes || null,
      terms: state.terms || null,
      tax_county: state.taxCounty || null,
      custom_basis_points: Math.round(state.taxRatePercent * 100),
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      line_items: state.lineItems,
    },
    budget_items: state.lineItems.map((item) => ({
      id: item.id,
      name: item.description,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.unitPrice,
    })),
  };
}

function serializeForFinalize(
  state: EstimateFormState,
  totals: EstimateTotals,
) {
  return {
    name: state.estimateName || "Untitled Estimate",
    calculator_id: "manual/estimate-builder",
    client_name: state.clientName || null,
    job_site_address: state.jobSiteAddress || null,
    total_cost: totals.totalCents / 100,
    results: state.lineItems.map((item) => ({
      label: item.description || "Item",
      value: Math.round(item.quantity * item.unitPrice * 100) / 100,
      unit: item.unit || "ea",
    })),
    material_list: state.lineItems.map((item) => {
      const lineTotal = (Math.round(item.quantity * item.unitPrice * 100) / 100).toFixed(2);
      return `${item.description} — ${item.quantity} ${item.unit} × $${item.unitPrice.toFixed(2)} = $${lineTotal}`;
    }),
    inputs: {
      control_number: state.controlNumber,
      client_email: state.clientEmail || null,
      project_name: state.projectName || null,
      selected_county: state.taxCounty || null,
      custom_basis_points: Math.round(state.taxRatePercent * 100),
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      line_items: state.lineItems,
    },
    metadata: {
      title: state.estimateName || "Estimate",
      calculatorLabel: "Estimate Builder",
      generatedAt: new Date().toISOString(),
      jobName: state.projectName || state.estimateName || null,
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseEstimateFormReturn {
  state: EstimateFormState;
  dispatch: React.Dispatch<EstimateFormAction>;
  totals: EstimateTotals;
  isDirty: boolean;
  saving: boolean;
  finalizing: boolean;
  generatingPdf: boolean;
  savedId: string | null;
  error: string | null;
  successMessage: string | null;
  setError: (msg: string | null) => void;
  saveDraft: () => Promise<{ id: string } | null>;
  finalize: (contractorSignatureDataUrl?: string) => Promise<{
    id: string;
    shareCode: string;
    signUrl: string | null;
  } | null>;
  generatePdf: () => Promise<void>;
  estimateCart: EstimateCartItem[];
  marketPrices: MarketPrices;
}

export function useEstimateForm(
  initialState?: Partial<EstimateFormState>,
): UseEstimateFormReturn {
  const estimateCart = useStore((s) => s.estimateCart);
  const marketPrices = useStore((s) => s.marketPrices);

  const [state, dispatch] = useReducer(estimateFormReducer, undefined, () => ({
    ...getDefaultFormState(),
    ...initialState,
  }));

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totals = useMemo<EstimateTotals>(() => {
    const subtotalCents = state.lineItems.reduce(
      (sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100),
      0,
    );
    const taxCents = Math.round(subtotalCents * (state.taxRatePercent / 100));
    return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
  }, [state.lineItems, state.taxRatePercent]);

  const isDirty = useMemo(
    () =>
      state.lineItems.length > 0 ||
      state.estimateName.trim().length > 0 ||
      state.clientName.trim().length > 0,
    [state.lineItems.length, state.estimateName, state.clientName],
  );

  function flashSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  }

  const saveDraft = useCallback(async (): Promise<{ id: string } | null> => {
    setSaving(true);
    setError(null);
    try {
      // If we already saved this estimate, update instead of creating a duplicate
      if (savedId) {
        const payload = serializeForSave(state, totals);
        const res = await fetch(`/api/estimates/${savedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            total_cost: payload.total_cost,
            client_name: payload.client_name,
            job_site_address: payload.job_site_address,
            status: payload.status,
            budget_items: payload.budget_items,
            inputs: payload.inputs,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Failed to update draft.");
          return null;
        }
        flashSuccess("Draft updated.");
        return { id: savedId };
      }

      const payload = serializeForSave(state, totals);
      const res = await fetch("/api/estimates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to save draft.");
        return null;
      }
      setSavedId(json.id ?? null);
      flashSuccess("Draft saved successfully.");
      return { id: json.id! };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [state, totals, savedId]);

  const finalize = useCallback(
    async (
      contractorSignatureDataUrl?: string,
    ): Promise<{
      id: string;
      shareCode: string;
      signUrl: string | null;
    } | null> => {
      if (state.lineItems.length === 0) {
        setError("Add at least one line item before finalizing.");
        return null;
      }
      setFinalizing(true);
      setError(null);
      try {
        const base = serializeForFinalize(state, totals);
        const payload = contractorSignatureDataUrl
          ? {
              ...base,
              signature: {
                signatureDataUrl: contractorSignatureDataUrl,
                signedAt: new Date().toISOString(),
              },
            }
          : base;
        const res = await fetch("/api/estimates/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            ...(savedId ? { saved_estimate_id: savedId } : {}),
          }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          id?: string;
          shareCode?: string;
          signUrl?: string | null;
          error?: string;
        };
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Failed to finalize estimate.");
          return null;
        }
        setSavedId(json.id ?? null);
        flashSuccess("Estimate finalized and email sent.");
        return {
          id: json.id!,
          shareCode: json.shareCode ?? "",
          signUrl: json.signUrl ?? null,
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.");
        return null;
      } finally {
        setFinalizing(false);
      }
    },
    [state, totals, savedId],
  );

  const generatePdf = useCallback(async (): Promise<void> => {
    if (state.lineItems.length === 0) {
      setError("Add at least one line item before generating a PDF.");
      return;
    }
    setGeneratingPdf(true);
    setError(null);
    try {
      const payload = serializeForFinalize(state, totals);
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "Failed to generate PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (state.estimateName || "estimate")
        .replace(/[^a-zA-Z0-9\-_ ]/g, "")
        .trim()
        .slice(0, 80);
      a.href = url;
      a.download = `${safeName || "estimate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flashSuccess("PDF downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setGeneratingPdf(false);
    }
  }, [state, totals]);

  return {
    state,
    dispatch,
    totals,
    isDirty,
    saving,
    finalizing,
    generatingPdf,
    savedId,
    error,
    successMessage,
    setError,
    saveDraft,
    finalize,
    generatePdf,
    estimateCart,
    marketPrices,
  };
}

// Re-export types for convenience
export type {
  EstimateLineItem,
  EstimateFormState,
  EstimateTotals,
  EstimateFormAction,
};

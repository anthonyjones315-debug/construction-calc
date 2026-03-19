import type { CalculatorId } from "@/types";

// ─── Line Item ────────────────────────────────────────────────────────────────

export type LineItemSource = "calculator" | "pricebook" | "manual";

/**
 * A single line item on the estimate form.
 * Universal shape regardless of which input method created it.
 */
export interface EstimateLineItem {
  /** Client-generated UUID for React key + reordering */
  id: string;
  /** Human-readable description — e.g. "2x4x8 Studs" */
  description: string;
  /** Numeric quantity — e.g. 45 */
  quantity: number;
  /** Unit label — e.g. "ea", "sq ft", "cu yd" */
  unit: string;
  /** Price per single unit in dollars — e.g. 6.00 */
  unitPrice: number;
  /** Optional freeform notes for this line */
  notes: string;
  /** Where this line item originated */
  source: LineItemSource;
  /** If sourced from price book, the user_materials row ID */
  materialId?: string;
  /** If sourced from a calculator, which calculator produced it */
  calculatorId?: CalculatorId;
  /** Category tag for grouping — e.g. "Concrete", "Framing" */
  category?: string;
}

// ─── Form State ───────────────────────────────────────────────────────────────

/**
 * Full estimate form state — everything needed to render the page
 * and serialize to any API endpoint.
 */
export interface EstimateFormState {
  /** Estimate metadata */
  estimateName: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  jobSiteAddress: string;
  /** ISO date string, e.g. "2026-03-19" */
  estimateDate: string;
  /** Auto-generated control number — PC-YYMMDDHHNN-XXXXXX */
  controlNumber: string;

  /** Line items */
  lineItems: EstimateLineItem[];

  /** Tax — rate as a percentage, e.g. 8.75 for 8.75% */
  taxRatePercent: number;
  taxCounty: string;

  /** Freeform notes for entire estimate */
  estimateNotes: string;

  /** Terms / conditions text */
  terms: string;
}

// ─── Computed Totals ──────────────────────────────────────────────────────────

/**
 * Derived totals — computed from form state, never stored directly.
 * All values are in cents for precision.
 */
export interface EstimateTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

// ─── Reducer Actions ──────────────────────────────────────────────────────────

export type EstimateFormAction =
  | {
      type: "SET_FIELD";
      field: keyof EstimateFormState;
      value: string | number;
    }
  | { type: "ADD_LINE_ITEMS"; items: Omit<EstimateLineItem, "id">[] }
  | { type: "UPDATE_LINE_ITEM"; id: string; patch: Partial<EstimateLineItem> }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "REORDER_LINE_ITEMS"; fromIndex: number; toIndex: number }
  | { type: "SET_TAX"; county: string; ratePercent: number }
  | { type: "RESET" };

// ─── Price Book ───────────────────────────────────────────────────────────────

/**
 * A price book material row as returned from GET /api/materials.
 */
export interface PriceBookMaterial {
  id: string;
  material_name: string;
  category: string;
  unit_type: string;
  unit_cost: number;
}

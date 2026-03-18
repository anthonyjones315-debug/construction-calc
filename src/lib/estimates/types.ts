/**
 * Type definitions for estimate payloads and results
 */

/**
 * Discriminant for the two document types in the system.
 *
 * - `calculator_report` — calculator output, informational, can be downloaded /
 *   emailed / saved to Command Center, cannot be sent for signature.
 * - `estimate` — formal estimate created from a report or in Command Center,
 *   supports line items, taxes, markup, customer data, status, and signature flow.
 */
export type DocumentType = "calculator_report" | "estimate";

export type EstimateResult = {
  label: string;
  value: string | number;
  unit?: string;
};

export type EstimateMetadata = {
  jobName?: string | null | undefined;
  calculatorLabel: string;
  generatedAt: string;
  title: string;
};

export type EstimateSignature = {
  signerName?: string | null;
  signerEmail?: string | null;
  signatureDataUrl?: string | null;
  signedAt?: string | null;
};

export type EstimatePayload = {
  name: string;
  calculator_id: string;
  metadata: EstimateMetadata;
  client_name?: string | null;
  job_site_address?: string | null;
  material_list?: string[];
  results: EstimateResult[];
  total_cost?: number | null | undefined;
  inputs?: Record<string, unknown>;
  signature?: EstimateSignature;
  /** Customer-facing note rendered on the estimate PDF. */
  quote_note?: string | null;
  /** Internal-only note never rendered on PDFs or client-facing views. */
  internal_note?: string | null;
  /**
   * Discriminant: `calculator_report` for calculator output (no signature flow);
   * `estimate` for formal estimates with line items and status.
   * Defaults to `calculator_report` when absent for backwards compatibility.
   */
  type?: DocumentType;
};

/**
 * Type definitions for estimate payloads and results
 */

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
};

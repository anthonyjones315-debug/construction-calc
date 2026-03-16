import { z } from "zod";

const SHARE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SHARE_CODE_LENGTH = 6;
const DEFAULT_SITE_URL = "https://proconstructioncalc.com";

export const estimateResultSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.union([z.string(), z.number()]),
  unit: z.string().trim().max(40).default(""),
});

export const finalizeEstimateSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    calculator_id: z.string().trim().min(1).max(100),
    client_name: z.string().trim().max(200).nullable().optional(),
    job_site_address: z.string().trim().max(500).nullable().optional(),
    total_cost: z.number().finite().nullable().optional(),
    results: z.array(estimateResultSchema).min(1).max(25),
    material_list: z.array(z.string().trim().min(1).max(200)).min(1).max(50),
    inputs: z.record(z.string(), z.unknown()).optional(),
    metadata: z
      .object({
        title: z.string().trim().min(1).max(200),
        calculatorLabel: z.string().trim().min(1).max(200),
        generatedAt: z.string().trim().min(1).max(100),
        jobName: z.string().trim().max(200).nullable().optional(),
      })
      .strict(),
    signature: z
      .object({
        signerName: z.string().trim().max(120).nullable().optional(),
        signerEmail: z.string().trim().max(200).nullable().optional(),
        signatureDataUrl: z.string().trim().nullable().optional(),
        signedAt: z.string().trim().max(100).nullable().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type FinalizeEstimateInput = z.infer<typeof finalizeEstimateSchema>;
export type EstimateResultInput = z.infer<typeof estimateResultSchema>;

export type SigningMeta = {
  shareCode: string;
  signUrl: string;
  status: "pending" | "signed";
  sentAt: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  signatureDataUrl?: string;
};

function getRandomInt(max: number) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0]! % max;
  }

  return Math.floor(Math.random() * max);
}

export function generateEstimateShareCode(length = SHARE_CODE_LENGTH): string {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += SHARE_CODE_CHARS[getRandomInt(SHARE_CODE_CHARS.length)];
  }

  return code;
}

export function getPublicSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    DEFAULT_SITE_URL;

  return configured.replace(/\/+$/, "");
}

export function buildSignUrl(shareCode: string) {
  return `${getPublicSiteUrl()}/sign/${shareCode}`;
}

export function normalizeShareCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function buildSigningMeta(
  shareCode: string,
  sentAt: string = new Date().toISOString(),
): SigningMeta {
  return {
    shareCode,
    signUrl: buildSignUrl(shareCode),
    status: "pending",
    sentAt,
  };
}

export function withFinalizeInputs(
  existingInputs: Record<string, unknown> | undefined,
  finalized: FinalizeEstimateInput,
  signing: SigningMeta,
  owner: {
    user_id: string;
    user_email: string | null;
    user_name: string | null;
  },
) {
  return {
    ...(existingInputs ?? {}),
    owner,
    finalize: {
      title: finalized.metadata.title,
      calculatorLabel: finalized.metadata.calculatorLabel,
      generatedAt: finalized.metadata.generatedAt,
      jobName: finalized.metadata.jobName ?? finalized.name,
      materialList: finalized.material_list,
    },
    signing,
  };
}

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  getBusinessContextForSession,
  getTenantScopeColumn,
  getTenantScopeId,
} from "@/lib/supabase/business";
import { routes } from "@/app/routes";
import { EstimateDetailClient } from "./EstimateDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstimateDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(routes.auth.signIn);
  }

  const { id } = await params;

  const db = createServerClient();
  const businessContext = await getBusinessContextForSession(db, session);
  const tenantColumn = getTenantScopeColumn(businessContext);
  const tenantId = getTenantScopeId(businessContext);

  const { data, error } = await db
    .from("saved_estimates")
    .select(
      "id, name, client_name, job_site_address, status, results, inputs, total_cost, share_code, created_at, updated_at, calculator_id",
    )
    .eq("id", id)
    .eq(tenantColumn, tenantId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const inputs = (data.inputs ?? {}) as Record<string, unknown>;
  const signing = (inputs.signing ?? {}) as Record<string, unknown>;
  const finalize = (inputs.finalize ?? {}) as Record<string, unknown>;

  const estimate = {
    id: data.id as string,
    name: data.name as string,
    clientName: data.client_name as string | null,
    jobSiteAddress: data.job_site_address as string | null,
    status: data.status as string | null,
    results: Array.isArray(data.results)
      ? (data.results as Array<{
          label: string;
          value: string | number;
          unit?: string;
        }>)
      : [],
    totalCost: data.total_cost as number | null,
    shareCode: data.share_code as string | null,
    calculatorLabel:
      typeof finalize.calculatorLabel === "string"
        ? finalize.calculatorLabel
        : (data.calculator_id as string),
    jobName:
      typeof finalize.jobName === "string"
        ? finalize.jobName
        : (data.name as string),
    materialList: Array.isArray(finalize.materialList)
      ? (finalize.materialList as string[])
      : [],
    lineItems: Array.isArray(inputs.line_items)
      ? (inputs.line_items as Array<{
          id: string;
          description: string;
          quantity: number;
          unit: string;
          unitPrice: number;
        }>)
      : [],
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    contractorSignatureDataUrl:
      typeof signing.contractorSignatureDataUrl === "string"
        ? signing.contractorSignatureDataUrl
        : null,
    contractorSignedAt:
      typeof signing.contractorSignedAt === "string"
        ? signing.contractorSignedAt
        : null,
    clientSignatureDataUrl:
      typeof signing.signatureDataUrl === "string"
        ? signing.signatureDataUrl
        : null,
    clientSignedAt:
      typeof signing.signedAt === "string" ? signing.signedAt : null,
    clientSignerName:
      typeof signing.signerName === "string" ? signing.signerName : null,
    signUrl: typeof signing.signUrl === "string" ? signing.signUrl : null,
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
      <Link
        href={routes.commandCenter}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[--color-orange-dark]"
      >
        ← Command Center
      </Link>
      <EstimateDetailClient
        estimate={estimate}
        canDelete={businessContext.canDeleteBusinessData}
      />
    </div>
  );
}

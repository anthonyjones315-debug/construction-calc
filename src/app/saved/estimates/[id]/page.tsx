import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSafeEstimate } from "@/lib/dal/estimates";

type InvoiceStatus = "Draft" | "Sent" | "Partially Paid" | "Paid";

type EstimateInputsShape = {
  control_number?: string;
  controlNumber?: string;
  internal_control_number?: string;
  internalControlNumber?: string;
  billing?: {
    invoices?: Array<{
      id?: string;
      invoiceNumber?: string;
      amount?: number;
      issuedDate?: string;
      dueDate?: string;
      status?: InvoiceStatus;
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

type Props = {
  params: Promise<{ id: string }>;
};

const USD_CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function parseInvoices(
  inputs: Record<string, unknown> | null | undefined,
  estimateId: string,
) {
  const rawInputs = inputs as EstimateInputsShape | null;
  const controlNumber =
    normalizeControlNumber(rawInputs?.control_number) ||
    normalizeControlNumber(rawInputs?.controlNumber) ||
    normalizeControlNumber(rawInputs?.internal_control_number) ||
    normalizeControlNumber(rawInputs?.internalControlNumber) ||
    fallbackEstimateControlNumber(estimateId);
  const rawInvoices = rawInputs?.billing?.invoices;
  if (!Array.isArray(rawInvoices)) return [];

  return rawInvoices.map((invoice, index) => {
    const amount = Number(invoice.amount ?? 0);
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    return {
      id: invoice.id || `inv-${index + 1}`,
      invoiceNumber:
        invoice.invoiceNumber ||
        `${controlNumber}-INV-${String(index + 1).padStart(3, "0")}`,
      amount: safeAmount,
      issuedDate: invoice.issuedDate || "",
      dueDate: invoice.dueDate || "",
      status:
        invoice.status === "Draft" ||
        invoice.status === "Sent" ||
        invoice.status === "Partially Paid" ||
        invoice.status === "Paid"
          ? invoice.status
          : "Draft",
    };
  });
}

export default async function SavedEstimateDetailPage({ params }: Props) {
  const { id } = await params;
  const estimate = await getSafeEstimate(id);

  if (!estimate) {
    notFound();
  }

  const rawInputs = estimate.inputs as EstimateInputsShape | null;
  const controlNumber =
    normalizeControlNumber(rawInputs?.control_number) ||
    normalizeControlNumber(rawInputs?.controlNumber) ||
    normalizeControlNumber(rawInputs?.internal_control_number) ||
    normalizeControlNumber(rawInputs?.internalControlNumber) ||
    fallbackEstimateControlNumber(estimate.id);

  const invoices = parseInvoices(estimate.inputs, estimate.id);

  return (
    <div className="flex min-h-screen flex-col bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[--color-ink-dim]">
                Estimate Detail
              </p>
              <h1 className="mt-1 text-2xl font-display font-bold text-[--color-ink]">
                {estimate.name}
              </h1>
              <p className="mt-1 text-sm text-[--color-ink-dim]">
                Client: {estimate.clientName || "Not set"} · Status:{" "}
                {estimate.status}
              </p>
              <p className="mt-1 text-xs text-[--color-ink-dim]">
                Control Number: {controlNumber}
              </p>
            </div>
            <Link
              href="/saved"
              className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm font-medium text-[--color-ink] hover:border-[--color-orange-brand]"
            >
              Back to Saved
            </Link>
          </div>

          <section className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[--color-ink-dim]">
              Project Summary
            </h2>
            <div className="mt-3 grid gap-3 text-sm text-[--color-ink-mid] sm:grid-cols-2">
              <p>
                <span className="font-semibold text-[--color-ink]">Total:</span>{" "}
                {estimate.totalCost !== null
                  ? USD_CURRENCY.format(estimate.totalCost)
                  : "Not set"}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Job Site:
                </span>{" "}
                {estimate.jobSiteAddress || "Not set"}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Created:
                </span>{" "}
                {new Date(estimate.createdAt).toLocaleDateString("en-US")}
              </p>
              <p>
                <span className="font-semibold text-[--color-ink]">
                  Updated:
                </span>{" "}
                {new Date(estimate.updatedAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-[--color-border] bg-[--color-surface] p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[--color-ink-dim]">
              Invoices
            </h2>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-[--color-ink-dim]">
                No invoices have been added for this estimate yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[--color-border] text-left text-[--color-ink-dim]">
                      <th className="px-2 py-2 font-semibold">Invoice</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 font-semibold">Amount</th>
                      <th className="px-2 py-2 font-semibold">Issued</th>
                      <th className="px-2 py-2 font-semibold">Due</th>
                      <th className="px-2 py-2 font-semibold">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="trim-border-strong border-b text-[--color-ink]"
                      >
                        <td className="px-2 py-2 font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-2 py-2">{invoice.status}</td>
                        <td className="px-2 py-2">
                          {USD_CURRENCY.format(invoice.amount)}
                        </td>
                        <td className="px-2 py-2">
                          {invoice.issuedDate || "—"}
                        </td>
                        <td className="px-2 py-2">{invoice.dueDate || "—"}</td>
                        <td className="px-2 py-2">
                          <a
                            href={`/saved/estimates/${estimate.id}/invoices/${invoice.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[--color-orange-brand] hover:text-[--color-orange-dark]"
                          >
                            Open Window
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

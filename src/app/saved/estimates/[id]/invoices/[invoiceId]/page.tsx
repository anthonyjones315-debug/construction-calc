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

type Props = {
  params: Promise<{ id: string; invoiceId: string }>;
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
      paymentMethod: invoice.paymentMethod || "",
      paymentInstructions: invoice.paymentInstructions || "",
      notes: invoice.notes || "",
    };
  });
}

export default async function SavedInvoiceDetailPage({ params }: Props) {
  const { id, invoiceId } = await params;
  const estimate = await getSafeEstimate(id);

  if (!estimate) notFound();

  const invoices = parseInvoices(estimate.inputs, estimate.id);
  const invoice = invoices.find((row) => row.id === invoiceId);

  if (!invoice) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-[--color-bg]">
      <Header />
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[--color-ink-dim]">
                Invoice Detail
              </p>
              <h1 className="mt-1 text-2xl font-display font-bold text-[--color-ink]">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-sm text-[--color-ink-dim]">
                Estimate: {estimate.name}
              </p>
            </div>
            <a
              href={`/saved/estimates/${estimate.id}`}
              className="rounded-lg border border-[--color-border] bg-[--color-surface] px-3 py-2 text-sm font-medium text-[--color-ink] hover:border-[--color-orange-brand]"
            >
              Back to Estimate
            </a>
          </div>

          <section className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-5 text-sm text-[--color-ink-mid] space-y-2">
            <p>
              <span className="font-semibold text-[--color-ink]">Status:</span>{" "}
              {invoice.status}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">Amount:</span>{" "}
              {USD_CURRENCY.format(invoice.amount)}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">
                Issued Date:
              </span>{" "}
              {invoice.issuedDate || "Not set"}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">
                Due Date:
              </span>{" "}
              {invoice.dueDate || "Not set"}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">
                Payment Method:
              </span>{" "}
              {invoice.paymentMethod || "Not set"}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">
                Payment Instructions:
              </span>{" "}
              {invoice.paymentInstructions || "Not set"}
            </p>
            <p>
              <span className="font-semibold text-[--color-ink]">Notes:</span>{" "}
              {invoice.notes || "None"}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

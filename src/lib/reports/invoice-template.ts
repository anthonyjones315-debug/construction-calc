/**
 * Professional estimate PDF template
 * Clean, white-background design inspired by Jobber / HousecallPro
 * Optimized for Browserless.io PDF rendering
 */

import type { EstimatePayload, EstimateResult } from "@/lib/estimates/types";
import { escapeHtml } from "@/utils/html";

type InvoiceTemplateInput = {
  payload: EstimatePayload;
  contractorName: string;
  contractorContact: string | null;
  contractorLogoUrl: string | null;
};

/** Safely format a number to 2 decimal places, avoiding floating point display errors */
function safeNumber(value: string | number): string {
  if (typeof value === "number") {
    return (Math.round(value * 100) / 100).toFixed(2);
  }
  const parsed = parseFloat(value);
  if (!isNaN(parsed)) {
    return (Math.round(parsed * 100) / 100).toFixed(2);
  }
  return value;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(value * 100) / 100);
}

export function generateInvoiceHtml(input: InvoiceTemplateInput): string {
  const { payload, contractorName, contractorContact, contractorLogoUrl } =
    input;

  const safeContractorName = escapeHtml(contractorName || "Your Contractor");
  const contactLine = escapeHtml(contractorContact?.trim() || "");
  const jobName = escapeHtml(
    typeof payload.metadata.jobName === "string" && payload.metadata.jobName
      ? payload.metadata.jobName
      : payload.name,
  );
  const calculatorLabel = escapeHtml(payload.metadata.calculatorLabel);
  const generatedAt = new Date(payload.metadata.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const clientName = escapeHtml(payload.client_name ?? "");
  const jobAddress = escapeHtml(payload.job_site_address ?? "");
  const materialList =
    Array.isArray(payload.material_list) && payload.material_list.length
      ? payload.material_list
      : [];
  const quoteNote =
    typeof payload.quote_note === "string" && payload.quote_note.trim()
      ? escapeHtml(payload.quote_note.trim())
      : null;

  const dollars =
    typeof payload.total_cost === "number"
      ? formatCurrency(payload.total_cost)
      : null;

  // Build line items from budget_items (stored in inputs.line_items) if available
  const inputs = payload.inputs as Record<string, unknown> | undefined;
  const rawLineItems = inputs?.line_items;
  const budgetItems: Record<string, unknown>[] = Array.isArray(rawLineItems) ? rawLineItems : [];
  const hasBudgetItems = budgetItems.length > 0;

  const lineItemRows = hasBudgetItems
    ? budgetItems
        .map((item: Record<string, unknown>) => {
          const desc = escapeHtml(String(item.name ?? item.description ?? "Item"));
          const qty = Number(item.quantity ?? 1);
          const unit = escapeHtml(String(item.unit ?? "ea"));
          const price = Number(item.pricePerUnit ?? item.unitPrice ?? 0);
          const total = qty * price;
          return `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${desc}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 13px;">${qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${unit}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 13px;">${formatCurrency(price)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${formatCurrency(total)}</td>
          </tr>`;
        })
        .join("")
    : payload.results
        .map(
          (row: EstimateResult) => `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(row.label)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 13px;">1</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${escapeHtml(row.unit ?? "")}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 13px;">${safeNumber(row.value)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${safeNumber(row.value)}</td>
          </tr>`,
        )
        .join("");

  // Extract tax info from inputs if available
  const subtotalCents = typeof inputs?.subtotal_cents === "number" ? inputs.subtotal_cents : null;
  const taxCents = typeof inputs?.tax_cents === "number" ? inputs.tax_cents : null;
  const totalCents = typeof inputs?.total_cents === "number" ? inputs.total_cents : null;

  const hasBreakdown = subtotalCents !== null && totalCents !== null;
  const subtotal = hasBreakdown ? formatCurrency(subtotalCents / 100) : null;
  const tax = hasBreakdown && taxCents ? formatCurrency(taxCents / 100) : null;
  const total = hasBreakdown ? formatCurrency(totalCents / 100) : dollars;

  // Get tax label
  const selectedCounty = inputs?.selected_county ?? inputs?.tax_county;
  const taxLabel = selectedCounty
    ? escapeHtml(
        `Tax (${String(selectedCounty).charAt(0).toUpperCase() + String(selectedCounty).slice(1)} County)`,
      )
    : "Tax";

  // Control number
  const controlNumber = escapeHtml(String(inputs?.control_number ?? ""));

  // Contractor signature
  const signature = payload.signature as
    | { signatureDataUrl?: string; signedAt?: string; signerName?: string }
    | undefined;

  const materialsSection = materialList.length > 0
    ? `
      <div style="margin-top: 24px;">
        <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 10px 0;">Material Breakdown</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${materialList
            .map(
              (line: string) => `
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151;">${escapeHtml(line)}</td>
            </tr>`,
            )
            .join("")}
        </table>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeContractorName} — Estimate</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      html {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        color: #111827;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        background: #ffffff;
        padding: 0;
      }

      .page {
        max-width: 800px;
        margin: 0 auto;
        padding: 32px 40px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #FF7A00;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${
            contractorLogoUrl
              ? `<img src="${escapeHtml(contractorLogoUrl)}" alt="" style="width: 48px; height: 48px; border-radius: 8px; object-fit: contain; border: 1px solid #e5e7eb;" />`
              : `<div style="width: 48px; height: 48px; border-radius: 8px; background: #FF7A00; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px;">${safeContractorName.charAt(0).toUpperCase()}</div>`
          }
          <div>
            <p style="font-size: 18px; font-weight: 700; color: #111827; line-height: 1.2; letter-spacing: -0.02em;">${safeContractorName}</p>
            ${contactLine ? `<p style="font-size: 12px; color: #6b7280; margin-top: 2px;">${contactLine}</p>` : ""}
          </div>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 22px; font-weight: 800; color: #FF7A00; letter-spacing: -0.02em;">ESTIMATE</p>
          ${controlNumber ? `<p style="font-size: 11px; color: #6b7280; margin-top: 2px;">${controlNumber}</p>` : ""}
          <p style="font-size: 11px; color: #6b7280; margin-top: 2px;">${generatedAt}</p>
        </div>
      </div>

      <!-- Client & Project Info -->
      <div style="display: flex; gap: 24px; margin-top: 24px;">
        <div style="flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">Bill To</p>
          <p style="font-size: 14px; font-weight: 700; color: #111827;">${clientName || "—"}</p>
          ${jobAddress ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${jobAddress}</p>` : ""}
        </div>
        <div style="flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">Project</p>
          <p style="font-size: 14px; font-weight: 700; color: #111827;">${jobName}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${calculatorLabel}</p>
        </div>
      </div>

      <!-- Line Items Table -->
      <div style="margin-top: 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Description</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Unit</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Rate</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemRows}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
        <div style="width: 260px;">
          ${
            hasBreakdown && subtotal
              ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="font-size: 13px; color: #6b7280;">Subtotal</span>
              <span style="font-size: 13px; font-weight: 600; color: #374151;">${subtotal}</span>
            </div>
            ${
              tax
                ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="font-size: 13px; color: #6b7280;">${taxLabel}</span>
              <span style="font-size: 13px; color: #374151;">${tax}</span>
            </div>`
                : ""
            }`
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #111827; margin-top: 4px;">
            <span style="font-size: 14px; font-weight: 800; color: #111827;">TOTAL</span>
            <span style="font-size: 18px; font-weight: 800; color: #FF7A00;">${total ?? (dollars || "—")}</span>
          </div>
        </div>
      </div>

      ${materialsSection}

      <!-- Signature -->
      ${
        signature?.signatureDataUrl
          ? `
      <div style="margin-top: 32px; display: flex; gap: 24px;">
        <div style="flex: 1;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;">Contractor Signature</p>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background: #ffffff;">
            <img src="${escapeHtml(signature.signatureDataUrl)}" alt="Signature" style="height: 48px; object-fit: contain;" />
          </div>
          ${signature.signedAt ? `<p style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Signed ${new Date(signature.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>` : ""}
        </div>
        <div style="flex: 1;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;">Client Signature</p>
          <div style="border-bottom: 1px solid #111827; height: 56px;"></div>
          <p style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Date: ____________</p>
        </div>
      </div>`
          : `
      <div style="margin-top: 32px; display: flex; gap: 24px;">
        <div style="flex: 1;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;">Contractor Signature</p>
          <div style="border-bottom: 1px solid #111827; height: 56px;"></div>
          <p style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Date: ____________</p>
        </div>
        <div style="flex: 1;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;">Client Signature</p>
          <div style="border-bottom: 1px solid #111827; height: 56px;"></div>
          <p style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Date: ____________</p>
        </div>
      </div>`
      }

      <!-- Notes -->
      <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
        <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">Terms & Notes</p>
        <p style="font-size: 11px; color: #6b7280; line-height: 1.5;">
          This estimate is valid for 30 days from the date above. Prices are subject to change based on material availability and site conditions. Always verify on-site dimensions and substrate conditions before ordering.
        </p>
      </div>

        <!-- Quote Note (customer-facing) -->
        ${
          quoteNote
            ? `<section style="margin-top: 24px; padding: 16px; background: rgba(15, 23, 42, 0.03); border: 1px solid #e5e7eb; border-radius: 8px;">
               <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">
                 Note
               </p>
               <p style="font-size: 13px; color: #374151; white-space: pre-line;">${quoteNote}</p>
             </section>`
            : ""
        }

        <!-- Field Notes -->
        <section class="glass-panel px-5 py-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Field Notes
          </p>
          <p class="mt-1 text-xs text-white/70">
            Use this estimate as a planning tool. Always verify on-site dimensions, substrate conditions, and tax status (ST-124) before ordering or invoicing.
          </p>
        </section>

        <!-- Footer -->
        <footer class="pt-4 text-center text-[8pt] text-slate-500">
          <p>Powered by Pro Construction Calc</p>
          <p class="text-[8pt] mt-0.5">
            <a href="https://proconstructioncalc.com/terms" class="text-slate-500 hover:text-orange-300">Terms</a>
            <span class="mx-1">•</span>
            <a href="https://proconstructioncalc.com/privacy" class="text-slate-500 hover:text-orange-300">Privacy</a>
          </p>
        </footer>
      </main>
    </div>
    <script>document.fonts.ready.then(() => { window.__fontsReady = true; });</script>
  </body>
</html>`;
}

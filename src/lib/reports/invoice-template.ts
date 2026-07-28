/**
 * Professional estimate PDF template
 * Clean, white-background design inspired by Jobber / HousecallPro
 * Optimized for Browserless.io PDF rendering
 */

import type { EstimatePayload, EstimateResult } from "@/lib/estimates/types";
import { getNumberFormatter } from "@/utils/formatters";

type InvoiceTemplateInput = {
  payload: EstimatePayload;
  contractorName: string;
  contractorContact: string | null;
  contractorLogoUrl: string | null;
};

/** Safely escape special HTML characters to prevent HTML Injection and XSS */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Sanitize URLs by restricting schemes to safe defaults to prevent javascript: XSS */
function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("data:image/") ||
    lower.startsWith("http://") ||
    lower.startsWith("https://")
  ) {
    return trimmed;
  }
  return null;
}

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
  return getNumberFormatter({
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(value * 100) / 100);
}

export function generateInvoiceHtml(input: InvoiceTemplateInput): string {
  const { payload, contractorName, contractorContact, contractorLogoUrl } =
    input;

  const safeContractorName = contractorName || "Your Contractor";
  const contactLine = contractorContact?.trim() || "";
  const jobName =
    typeof payload.metadata.jobName === "string" && payload.metadata.jobName
      ? payload.metadata.jobName
      : payload.name;
  const calculatorLabel = payload.metadata.calculatorLabel;
  const generatedAt = new Date(payload.metadata.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const clientName = payload.client_name ?? "";
  const jobAddress = payload.job_site_address ?? "";

  const quoteNote =
    typeof payload.quote_note === "string" && payload.quote_note.trim()
      ? payload.quote_note.trim()
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

  const materialList = payload.material_list ?? [];
  const hasMaterialList = materialList.length > 0;
  const primaryResult = payload.results?.[0];

  const lineItemRows = hasBudgetItems
    ? budgetItems
        .map((item: Record<string, unknown>) => {
          const desc = String(item.name ?? item.description ?? "Item");
          const qty = Number(item.quantity ?? 1);
          const unit = String(item.unit ?? "ea");
          const price = Number(item.pricePerUnit ?? item.unitPrice ?? 0);
          const total = qty * price;
          return `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(desc)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 13px;">${qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${escapeHtml(unit)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 13px;">${escapeHtml(formatCurrency(price))}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${escapeHtml(formatCurrency(total))}</td>
          </tr>`;
        })
        .join("")
    : hasMaterialList
        ? materialList
            .map((item: string) => {
              const qty = 1;
              const unit = primaryResult?.unit ?? "estimate";
              const rate = primaryResult ? safeNumber(primaryResult.value) : "Included";
              const amount = primaryResult ? safeNumber(primaryResult.value) : "Included";
              return `
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(item)}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 13px;">${qty}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${escapeHtml(unit)}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 13px;">${escapeHtml(rate)}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${escapeHtml(amount)}</td>
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
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 13px;">${escapeHtml(safeNumber(row.value))}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${escapeHtml(safeNumber(row.value))}</td>
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
    ? `Tax (${String(selectedCounty).charAt(0).toUpperCase() + String(selectedCounty).slice(1)} County)`
    : "Tax";

  // Control number
  const controlNumber = inputs?.control_number ?? "";

  // Signature
  const signature = payload.signature as
    | { signatureDataUrl?: string; signedAt?: string; signerName?: string }
    | undefined;

  const safeLogoUrl = sanitizeUrl(contractorLogoUrl);
  const safeSignatureUrl = sanitizeUrl(signature?.signatureDataUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(safeContractorName)} — Estimate</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      :root { --color-primary: #ea580c; }
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
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #2563eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${
            safeLogoUrl
              ? `<img src="${escapeHtml(safeLogoUrl)}" alt="" style="width: 48px; height: 48px; border-radius: 8px; object-fit: contain; border: 1px solid #e5e7eb;" />`
              : `<div style="width: 48px; height: 48px; border-radius: 8px; background: #2563eb; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px;">${escapeHtml(safeContractorName.charAt(0).toUpperCase())}</div>`
          }
          <div>
            <p style="font-size: 18px; font-weight: 700; color: #111827; line-height: 1.2; letter-spacing: -0.02em;">${escapeHtml(safeContractorName)}</p>
            ${contactLine ? `<p style="font-size: 12px; color: #6b7280; margin-top: 2px;">${escapeHtml(contactLine)}</p>` : ""}
          </div>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.02em;">ESTIMATE</p>
          ${controlNumber ? `<p style="font-size: 11px; color: #6b7280; margin-top: 2px;">${escapeHtml(controlNumber)}</p>` : ""}
          <p style="font-size: 11px; color: #6b7280; margin-top: 2px;">${escapeHtml(generatedAt)}</p>
        </div>
      </div>

      <!-- Client & Project Info -->
      <div style="display: flex; gap: 24px; margin-top: 24px;">
        <div style="flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">Bill To</p>
          <p style="font-size: 14px; font-weight: 700; color: #111827;">${escapeHtml(clientName || "—")}</p>
          ${jobAddress ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${escapeHtml(jobAddress)}</p>` : ""}
        </div>
        <div style="flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">Project</p>
          <p style="font-size: 14px; font-weight: 700; color: #111827;">${escapeHtml(jobName)}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${escapeHtml(calculatorLabel)}</p>
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
              <span style="font-size: 13px; font-weight: 600; color: #374151;">${escapeHtml(subtotal)}</span>
            </div>
            ${
              tax
                ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="font-size: 13px; color: #6b7280;">${escapeHtml(taxLabel)}</span>
              <span style="font-size: 13px; color: #374151;">${escapeHtml(tax)}</span>
            </div>`
                : ""
            }`
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #111827; margin-top: 4px;">
            <span style="font-size: 14px; font-weight: 800; color: #111827;">TOTAL</span>
            <span style="font-size: 18px; font-weight: 800; color: #2563eb;">${escapeHtml(total ?? (dollars || "—"))}</span>
          </div>
        </div>
      </div>

      <!-- Signature -->
      ${
        safeSignatureUrl
          ? `
      <div style="margin-top: 32px; display: flex; gap: 24px;">
        <div style="flex: 1;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;">Contractor Signature</p>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background: #ffffff;">
            <img src="${escapeHtml(safeSignatureUrl)}" alt="Signature" style="height: 48px; object-fit: contain;" />
          </div>
          ${signature?.signedAt ? `<p style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Signed ${escapeHtml(new Date(signature.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))}</p>` : ""}
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
          ? `<section style="margin-top: 24px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
             <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">
               Note
             </p>
             <p style="font-size: 11px; color: #374151; line-height: 1.5; whitespace-pre-line">${escapeHtml(quoteNote)}</p>
           </section>`
          : ""
      }

      <!-- Footer -->
      <footer style="margin-top: 32px; padding-top: 16px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="font-size: 11px; color: #9ca3af;">Powered by Pro Construction Calc</p>
        <p style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
          <a href="https://proconstructioncalc.com/terms" style="color: #2563eb; text-decoration: none;">Terms</a>
          <span style="margin: 0 4px;">•</span>
          <a href="https://proconstructioncalc.com/privacy" style="color: #2563eb; text-decoration: none;">Privacy</a>
        </p>
      </footer>
    </div>
    <script>document.fonts.ready.then(() => { window.__fontsReady = true; });</script>
  </body>
</html>`;
}

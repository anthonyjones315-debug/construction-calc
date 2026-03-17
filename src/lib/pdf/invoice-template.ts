/**
 * Generate white-labeled invoice HTML with Tailwind CSS CDN integration
 * Optimized for Browserless.io PDF rendering
 */

import type { EstimatePayload, EstimateResult } from '@/lib/estimates/types';

type InvoiceTemplateInput = {
  payload: EstimatePayload;
  contractorName: string;
  contractorContact: string | null;
  contractorLogoUrl: string | null;
};

const BRAND_COLORS = {
  primary: '#f97316',
  surface: {
    light: '#ffffff',
    dark: '#020617'
  },
  border: '#1e293b',
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    accent: '#fdba74'
  }
} as const;

export function generateInvoiceHtml(input: InvoiceTemplateInput): string {
  const { payload, contractorName, contractorContact, contractorLogoUrl } = input;
  
  const safeContractorName = contractorName || "Your Contractor";
  const contactLine = contractorContact?.trim() || "";
  const jobName = typeof payload.metadata.jobName === "string" && payload.metadata.jobName
    ? payload.metadata.jobName
    : payload.name;
  const calculatorLabel = payload.metadata.calculatorLabel;
  const generatedAt = payload.metadata.generatedAt;
  const clientName = payload.client_name ?? "";
  const jobAddress = payload.job_site_address ?? "";
  const materialList = Array.isArray(payload.material_list) && payload.material_list.length
    ? payload.material_list
    : [];

  const primaryResult = payload.results[0];

  const dollars = typeof payload.total_cost === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(payload.total_cost)
    : null;

  const resultsRows = payload.results
    .map((row: EstimateResult) => `
      <tr class="border-b border-slate-800/80">
        <td class="px-3 py-2 text-sm text-slate-100">${row.label}</td>
        <td class="px-3 py-2 text-sm text-right font-mono text-slate-100">
          ${row.value} ${row.unit ?? ""}
        </td>
      </tr>`)
    .join("");

  const materialsRows = materialList
    .map((line: string) => `
      <li class="flex items-start gap-2 text-sm text-slate-100">
        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
        <span>${line}</span>
      </li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeContractorName} — Estimate</title>
    
    <!-- Load Tailwind CSS from CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: ${JSON.stringify({ brand: BRAND_COLORS })}
          }
        }
      }
    </script>

    <!-- Base Styles -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      html { font-family: 'Inter', system-ui, sans-serif; }
      body { margin: 0; padding: 0; background: ${BRAND_COLORS.surface.dark}; color: ${BRAND_COLORS.text.primary}; }
    </style>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100">
    <div class="px-8 py-6">
      <!-- Header with Contractor Info -->
      <header class="border-b border-slate-800 pb-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            ${contractorLogoUrl 
              ? `<div class="h-11 w-11 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                   <img src="${contractorLogoUrl}" alt="${safeContractorName} logo" class="h-full w-full object-contain" />
                 </div>`
              : `<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-xs font-extrabold tracking-[0.18em] text-white">
                   ${safeContractorName.charAt(0).toUpperCase() || "C"}
                 </div>`
            }
            <div>
              <h1 class="mt-0.5 text-lg font-extrabold text-slate-50">
                ${safeContractorName}
              </h1>
              ${contactLine
                ? `<p class="mt-0.5 text-xs text-slate-400">${contactLine}</p>`
                : ""
              }
            </div>
          </div>
          <div class="text-right text-xs text-slate-400">
            <p class="font-semibold text-sm text-slate-100">Estimate</p>
            <p>${calculatorLabel}</p>
            <p class="mt-1">Generated: ${generatedAt}</p>
          </div>
        </div>

        <!-- Client Info -->
        <div class="mt-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Client
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-100">
            ${clientName || "Client not specified"}
          </p>
          ${jobAddress
            ? `<p class="mt-0.5 text-xs text-slate-400">${jobAddress}</p>`
            : ""
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="mt-4 space-y-4">
        <!-- Project Info -->
        <section class="flex gap-4">
          <div class="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Project
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-100">${jobName}</p>
          </div>
          ${primaryResult
            ? `<div class="w-64 rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/25 to-slate-900 px-4 py-3 text-white">
                 <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                   Primary Result
                 </p>
                 <p class="mt-1 text-2xl font-extrabold">
                   ${primaryResult.value} ${primaryResult.unit ?? ""}
                 </p>
                 <p class="mt-1 text-xs text-orange-100/90">
                   ${primaryResult.label}
                 </p>
               </div>`
            : ""
          }
        </section>

        <!-- Quote Total -->
        ${dollars
          ? `<section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
               <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                 Quote Total
               </p>
               <p class="mt-1 text-2xl font-extrabold text-orange-400">
                 ${dollars}
               </p>
             </section>`
          : ""
        }

        <!-- Results Table -->
        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Results
          </p>
          <table class="mt-2 w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800/80 text-xs text-slate-400">
                <th class="px-3 py-1.5 font-semibold">Item</th>
                <th class="px-3 py-1.5 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              ${resultsRows}
            </tbody>
          </table>
        </section>

        <!-- Material List -->
        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Material List
          </p>
          <ul class="mt-2 space-y-1.5">
            ${materialsRows || `<li class="text-sm text-slate-300">Order estimate for ${payload.name}.</li>`}
          </ul>
        </section>

        <!-- Field Notes -->
        <section class="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Field Notes
          </p>
          <p class="mt-1 text-xs text-slate-400">
            Use this estimate as a planning tool. Always verify on-site dimensions, substrate conditions, and tax status (ST-124) before ordering or invoicing.
          </p>
        </section>

        <!-- Footer -->
        <footer class="pt-4 text-center text-[9pt] text-slate-500">
          <p>Powered by Pro Construction Calc</p>
          <p class="text-[8pt]">
            <a href="https://proconstructioncalc.com/terms" class="text-slate-500 hover:text-slate-400">Terms</a>
          </p>
        </footer>
      </main>
    </div>
  </body>
</html>`;

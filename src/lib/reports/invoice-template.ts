/**
 * Generate white-labeled invoice HTML with Tailwind CSS CDN integration
 * Optimized for Browserless.io PDF rendering
 */

import type { EstimatePayload, EstimateResult } from "@/lib/estimates/types";

type InvoiceTemplateInput = {
  payload: EstimatePayload;
  contractorName: string;
  contractorContact: string | null;
  contractorLogoUrl: string | null;
};

/**
 * Design tokens implementing the Liquid Orange Glass design system
 * Colors, shadows, and effects for the premium glass header
 */
const BRAND_COLORS = {
  primary: "#FF7A00", // Safety Orange base
  primaryLight: "#ff9433", // Light highlight
  primaryDark: "#cc5800", // Dark shade
  primaryGlow: "rgb(255 122 0 / 0.3)", // Glow effect
  primaryRim: "rgb(255 143 31 / 0.8)", // Rim light effect
  surface: {
    light: "#ffffff",
    dark: "rgba(2, 6, 23, 0.95)", // Deepest background
    base: "rgba(15, 23, 42, 0.85)", // Primary surface
    elevated: "rgba(30, 41, 59, 0.75)", // Elevated surface
    frost: "rgba(255, 255, 255, 0.08)", // Frosted overlay
  },
  border: {
    primary: "rgba(255, 255, 255, 0.08)", // Glass container border
    elevated: "rgba(255, 255, 255, 0.12)", // Elevated container border
    accent: "rgb(255 122 0 / 0.3)", // Orange-tinted border
  },
  text: {
    primary: "rgba(255, 255, 255, 0.95)", // Primary text
    secondary: "rgba(255, 255, 255, 0.8)", // Secondary text
    tertiary: "rgba(255, 255, 255, 0.6)", // Tertiary/hint text
    accent: "rgba(255, 153, 51, 1)", // Orange accent (primaryLight)
  },
  shadow: {
    glassSm:
      "0 2px 8px 0 rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
    glassMd:
      "0 8px 16px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
    glassLg:
      "0 16px 24px 0 rgba(0, 0, 0, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
    glow: "0 0 12px rgba(255, 122, 0, 0.3)", // Orange glow
    textGlow: "0 0 0.8px rgba(255, 143, 31, 0.8)", // Text glow
  },
} as const;

const GLASS_HEADER_GRADIENT = `linear-gradient(to bottom, rgb(255 143 31 / 0.15), rgba(2, 6, 23, 0.85))`;
const RIM_LINE_GRADIENT = `linear-gradient(to right, rgb(255 122 0 / 0), ${BRAND_COLORS.primaryRim}, rgb(255 122 0 / 0))`;

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
  const generatedAt = payload.metadata.generatedAt;
  const clientName = payload.client_name ?? "";
  const jobAddress = payload.job_site_address ?? "";
  const materialList =
    Array.isArray(payload.material_list) && payload.material_list.length
      ? payload.material_list
      : [];

  const primaryResult = payload.results[0];

  const dollars =
    typeof payload.total_cost === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(payload.total_cost)
      : null;

  const resultsRows = payload.results
    .map(
      (row: EstimateResult) => `
      <tr class="border-b border-white/10">
        <td class="px-3 py-2 text-sm text-white">${row.label}</td>
        <td class="px-3 py-2 text-sm text-right font-mono text-white">
          ${row.value} ${row.unit ?? ""}
        </td>
      </tr>`,
    )
    .join("");

  const materialsRows = materialList
    .map(
      (line: string) => `
      <li class="flex items-start gap-2 text-sm text-white">
        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 shadow-orange-glow"></span>
        <span>${line}</span>
      </li>`,
    )
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
            colors: ${JSON.stringify({ brand: BRAND_COLORS })},
            backgroundImage: {
              'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
              'glass-header': '${GLASS_HEADER_GRADIENT}'
            },
            boxShadow: {
              'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.03)',
              'glass-md': '0 8px 16px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
              'glass-lg': '0 16px 24px 0 rgba(0, 0, 0, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
              'orange-glow': '0 0 12px ${BRAND_COLORS.primaryGlow}',
              'text-glow': '0 0 0.8px rgba(255, 143, 31, 0.8)'
            }
          }
        }
      }
    </script>

    <!-- Font Loading -->
    <script>
      document.fonts.ready.then(function() {
        // Add ready class when fonts are fully loaded
        if (document.body.className.indexOf('ready') === -1) {
          document.body.className += ' ready';
        }
      });
    </script>
    
    <!-- Base Styles -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap');
      
      :root {
        --color-orange-base: ${BRAND_COLORS.primary};
        --color-orange-light: ${BRAND_COLORS.primaryLight};
        --color-orange-glow: ${BRAND_COLORS.primaryGlow};
        --radius-xl: 0.75rem;
        --radius-2xl: 1rem;
      }
      
      html {
        font-family: 'Inter', system-ui, sans-serif;
      }
      
      body {
        margin: 0;
        padding: 0;
        background: ${BRAND_COLORS.surface.dark};
        color: ${BRAND_COLORS.text.primary};
      }
      
      .glass-header {
        position: relative;
        background: ${GLASS_HEADER_GRADIENT};
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-2xl);
        box-shadow: ${BRAND_COLORS.shadow.glassMd}, ${BRAND_COLORS.shadow.glow};
        overflow: hidden;
      }
      
      .glass-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${RIM_LINE_GRADIENT};
      }
      
      .text-glow {
        text-shadow: ${BRAND_COLORS.shadow.textGlow};
      }
      
      .glass-panel {
        background: ${BRAND_COLORS.surface.base};
        border: 1px solid ${BRAND_COLORS.border.primary};
        border-radius: var(--radius-xl);
        box-shadow: ${BRAND_COLORS.shadow.glassSm};
      }
    </style>
  </head>
  <body class="min-h-screen text-slate-100" style="background: ${BRAND_COLORS.surface.dark}">
    <div class="px-8 py-6">
      <!-- Premium Glass Header with Contractor Info -->
      <header class="glass-header p-6 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            ${
              contractorLogoUrl
                ? `<div class="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur">
                   <img src="${contractorLogoUrl}" alt="${safeContractorName} logo" class="h-full w-full object-contain" />
                 </div>`
                : `<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 text-sm font-extrabold tracking-[0.18em] text-white shadow-orange-glow">
                   ${safeContractorName.charAt(0).toUpperCase() || "C"}
                 </div>`
            }
            <div>
              <h1 class="mt-0.5 text-xl font-extrabold text-white text-glow font-display" style="font-family: 'Oswald', sans-serif;">
                ${safeContractorName}
              </h1>
              ${
                contactLine
                  ? `<p class="mt-0.5 text-xs text-white/80">${contactLine}</p>`
                  : ""
              }
            </div>
          </div>
          <div class="text-right text-xs text-white/80">
            <p class="font-semibold text-sm text-white text-glow">Estimate</p>
            <p>${calculatorLabel}</p>
            <p class="mt-1">Generated: ${generatedAt}</p>
          </div>
        </div>

        <!-- Client Info -->
        <div class="mt-4 glass-panel px-5 py-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Client
          </p>
          <p class="mt-1 text-sm font-semibold text-white text-glow">
            ${clientName || "Client not specified"}
          </p>
          ${
            jobAddress
              ? `<p class="mt-0.5 text-xs text-white/70">${jobAddress}</p>`
              : ""
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="mt-4 space-y-4">
        <!-- Project Info -->
        <section class="flex gap-4">
          <div class="flex-1 glass-panel px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
              Project
            </p>
            <p class="mt-1 text-sm font-semibold text-white text-glow">${jobName}</p>
          </div>
          ${
            primaryResult
              ? `<div class="w-64 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/20 to-slate-900/90 px-5 py-4 text-white shadow-orange-glow">
                 <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-300">
                   Primary Result
                 </p>
                 <p class="mt-1 text-2xl font-extrabold text-glow font-display" style="font-family: 'Oswald', sans-serif;">
                   ${primaryResult.value} ${primaryResult.unit ?? ""}
                 </p>
                 <p class="mt-1 text-xs text-orange-100">
                   ${primaryResult.label}
                 </p>
               </div>`
              : ""
          }
        </section>

        <!-- Quote Total -->
        ${
          dollars
            ? `<section class="glass-panel px-5 py-4">
               <p class="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                 Quote Total
               </p>
               <p class="mt-1 text-3xl font-extrabold text-orange-400 text-glow font-display" style="font-family: 'Oswald', sans-serif;">
                 ${dollars}
               </p>
             </section>`
            : ""
        }

        <!-- Results Table -->
        <section class="glass-panel px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
            Results
          </p>
          <table class="mt-2 w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-xs text-white/70">
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
        <section class="glass-panel px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
            Material List
          </p>
          <ul class="mt-2 space-y-1.5">
            ${materialsRows || `<li class="text-sm text-white/90">Order estimate for ${payload.name}.</li>`}
          </ul>
        </section>

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
  </body>
</html>`;
}

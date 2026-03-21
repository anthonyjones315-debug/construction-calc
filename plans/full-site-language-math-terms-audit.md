# Full-site language, math & terms audit

**Last updated:** 2026-03-21  
**Goal:** Systematic review of user-facing copy, industry terminology, and numerical correctness across Pro Construction Calc.

---

## 1. Scope and limits

| Layer | What was verified | Limit |
|--------|-------------------|--------|
| **Money & tax** | `src/utils/money.ts`, `verifyEstimate`, NYS tax engine, invoice tests | Full automated coverage |
| **Calculator bundle** | `npm run check-calculations` | All compiled calculator exports sanity-checked |
| **Vitest** | Full suite (`npx vitest run`) | 138 tests — auth, money, tax, calculations, invoice, device, contact |
| **Financial glossary** | `src/data/financial-terms.ts` | Read and corrected (see §4) |
| **Static pages** | FAQ, About, Financial Terms, Glossary, Terms, business identity | Sampled in depth |
| **Every calculator page** | ~50+ tool routes + `CalculatorPage.tsx` (~5k lines) | **Not** line-by-line in one pass; math is split between `src/calculators/index.ts`, `CalculatorPage.tsx`, and per-page config |

**Reality check:** Auditing “every word” on ~95 `page.tsx` files plus shared components requires **ongoing editorial passes** (or content CMS). This document defines **verification methodology**, **single sources of truth**, **automated gates**, and **issues fixed** so far.

---

## 2. Route inventory (App Router)

There are **95** `src/app/**/page.tsx` files, including:

- Marketing & support: `/`, `/about`, `/contact`, `/faq`, `/guide`, `/glossary`, `/financial-terms`, `/terms`, `/privacy`, `/field-notes`, `/blog`, etc.
- Auth & account: `/sign-in`, `/sign-up`, `/settings`, `/saved`, `/command-center`, `/pricebook`, `/cart`, etc.
- Calculators: `/calculators` plus category hubs (`/calculators/concrete`, …) and individual tools under `concrete/`, `framing/`, `roofing/`, `business/`, `landscape/`, `outdoor/`, etc.

Canonical **trade copy** for category landings lives in [`src/app/calculators/_lib/trade-pages.ts`](../src/app/calculators/_lib/trade-pages.ts). Individual calculator titles/descriptions should stay aligned with that file.

---

## 3. Math verification (industry-appropriate rigor)

### 3.1 Integer cents

All dollar math that must not drift uses **cents** and helpers in [`src/utils/money.ts`](../src/utils/money.ts). Covered by [`tests/money-math.spec.ts`](../tests/money-math.spec.ts).

### 3.2 Estimates / saved rows

[`src/app/actions/calculations.ts`](../src/app/actions/calculations.ts) — `verifyEstimate` recomputes tax from **subtotal_cents** and county **basis points**; mismatches surface as `corrected`. Covered by [`tests/calculation-verification.spec.ts`](../tests/calculation-verification.spec.ts).

### 3.3 NYS sales tax

[`src/services/taxEngine.ts`](../src/services/taxEngine.ts) + [`src/data/nys-tax-rates.ts`](../src/data/nys-tax-rates.ts). Covered by [`tests/security-and-tax.spec.ts`](../tests/security-and-tax.spec.ts). **Rates must be re-verified annually** against NYS publications.

### 3.4 Calculator exports

`npm run check-calculations` — **passed** (TypeScript build of calculator module + structural checks).

### 3.5 Sample formula regression

[`tests/calculators.spec.ts`](../tests/calculators.spec.ts) — e.g. wire gauge / voltage drop spot check.

---

## 4. Terminology fixes applied (this session)

| Topic | Issue | Change |
|--------|--------|--------|
| **Payback ratio** | Aliases listed `roas` / “return on ad spend”, but ROAS = revenue ÷ ad spend, not avg job ÷ CAC | Updated definition and aliases in [`src/data/financial-terms.ts`](../src/data/financial-terms.ts) |
| **Gross profit** | GAAP often defines gross profit **before** overhead; app’s Profit Margin math subtracts **direct cost + overhead** first | Clarified definition so it matches [`CalculatorPage.tsx`](../src/app/calculators/_components/CalculatorPage.tsx) behavior and warns about alternate accounting usage |

---

## 5. Language & terms — sources of truth

| Content | File(s) |
|---------|---------|
| Financial labels & definitions | [`src/data/financial-terms.ts`](../src/data/financial-terms.ts) |
| Construction units (LF, SF, CY, …) | [`src/app/glossary/page.tsx`](../src/app/glossary/page.tsx) + same `FINANCIAL_TERMS` merge |
| Tri-county tax copy | [`src/app/financial-terms/page.tsx`](../src/app/financial-terms/page.tsx), [`src/app/HomeTaxDefaults.tsx`](../src/app/HomeTaxDefaults.tsx) |
| Legal disclaimer | [`src/app/terms/page.tsx`](../src/app/terms/page.tsx) |
| FAQ | [`src/app/faq/page.tsx`](../src/app/faq/page.tsx) |
| Brand / region | [`src/lib/business-identity.ts`](../src/lib/business-identity.ts) |

**Consistency rule:** Prefer editing **data files** (`financial-terms.ts`, `trade-pages.ts`) over duplicating long definitions inside components.

---

## 6. Automated test status (reference)

Run before releases:

```bash
npx vitest run
npm run check-calculations
```

Latest full Vitest run: **138 tests passed**. Calculator sanity script: **passed**.

---

## 7. Recommended follow-ups (not all done)

1. **Editorial:** Schedule a **phased copy review** (e.g. all `business/*` and `management/*` calculators, then concrete/framing, then remainder).
2. **E2E:** `npm run test:e2e` for flows that touch estimates and PDFs.
3. **Rates:** Calendar reminder to refresh `NYS_COUNTY_TAX_RATES` yearly.
4. **CalculatorPage.tsx:** Large file; when changing business math, update **both** `FINANCIAL_TERMS` and the corresponding result labels in code.

---

## 8. Typos / grep

Common misspellings (`recieve`, `occured`, `seperate`, etc.) — **no matches** in `src` at time of audit.

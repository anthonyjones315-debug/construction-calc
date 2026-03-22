# Copy & math audit — Pro Construction Calc

**Date:** 2026-03-21  
**Scope:** Money-critical paths, automated tests, tri-county tax copy, home/estimating terminology. A full word-by-word pass of every route is **not** completed here; this report establishes verification methodology and findings to date.

---

## 1. Money math — verified in code and tests

### Integer cents pipeline

- [`src/utils/money.ts`](../src/utils/money.ts): Dollar amounts are converted via decimal parsing + `BigInt` scaling (`toCents`, `multiplyCents`, `roundScaledInteger`) to avoid IEEE-754 drift (e.g. `1.005`, `10.075` × quantity).
- Line totals and sums use **cents** before display rounding (`centsToDollars`).

### Automated tests (all passing)

| Suite | Focus |
|--------|--------|
| `tests/money-math.spec.ts` | Half-up cents, `multiplyCents` / `multiplyDollars`, negatives, `sumDollars` |
| `tests/calculation-verification.spec.ts` | `verifyEstimate` basis points (Oneida/Herkimer/Madison), `saveCalculation` self-heal on DB check constraint |
| `tests/security-and-tax.spec.ts` | Tenant scoping; `calculateNysSalesTax` (repair vs capital/ST-124) for Oneida, Herkimer, Madison |
| `tests/invoice-template.spec.ts` | Invoice rendering invariants |
| `tests/calculators.spec.ts` | Sample regression (wire gauge / voltage drop) |

**Command run:** `npx vitest run tests/money-math.spec.ts tests/security-and-tax.spec.ts tests/calculation-verification.spec.ts tests/invoice-template.spec.ts tests/calculators.spec.ts` → **19 tests passed** (calculators: +1).

### Estimate persistence / correction

- [`src/app/actions/calculations.ts`](../src/app/actions/calculations.ts): `verifyEstimate` recomputes tax from **subtotal cents** + county **basis points** (e.g. Oneida `875` = 8.75%). Mismatch with stored tax/total yields `verification_status: "corrected"` and optional `correctedData`.

### NYS sales tax engine

- [`src/services/taxEngine.ts`](../src/services/taxEngine.ts) + [`src/data/nys-tax-rates.ts`](../src/data/nys-tax-rates.ts): Combined rates for counties; capital improvement path zero-rates and flags ST-124 messaging.
- **Industry / compliance note:** Published rates change. The data file states rates should be verified with a bookkeeper or accountant; schedule **annual** review against [NYS Tax & Finance](https://www.tax.ny.gov/) publications.

### What is not exhaustively proven here

- Every formula inside [`CalculatorPage.tsx`](../src/app/calculators/_components/CalculatorPage.tsx) (thousands of lines). Use `npm run check-calculations` / `check-calcs` in CI for the compiled calculator bundle.
- End-to-end browser flows for every estimate screen (Playwright e2e exists under `e2e/` — run `npm run test:e2e` for full regression).

---

## 2. Copy & terminology (high-traffic surfaces)

### Legal / liability

- [`src/app/terms/page.tsx`](../src/app/terms/page.tsx): Clear **“estimates only”** disclaimer, limitation of liability, verification with contractor/supplier — aligns with common construction software practice.

### Home page & marketing

- Language is consistent with **residential/light commercial** estimating (takeoff, quote, field estimates).
- **Tri-county** positioning (Oneida, Madison, Herkimer) matches regional focus; avoid implying statewide legal/tax advice without the existing disclaimers.

### Tax UI

- [`src/app/HomeTaxDefaults.tsx`](../src/app/HomeTaxDefaults.tsx): “Combined NYS + local sales tax” is accurate phrasing; rates are driven from the shared NYS table.

---

## 3. Issues found and addressed in repo

### Home “Pick a calculator” links (correctness)

- **Problem:** Rows used `/calculators?c=drywall` and `?c=flooring`. Category keys in [`trade-pages.ts`](../src/app/calculators/_lib/trade-pages.ts) are names like `concrete`, `insulation`, `finish` — **not** `drywall` or `flooring`. The calculators directory client also **does not** read `?c=` for filtering (links were ineffective for deep-linking).
- **Fix:** Use explicit canonical paths per row (e.g. drywall → `/calculators/insulation/drywall`, flooring → `/calculators/finish/flooring`). Implemented in [`src/app/page.tsx`](../src/app/page.tsx).

---

## 4. Recommended ongoing practice

1. **Rates:** Review `NYS_COUNTY_TAX_RATES` at least yearly; document change log in commit messages.
2. **Money changes:** Extend `tests/money-math.spec.ts` for any new pricing primitive.
3. **Estimates:** Any new total/subtotal field must flow through `verifyEstimate` + cents helpers.
4. **Copy:** For new customer-facing financial strings, add a short “not tax/legal advice” pointer where amounts could be construed as filing advice.

---

## 5. Optional next steps (not done)

- Wire `useSearchParams` on `/calculators` to honor `?c=` for scroll/highlight when a valid category key is present.
- Expand Vitest coverage for additional `src/calculators/index.ts` functions beyond wire gauge.
- Editorial pass on blog/field-notes for voice consistency.

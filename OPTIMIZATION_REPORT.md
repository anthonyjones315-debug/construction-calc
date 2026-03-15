# Pro Construction Calc — Optimization Report

**Date:** March 15, 2025  
**Scope:** Deep clean, dead code removal, rendering optimization, asset/bundle tuning.

---

## Phase 1: Dead Code Elimination

### Removed Legacy / Orphaned Code

| Item | Action |
|------|--------|
| **Electrical** category | Removed from Price Book categories in `src/app/pricebook/page.tsx` (legacy module no longer used). |
| **Calculators.tsx** | Deleted — legacy multi-calc UI; no imports. |
| **CalculatorShell.tsx** | Deleted — only used by removed Calculators.tsx. |
| **BudgetCalc.tsx** | Deleted — orphaned; no route or import. |
| **ResultsPanel.tsx** | Deleted — only used by removed CalculatorShell. |
| **UnitConverter.tsx** | Deleted — orphaned. |
| **AIOptimizer.tsx** | Deleted — only used by removed CalculatorShell and BudgetCalc. |
| **EstimateDisclaimer.tsx** | Deleted — only used by removed ResultsPanel and BudgetCalc. |
| **PDFButton.tsx** | Deleted — only used by removed CalculatorShell and BudgetCalc. (Saved estimates still use `createEstimatePDF` from `EstimatePDF.tsx`.) |
| **TakeoffCanvas.tsx** | Deleted — orphaned; no imports. |

**Unused import / lint fixes**

- **Sidebar.tsx:** Removed unused `Home` icon import; fixed search input a11y (removed `aria-expanded` from implicit textbox, set `type="search"`).
- **calculators/page.tsx:** Consolidated duplicate `lucide-react` imports into a single named import block.
- **globals.css:** Replaced invalid `ring:` in `.input-base:focus` with `outline` + `outline-offset` for focus ring.
- **eslint.config.mjs:** Added global ignores for `.next/**`, `dist/**`, `dist-calcs/**`, `node_modules/**` so ESLint runs only on source.

### ESLint

- `npx eslint src --fix` run; all issues in `src` resolved.
- No remaining unused imports or formatting inconsistencies in `src`.

---

## Phase 2: Server vs. Client (Calculators)

- **calculators/layout.tsx** — Unchanged; remains a **Server Component** with metadata and `JsonLD`.
- **calculators/page.tsx** — Converted to a **Server Component** shell that only renders `<CalculatorsDirectoryClient />`.
- **CalculatorsDirectoryClient.tsx** — New **Client Component** containing the directory UI, Header, Footer, and SplashPopup (all interactive).
- **Calculator sub-pages** (e.g. `framing/wall-studs/page.tsx`) — Already correct: Server Component with `generateMetadata` and a single client boundary via `<CalculatorPage page={page} />`.

Result: Routing shells and metadata stay on the server; only interactive calculator/directory UI is client.

---

## Phase 3: Assets & Bundle

- **lucide-react:** Already configured for tree-shaking in `next.config.ts` via `optimizePackageImports: ["lucide-react"]`. All usage uses named imports (no barrel or default imports).
- **Hero images:** Calculator hero SVGs use `next/image`. Added `priority` to the above-the-fold hero `<Image />` in `CalculatorPage.tsx`.
- **Public SVGs:** Remain in `/public/images/` and are referenced via Next.js `Image` where used; no duplicate or redundant rules in `globals.css`.

---

## Phase 4: Verification

- **.next** — Removed before rebuild (`rm -rf .next`).
- **TypeScript** — `npm run typecheck` (i.e. `tsc --noEmit`) passes with no errors.
- **Production build** — `npx next build` completes successfully.
  - 91 static pages generated.
  - Calculators route shows ○ (Static) for the landing and category/calculator pages where applicable.

### Build Output

- **.next size:** ~47 MB (full build artifact directory).
- **Static routes:** Home, about, blog, calculators tree, faq, offline, pricebook, privacy, settings, terms, etc., prerendered as static or PPR where used.

---

## Summary

| Metric | Result |
|--------|--------|
| **Orphaned / legacy components removed** | 9 files (Calculators, CalculatorShell, BudgetCalc, ResultsPanel, UnitConverter, AIOptimizer, EstimateDisclaimer, PDFButton, TakeoffCanvas) |
| **Unused imports / lint fixes** | 3 files (Sidebar, calculators/page, globals.css) + ESLint config ignore list |
| **Electrical reference** | Removed from Price Book categories |
| **Calculators landing** | Server shell + single client directory component |
| **ESLint (src)** | Clean after `--fix` |
| **TypeScript** | No errors |
| **Production build** | Success |

The codebase is cleaned of dead code, calculator routes use a clear server/client boundary, and the production build completes with no type or lint errors.

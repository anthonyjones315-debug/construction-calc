# Calculator Route Verification — Link Audit Report

**Date:** 2026-03-15  
**Scope:** All calculator routes under `src/app/calculators/`  
**Objective:** Identify and fix broken links, slug mismatches, and client-side crashes; confirm all calculator routes return 200 OK.

---

## Executive Summary

- **Static route matching:** No mismatches found. All hrefs in `Sidebar.tsx`, `CalculatorsDirectoryClient.tsx`, `trade-pages.ts`, `CalculatorPage.tsx`, and `CommandCenterClient.tsx` align 1:1 with the App Router file tree.
- **Next.js build:** Passed. No invalid `<Link href>` or missing route errors. All 48 calculator-related routes are present in the build output.
- **Browser probe:** All 48 URLs returned **200 OK** when probed against the production server (`next start` on port 3002).
- **Fixes applied:** None required. No broken links, slug mismatches, or missing exports were found.

---

## Phase 1: Static Route Matching (File Tree Audit)

### Sources Cross-Referenced

| Source | Purpose |
|--------|---------|
| `src/app/calculators/` directory tree | Actual route segments (folder names = URL segments) |
| `src/components/layout/Sidebar.tsx` | Uses `/calculators?c=${calcId}` (query-based), not direct paths; no mismatch with file tree |
| `src/app/calculators/page.tsx` | Root calculators landing; delegates to `CalculatorsDirectoryClient` |
| `src/app/calculators/_lib/trade-pages.ts` | Canonical paths and `categoryLinks` for all category + calculator pages |

### File Tree vs. trade-pages.ts

Every `canonicalPath` and every `categoryLinks` entry in `trade-pages.ts` was checked against the filesystem:

- **Category index routes:** `/calculators`, `/calculators/concrete`, `/calculators/framing`, `/calculators/roofing`, `/calculators/mechanical`, `/calculators/insulation`, `/calculators/finish`, `/calculators/management`, `/calculators/interior`, `/calculators/business` — each has a matching `page.tsx`.
- **Calculator sub-routes:** All 38 calculator paths (e.g. `/calculators/concrete/slab`, `/calculators/framing/wall-studs`, `/calculators/roofing/pitch-slope`, etc.) have a corresponding `page.tsx` under the correct folder.

**Result:** No folder-naming mismatches (e.g. no link to `/calculators/roof-pitch` with folder `/calculators/pitch-slope`). All links are 1:1 with the file tree.

---

## Phase 2: Local Browser Probe

- **Script:** `verify-links.mjs` (created at repo root).
- **Behavior:** Fetches each calculator URL against a configurable base URL (`BASE_URL`, default `http://localhost:3000`) with an 8s timeout; logs failures in red for 404 or 5xx.
- **Execution:** Run with production server: `npm run build && npx next start -p 3002`, then `BASE_URL=http://localhost:3002 node verify-links.mjs`.

**Note:** Against `next dev`, the probe saw 404s (likely due to EMFILE watcher / dev environment). Against `next start` (production build), all requests succeeded.

### Probe Result (Production Server)

- **Total routes checked:** 48  
- **Passed (200 OK):** 48  
- **Failed (404 or 5xx):** 0  

All of the following returned **200 OK**:

- `/calculators` (root)
- 9 category index pages (concrete, framing, roofing, mechanical, insulation, finish, management, interior, business)
- 38 calculator pages (slab, footing, block, block-wall; wall-studs, rafter-length, headers, deck-joists, wall, rafters; pitch, pitch-slope, shingles, shingle-bundles, siding, siding-squares; btu-estimator, ventilation-calc, drywall-sheets; r-value-tracker, drywall-sheets, duct-sizing, drywall, r-value; trim, flooring, stairs; margin, labor, leads; trim-baseboard, flooring-waste, stair-stringers, paint-gal; profit-margin, labor-rate, lead-estimator, tax-save)

---

## Phase 3: Next.js Build Verification

- **Command:** `npm run build`
- **Result:** Success. No "Invalid <Link href>" or route resolution errors.
- **Route (app) output:** All 48 calculator-related routes listed and generated (static ○ or partial ◐ as expected).

Build confirms that every `<Link href>` used in the app points to a valid route and that all calculator pages compile and are included in the build.

---

## Routes Summary

| Category | Index Route | Calculator Sub-Routes |
|----------|-------------|------------------------|
| Root | `/calculators` | — |
| Concrete | `/calculators/concrete` | slab, footing, block, block-wall |
| Framing | `/calculators/framing` | wall-studs, rafter-length, headers, deck-joists, wall, rafters |
| Roofing | `/calculators/roofing` | pitch, pitch-slope, shingles, shingle-bundles, siding, siding-squares |
| Mechanical | `/calculators/mechanical` | btu-estimator, ventilation-calc, drywall-sheets |
| Insulation | `/calculators/insulation` | r-value-tracker, drywall-sheets, duct-sizing, drywall, r-value |
| Finish | `/calculators/finish` | trim, flooring, stairs |
| Management | `/calculators/management` | margin, labor, leads |
| Interior | `/calculators/interior` | trim-baseboard, flooring-waste, stair-stringers, paint-gal |
| Business | `/calculators/business` | profit-margin, labor-rate, lead-estimator, tax-save |

**Total:** 1 root + 9 category index + 38 calculator pages = **48 routes**, all accessible and returning **200 OK** in production.

---

## Cause of Any Observed Failures

- **None.** No broken links or slug mismatches were found. The only failures seen were when probing `next dev` (e.g. on port 3001), where requests returned 404, consistent with a stressed dev environment (e.g. EMFILE watcher errors in the log). Production build and `next start` serve all routes correctly.

---

## Cleanup (Audit 100% Clean)

- `verify-links.mjs` was removed from the repo after the audit.
- The temporary exception for `verify-links.mjs` was removed from `scripts/enforce-types-only.mjs`.

---

## Confirmation

All 48 calculator-related routes are fully accessible and return **200 OK** when served by the Next.js production build. No fixes were required; routing and links are consistent across the file tree, `trade-pages.ts`, directory UI, and production server.

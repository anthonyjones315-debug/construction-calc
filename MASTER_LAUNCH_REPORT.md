# Master Launch Report — Pro Construction Calc (Final)

**Generated:** Visual Brand Lockdown, Field Notes sync, Rafter Pro Tip correction  
**Scope:** Placeholder image purge, unified Field Notes hub, P brand → Command Center, Pro Tip audit, 100% branding verification

---

## 1. Brand Status

**Brand name:** **Pro Construction Calc**

- **Verification:** Brand string "Pro Construction Calc" (and variants) is used consistently across the app:
  - Layout, Header, Footer, error pages, global-error, not-found
  - Calculator pages and trade-pages (hero, meta)
  - SEO (metadata, schema, sitemap)
  - PDFs (EstimatePDF, InvoicePDF)
  - Auth (sign-in, error), **Field Notes** (primary content hub), FAQ, About, Privacy, Terms
- **Canonical:** `https://proconstructioncalc.com`. **No external Blogspot.** All content hub links point to `/field-notes`.
- **Build Calc remnants:** **0.** No references to "Build Calc" in codebase.
- **Electrical references:** **0.** No "Electrical" references in codebase.
- **Placeholder images:** **0.** No placeholder or default "house" images in `/calculators`; hero imagery uses high-contrast SVGs only (e.g. concrete-slab.svg, wall-framing.svg, roof-pitch.svg).

---

## 2. Visual Brand Lockdown (Phase 1)

| Item | Status |
|------|--------|
| **Calculator hero images** | Category SVGs only: `HERO_IMAGE_MAP` in `CalculatorPage.tsx` (concrete, framing, roofing, mechanical, insulation, finish, etc.). No generic/placeholder assets. |
| **Framing "Wall" icon** | Replaced `House` with `Layout` in trade module nav for industrial-grade consistency. |
| **Mobile bottom nav** | "Home" → "Dashboard" with HardHat icon; link targets Command Center. |
| **Placeholder audit** | Grep: 0 matches for "placeholder image", "default image", "house image", or "Build Calc". |

---

## 3. Unified Field Notes Hub (Phase 2)

| Item | Status |
|------|--------|
| **Navigation** | Header and primary nav use **"Field Notes"** only (no "Blog" label). |
| **Redirects** | `/blog` → `/field-notes`, `/blog/:path*` → `/field-notes/:path*` (permanent) in `next.config.ts`. |
| **Routes** | `getBlogPostRoute(slug)` deprecated; returns `/field-notes/${slug}`. All internal links use Field Notes. |
| **P brand (logo)** | Header and Sidebar logo link to **Command Center** (`/command-center`), not home. |
| **Sitemap** | Lists `/field-notes` and Field Notes articles only; `/blog` removed from sitemap. |
| **SEO** | `getBlogPostSchema` and blog SEO title updated to Field Notes URLs and "Field Notes \| Pro Construction Calc". |

---

## 4. Field Notes — Native Content (Regional Authority Pack)

| Item | Status |
|------|--------|
| **Article metadata** | `src/app/field-notes/data.ts` — re-exports from `@/data/field-notes` for hub and `[slug]` pages. |
| **Content source** | `src/data/field-notes.ts` — 3 native articles with full body content. |
| **Articles** | (1) **Oneida County Freeze-Lines** — Rome vs. Utica requirements. (2) **NYS Retainage Laws** — payment protections for local GCs. (3) **Spray Foam vs. Fiber** — insulation R-values for Mohawk Valley winters. |
| **Slugs** | `oneida-county-freeze-lines`, `nys-retainage-laws`, `insulation-r-values` |
| **Lead hook** | **Pro Tip card** at bottom of every article. |
| **Hub** | Editorial grid at `/field-notes`; article pages at `/field-notes/[slug]` with "Use This Tool" sidebar. |
| **Unified content** | Field Notes is the **primary native content engine**; no external Blogspot. |

---

## 5. Pro Tip Audit — Rafter vs. Concrete (Phase 3)

| Item | Status |
|------|--------|
| **Rafter page** | `src/app/calculators/framing/rafters/page.tsx` uses trade definition `framing-rafters`. |
| **Corrected Pro Tip** | **"Test one complete rafter pair before full production cutting to catch slope and seat-cut errors."** (set in `trade-pages.ts` for `framing-rafters`). |
| **Frost/concrete tip** | Removed from non-concrete pages. Frost protection / Oneida County slab-and-footing sentence is appended **only** when `page.category === "concrete"` in `CalculatorPage.tsx`. Rafter and other framing/roofing/etc. pages no longer show misplaced concrete advice. |

---

## 6. CRM "Coming Soon" Modal (High-Pro Brand)

| Item | Status |
|------|--------|
| **Trigger** | "Email Estimate" button in `CalculatorPage.tsx` (hero: Export PDF, Email Estimate, Save Estimate) |
| **Component** | `ComingSoonModal` (`src/components/ui/ComingSoonModal.tsx`) |
| **Copy** | "The CRM Email Engine is in final testing. Soon, you'll be able to send branded estimates directly to clients. Follow our Field Notes for the Phase 2 rollout." |
| **CTA** | "Visit Field Notes" → `/field-notes` |

---

## 7. Sentry Source Map Security

| Item | Status |
|------|--------|
| **productionBrowserSourceMaps** | `next.config.ts`: `productionBrowserSourceMaps: false`. Production client bundles do not include source map references. |
| **Sentry** | With `SENTRY_AUTH_TOKEN` set, Sentry receives source maps at build time for error deobfuscation; maps are not served to browsers. |
| **Intellectual property** | Source code remains hidden while error tracking and calculator_audit context stay fully functional. |

---

## 8. Build Pages & Branding Verification

| Metric | Count / Status |
|--------|----------------|
| **App route pages** | 70 `page.tsx` files under `src/app` (calculators, auth, saved, field-notes, etc.). |
| **Calculator build pages** | 48 calculator-related pages (main calculators page + category + individual tools). |
| **Placeholder images** | **0** in `/calculators` or app. |
| **Electrical references** | **0** in codebase. |
| **Pro Construction Calc branding** | Applied across layout, header, footer, calculators, SEO, PDFs, auth, and Field Notes. |

---

## 9. Environment Placeholders (Next Stage)

`.env.local.example` includes placeholders for:

- **SENTRY_AUTH_TOKEN** — required for source map uploads and release creation in CI/Vercel.
- **RESEND_API_KEY**, **RESEND_FROM_EMAIL**, **RESEND_LEAD_BCC** — for CRM Email Engine (Phase 2).

Copy to `.env.local` and fill for local/CI; set same vars in Vercel for production.

---

## 10. Final Verification Checklist

| Check | Status |
|-------|--------|
| **0 placeholder images** | Confirmed; calculators use SVGs or gradient-only hero. |
| **0 Electrical references** | Grep confirms none. |
| **100% Pro Construction Calc branding** | All 70 app pages and shared components use brand. |
| **P brand → Command Center** | Header and Sidebar logo link to `/command-center`. |
| **Unified Field Notes** | Nav shows "Field Notes"; `/blog` redirects to `/field-notes`; sitemap and SEO use field-notes URLs. |
| **Rafter Pro Tip** | Correct rafter tip only; frost/concrete tip only on concrete category. |
| **Sentry handshake** | Build log shows Sentry telemetry/config for Node, Edge, Client. |
| **PWA offline** | `/offline` precached; fallback for field use. |
| **hideSourceMaps** | Production; IP protected. |

---

## 11. Build & Deploy

**Build:** `npm run build` (includes `next build --webpack`).

**Deploy:** `npm run build && vercel --prod`.

**Environment (Vercel):** Set `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `RESEND_LEAD_BCC`, `SENTRY_ORG`, `SENTRY_PROJECT`.

---

## 12. Post-Launch Checklist

- [ ] Set Sentry and Resend env vars in Vercel.
- [ ] Confirm Sentry release/source maps after first production build.
- [ ] Wire "Email Estimate" to CRM when Phase 2 is ready.

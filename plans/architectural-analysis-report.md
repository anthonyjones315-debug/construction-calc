# Pro Construction Calc — Architectural Analysis Report

Generated: 2026-03-19

---

## 1. New Estimate Flow Analysis

### 1.1 "New Estimate" Button & Navigation

The "New Estimate" button exists in two places:

| Location                | File                                                                                    | Line | Target                       |
| ----------------------- | --------------------------------------------------------------------------------------- | ---- | ---------------------------- |
| CommandCenterLiteClient | [`CommandCenterLiteClient.tsx`](src/app/command-center/CommandCenterLiteClient.tsx:186) | 186  | `/command-center?mode=draft` |
| CommandCenterClient     | [`CommandCenterClient.tsx`](src/app/command-center/CommandCenterClient.tsx:772)         | 772  | `/command-center?mode=draft` |

**Critical Finding:** The `mode=draft` query parameter is **declared** in the page's `searchParams` type (line 406 of [`page.tsx`](src/app/command-center/page.tsx:406)) but **never consumed or passed** to any child component. Clicking "New Estimate" simply reloads the Command Center page with no visible effect.

The full [`CommandCenterClient`](src/app/command-center/CommandCenterClient.tsx:499) component accepts a `draftMode` prop and, when true, initializes `activeWorkspace` to `"workflow"` (line 522). However, **this component is never rendered** — the page always renders [`CommandCenterLiteClient`](src/app/command-center/CommandCenterLiteClient.tsx:81) instead (line 438 of [`page.tsx`](src/app/command-center/page.tsx:438)). The full `CommandCenterClient` with its workspace tabs (Overview, Launch Pad, Workflow, Crew, Pages) is dead code.

**Result:** The "New Estimate" button is effectively a no-op. There is no dedicated estimate creation form or wizard.

### 1.2 Existing Estimate-Related Files

#### Pages & Components

| Path                                                                                                                       | Description                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`src/app/saved/page.tsx`](src/app/saved/page.tsx)                                                                         | Saved estimates list — server component                                         |
| [`src/app/saved/SavedContent.tsx`](src/app/saved/SavedContent.tsx)                                                         | 67.7K client component — estimate list, financial dashboard, price book builder |
| [`src/app/saved/[id]/page.tsx`](src/app/saved/[id]/page.tsx)                                                               | Single estimate detail page                                                     |
| [`src/app/saved/[id]/EstimateDetail.tsx`](src/app/saved/[id]/EstimateDetail.tsx)                                           | 45.9K client component — full estimate detail with edit, invoicing, PDF, email  |
| [`src/app/saved/estimates/[id]/page.tsx`](src/app/saved/estimates/[id]/page.tsx)                                           | Alternative estimate detail route (8.6K)                                        |
| [`src/app/saved/estimates/[id]/invoices/[invoiceId]/page.tsx`](src/app/saved/estimates/[id]/invoices/[invoiceId]/page.tsx) | Invoice detail page                                                             |
| [`src/app/estimate/sign/[id]/page.tsx`](src/app/estimate/sign/[id]/page.tsx)                                               | Public signing page via alternate URL                                           |
| [`src/app/sign/[code]/page.tsx`](src/app/sign/[code]/page.tsx)                                                             | Public signing page via share code                                              |
| [`src/app/sign/[code]/SignEstimateClient.tsx`](src/app/sign/[code]/SignEstimateClient.tsx)                                 | 15.2K client component — signature canvas, estimate review, submit flow         |
| [`src/app/cart/page.tsx`](src/app/cart/page.tsx)                                                                           | Estimate queue / cart page                                                      |
| [`src/app/command-center/CommandCenterLiteClient.tsx`](src/app/command-center/CommandCenterLiteClient.tsx)                 | Lite CC — recent estimates display                                              |
| [`src/app/command-center/CommandCenterClient.tsx`](src/app/command-center/CommandCenterClient.tsx)                         | Full CC — **dead code**, never rendered                                         |

#### API Routes

| Route                             | File                                                          | Method         | Purpose                                              |
| --------------------------------- | ------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| `/api/estimates`                  | [`route.ts`](src/app/api/estimates/route.ts)                  | GET            | List all estimates for current tenant                |
| `/api/estimates/save`             | [`route.ts`](src/app/api/estimates/save/route.ts)             | POST           | Create new estimate with control number              |
| `/api/estimates/[id]`             | [`route.ts`](src/app/api/estimates/[id]/route.ts)             | GET/PUT/DELETE | CRUD on single estimate                              |
| `/api/estimates/[id]/regen-share` | [`route.ts`](src/app/api/estimates/[id]/regen-share/route.ts) | POST           | Regenerate share code                                |
| `/api/estimates/finalize`         | [`route.ts`](src/app/api/estimates/finalize/route.ts)         | POST           | Finalize estimate → create share code → email client |
| `/api/generate-pdf`               | [`route.ts`](src/app/api/generate-pdf/route.ts)               | POST           | Generate PDF via Browserless                         |
| `/api/send`                       | [`route.ts`](src/app/api/send/route.ts)                       | POST           | Send estimate via Resend email                       |
| `/api/sign/[code]`                | [`route.ts`](src/app/api/sign/[code]/route.ts)                | GET/POST       | Fetch estimate by share code / submit signature      |

#### Library / DAL

| Path                                                                                 | Purpose                                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [`src/lib/estimates/finalize.ts`](src/lib/estimates/finalize.ts)                     | Zod schemas, share code generation, signing meta                                |
| [`src/lib/estimates/types.ts`](src/lib/estimates/types.ts)                           | `EstimatePayload`, `EstimateResult`, `EstimateMetadata` types                   |
| [`src/lib/estimates/status.ts`](src/lib/estimates/status.ts)                         | `EstimateStatus` type and helpers: Draft, Sent, Approved, Lost, PENDING, SIGNED |
| [`src/lib/estimates/share-code-support.ts`](src/lib/estimates/share-code-support.ts) | Missing column error handling                                                   |
| [`src/lib/dal/estimates.ts`](src/lib/dal/estimates.ts)                               | Data access layer for estimates                                                 |
| [`src/lib/dal/public-estimates.ts`](src/lib/dal/public-estimates.ts)                 | Public estimate access by share code                                            |
| [`src/lib/email/estimates.ts`](src/lib/email/estimates.ts)                           | Signature request email template via Resend                                     |
| [`src/lib/reports/invoice-template.ts`](src/lib/reports/invoice-template.ts)         | HTML invoice template for Browserless PDF                                       |
| [`src/app/actions/calculations.ts`](src/app/actions/calculations.ts)                 | `verifyEstimate()`, `saveCalculation()` — server-side tax/math verification     |

#### Database Schema

From [`schema.sql`](src/lib/supabase/schema.sql:48):

```sql
saved_estimates (
  id               uuid PK,
  user_id          uuid FK → users,
  name             text,
  calculator_id    text,
  inputs           jsonb,           -- raw calculator inputs + owner/signing metadata
  results          jsonb,           -- array of {label, value, unit}
  budget_items     jsonb,           -- nullable
  total_cost       decimal(10,2),
  subtotal_cents   bigint,          -- verified integer math
  tax_cents        bigint,
  total_cents      bigint,
  tax_basis_points integer,
  verified_county  text,
  verification_status text,         -- 'unverified'|'verified'|'corrected'
  client_name      text,
  job_site_address text,
  status           text,            -- Draft|Sent|Approved|Lost|PENDING|SIGNED
  share_code       text UNIQUE,
  created_at       timestamptz,
  updated_at       timestamptz
)
```

### 1.3 Calculator-to-Estimate Bridge

The bridge occurs entirely within [`CalculatorPage.tsx`](src/app/calculators/_components/CalculatorPage.tsx) — a 177K monolith. The flow:

1. **User runs a calculator** — inputs are stored in Zustand [`store.ts`](src/lib/store.ts) with per-calculator state slices (concrete, framing, roofing, etc.)
2. **"Finalize & Send" button** (line ~3055) opens a modal within the calculator page
3. **Modal offers four actions:**
   - **Download PDF** → `POST /api/generate-pdf` with `finalizePayload`
   - **Add to Estimate Queue** → calls [`addCartItem()`](src/lib/store.ts:175) to push to `estimateCart` in Zustand
   - **Save Estimate** → `POST /api/estimates/save` with the same payload
   - **Sign & Return** → `POST /api/estimates/finalize` → generates share code, sends email to client

4. **`finalizePayload`** is built in a `useMemo` (line ~2529) from the current calculator's results, inputs, metadata, and county selection.

**Key observation:** There is no standalone "create estimate" form. Every estimate originates from a calculator result. The `estimateCart` is a client-side Zustand array that persists across page navigation. The [`cart page`](src/app/cart/page.tsx) displays these items but the "Create invoice batch" button literally just calls `clearCart()` and redirects to `/saved` — it does not actually create anything.

### 1.4 Price Book / Materials System

| Component            | Path                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Price Book page      | [`src/app/pricebook/page.tsx`](src/app/pricebook/page.tsx)                                                                                        |
| Materials API (CRUD) | [`src/app/api/materials/route.ts`](src/app/api/materials/route.ts) + [`src/app/api/materials/[id]/route.ts`](src/app/api/materials/[id]/route.ts) |
| DB table             | `user_materials` — fields: id, user_id, material_name, category, unit_type, unit_cost                                                             |
| Categories           | Concrete, Lumber, Roofing, Insulation, Flooring, Siding, Paint, Other                                                                             |

**Data model:** [`user_materials`](src/lib/supabase/schema.sql:153) stores per-user (or per-business) custom materials with `material_name`, `category`, `unit_type`, and `unit_cost` (decimal 10,4).

**Integration gap:** The price book is managed on its own page but there is no direct integration path from pricebook materials into the calculator estimate workflow. The [`SavedContent.tsx`](src/app/saved/SavedContent.tsx) component imports a `PriceBookItem` type and includes a builder flow for adding materials to estimates, but this only works after an estimate is already saved — not during creation.

### 1.5 Estimate Form Fields & State Management

**There is no dedicated estimate form.** Estimates inherit their data structure from calculator results. The current fields sent during save/finalize:

| Field              | Source                                                    |
| ------------------ | --------------------------------------------------------- |
| `name`             | Auto-generated from calculator label + timestamp          |
| `calculator_id`    | Current calculator's canonical path                       |
| `results`          | Array of `{label, value, unit}` from calculator output    |
| `inputs`           | Raw calculator inputs + county selection + owner metadata |
| `total_cost`       | Computed total from calculator results                    |
| `client_name`      | Entered in finalize modal text input                      |
| `client_email`     | Entered in finalize modal text input (for Sign & Return)  |
| `job_site_address` | Entered in finalize modal text input                      |
| `status`           | Defaults to "Draft" for save, "PENDING" for finalize      |
| `material_list`    | Array of material name strings from calculator            |

**State management:** Zustand with immer middleware, persisted to localStorage under key `bcp-calc-state`. The store holds all calculator input states, tax rate, budget items, and the estimate cart.

---

## 2. PDF Generation & Document Flow

### 2.1 PDF Generation Route — Complete Analysis

**File:** [`src/app/api/generate-pdf/route.ts`](src/app/api/generate-pdf/route.ts)

**Flow:**

1. Parse request body with [`finalizeEstimateSchema`](src/lib/estimates/finalize.ts:13)
2. Authenticate via `auth()`
3. Resolve branding from `business_profiles` table (business name, email, phone, logo URL)
4. Generate HTML via [`generateInvoiceHtml()`](src/lib/reports/invoice-template.ts:58)
5. Send HTML to **Browserless.io** PDF endpoint: `https://production-sfo.browserless.io/pdf?token=...`
6. Return the PDF buffer as a downloadable attachment

**Dependencies:**

| Dependency                                                        | Purpose                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `BROWSERLESS_API_TOKEN` env var                                   | Authentication for Browserless.io headless Chrome PDF service               |
| [`generateInvoiceHtml()`](src/lib/reports/invoice-template.ts:58) | Generates full HTML page with Liquid Orange Glass design tokens, inline CSS |
| Supabase `business_profiles`                                      | Contractor branding data                                                    |
| Sentry                                                            | Error capture                                                               |
| PostHog                                                           | Analytics event `pdf_generated`                                             |

**502 Error Causes:**

1. **Browserless timeout** — The `waitFor.timeout` is set to 3000ms; if Browserless is slow or overloaded, the external fetch can time out
2. **Browserless API errors** — Any non-200 response from Browserless is caught and returned as 502
3. **Missing/invalid API token** — Returns 503 if `BROWSERLESS_API_TOKEN` is not set
4. **HTML rendering failures** — Complex CSS (glass effects, gradients) may cause Browserless rendering issues
5. **Network/DNS failures** — Production SFO endpoint unreachable

**PDF Options Configuration:**

```json
{
  "format": "Letter",
  "margin": {
    "top": "0.4in",
    "bottom": "0.4in",
    "left": "0.4in",
    "right": "0.4in"
  },
  "printBackground": true,
  "scale": 0.95,
  "waitFor": { "timeout": 3000, "selector": "body.ready" }
}
```

**Observation:** The `body.ready` selector is referenced but the HTML template in [`invoice-template.ts`](src/lib/reports/invoice-template.ts) does not appear to add this class, meaning the waitFor may always timeout to the 3s limit.

### 2.2 Document Lifecycle

```
Calculator Result → Finalize Modal
    ├── "Download PDF"        → POST /api/generate-pdf → Browserless → PDF download
    ├── "Save Estimate"       → POST /api/estimates/save → DB (status: Draft)
    ├── "Add to Queue"        → Zustand estimateCart push (client-side only)
    └── "Sign & Return"       → POST /api/estimates/finalize
                                   ├── DB insert (status: PENDING, share_code generated)
                                   ├── Email to client_email via Resend
                                   └── Returns signUrl

Client receives email → clicks signUrl → /sign/[code]
    └── GET /api/sign/[code] → loads estimate
    └── Client signs → POST /api/sign/[code]
        ├── Updates status to SIGNED
        ├── Stores signature data in inputs.signing
        ├── Revalidates cache tags
        └── PostHog event: estimate_signed

Contractor views /saved → sees updated status
```

### 2.3 All Related API Routes

| Route                                  | Purpose                                                    |
| -------------------------------------- | ---------------------------------------------------------- |
| `POST /api/generate-pdf`               | HTML → Browserless → PDF binary                            |
| `POST /api/send`                       | Send estimate email via Resend (inline HTML)               |
| `GET /api/sign/[code]`                 | Fetch public estimate by share code                        |
| `POST /api/sign/[code]`                | Submit client signature (name, email, canvas data URL)     |
| `POST /api/estimates/finalize`         | Save to DB + generate share code + optionally email client |
| `POST /api/estimates/save`             | Save draft estimate to DB                                  |
| `GET /api/estimates`                   | List all estimates for tenant                              |
| `GET/PUT/DELETE /api/estimates/[id]`   | CRUD single estimate                                       |
| `POST /api/estimates/[id]/regen-share` | Regenerate share code for existing estimate                |

### 2.4 External Service Dependencies

| Service            | Library                         | Config                                                  | Used By                                         |
| ------------------ | ------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| **Browserless.io** | Native fetch                    | `BROWSERLESS_API_TOKEN`                                 | PDF generation                                  |
| **Resend**         | `resend` v6.9.3                 | `RESEND_API_KEY`                                        | Email delivery (estimates, signatures, welcome) |
| **Supabase**       | `@supabase/supabase-js` v2.99.1 | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database for all entities                       |
| **Sentry**         | `@sentry/nextjs` v10.43.0       | DSN in env                                              | Error monitoring                                |
| **PostHog**        | `posthog-node` v5.28.2          | Server telemetry                                        | Analytics events                                |
| **Stripe**         | `stripe` v20.4.1                | Listed in deps                                          | Not visibly integrated in estimate flow         |

---

## 3. Field Notes Display

### 3.1 Data Model

**Source:** [`src/data/field-notes.ts`](src/data/field-notes.ts)

Field notes are **statically defined** in TypeScript — no database, no CMS. The [`FieldNote`](src/data/field-notes.ts:11) interface:

```typescript
interface FieldNote {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  lastVerified?: string;
  sources?: string[];
  relatedToolLinks: FieldNoteToolLink[]; // {href, label}
  content: string; // Raw Markdown
}
```

Content is Markdown rendered via [`ArticleMarkdown`](src/components/content/ArticleMarkdown.tsx) which uses `react-markdown` with custom styled components for h2, h3, p, ul, ol, blockquote, a, strong, em, hr.

### 3.2 Rendering & Layout

**Hub page:** [`src/app/field-notes/page.tsx`](src/app/field-notes/page.tsx)

- Uses `page-shell` + `viewport-main` + `viewport-frame` layout pattern
- Card grid: `grid gap-3 sm:grid-cols-2 xl:grid-cols-3`
- Each card uses `line-clamp-4` on the description paragraph (line 68) — this intentionally truncates descriptions to 4 lines

**Article page:** [`src/app/field-notes/[slug]/page.tsx`](src/app/field-notes/[slug]/page.tsx)

- Uses `min-h-0 flex-1 overflow-y-auto` on main — different from the hub page which uses `viewport-main`
- Two-column layout: `flex flex-col gap-8 lg:flex-row lg:gap-12`
- Article column: `min-w-0 flex-1`
- Sidebar: `lg:w-72 shrink-0` with `sticky top-24`

### 3.3 Content Truncation Issue

The field notes hub page uses [`line-clamp-4`](src/app/field-notes/page.tsx:68) on descriptions. This is intentional for the card grid. However, the **article page** itself has a potential truncation issue:

- The main element uses `overflow-y-auto` (line 47) which allows scrolling
- But the parent `page-shell` uses `min-h-dvh` and `flex flex-col`, while `viewport-main` in CSS sets `overflow: hidden` — these patterns can conflict
- The article page does NOT use `viewport-main` class, so it avoids this specific conflict
- However, on mobile, long markdown articles may have content cut off if the `min-h-dvh` + `flex-1` + `overflow-y-auto` chain is broken by a fixed header height

---

## 4. UI/UX Current State

### 4.1 Design System: "Liquid Orange Glass"

The app uses a custom design system documented in:

- [`plans/liquid-orange-glass-architecture.md`](plans/liquid-orange-glass-architecture.md) — Component tree and implementation strategy
- [`plans/liquid-orange-glass-design-system.md`](plans/liquid-orange-glass-design-system.md) — Full 32.7K design spec with tokens, components, effects
- [`plans/liquid-orange-glass-example.md`](plans/liquid-orange-glass-example.md) — Example implementations

**Core Design Tokens** (from [`globals.css`](src/app/globals.css:3)):

| Category     | Key Tokens                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Brand colors | `--color-primary: #ff7a00` (Safety Orange), orange-base/light/dark/glow/rim                         |
| Surfaces     | `--color-surface-deep`, `--color-surface-base`, `--color-surface-elevated`, `--color-surface-frost` |
| Text         | `--color-text-primary` (95% white), secondary (80%), tertiary (60%)                                 |
| Inputs       | `--color-input-bg` (95% white), high-contrast black text                                            |
| Feedback     | success/warning/error/info semantic colors                                                          |
| Legacy       | `--color-ink`, `--color-bg: #020617`, `--color-surface: #1e293b`                                    |

**Two Theme Modes:**

1. **Dark "Glass" theme** — Used by calculators, command center. CSS class: `command-theme`. Deep dark backgrounds with frosted glass overlays, orange accents, backdrop blur.
2. **Light "Public" theme** — Used by command center page shell. CSS class: `.light`. Overrides dark tokens with white/slate backgrounds.

### 4.2 CSS Layers & Component Classes

From [`globals.css`](src/app/globals.css) (55K):

| Class                        | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `.page-shell`                | Root page container with radial gradient background          |
| `.viewport-main`             | flex-1, min-height: 0, overflow: hidden                      |
| `.viewport-frame`            | Auto margins, max-w-72rem, flex column, gap 0.75rem, padding |
| `.content-card`              | Bordered surface cards with subtle shadow                    |
| `.glass-button`              | Glassmorphism buttons with backdrop-filter, glow hover       |
| `.glass-button-primary`      | Orange gradient primary action buttons                       |
| `.glass-modal-overlay`       | Fixed full-screen overlay with blur                          |
| `.glass-modal`               | Dialog container with glass effects                          |
| `.glass-panel-deep`          | Deep glass panels                                            |
| `.command-center-page-shell` | overflow: hidden for CC                                      |
| `.command-center-page-frame` | max-w-96rem, specific padding                                |
| `.animated-gradient-bg`      | Animated background gradient for calculator pages            |

### 4.3 Command Center Pages — Layout Structure

The Command Center page ([`page.tsx`](src/app/command-center/page.tsx:449)) uses:

```html
<div
  class="light public-page page-shell command-center-page-shell grid min-h-dvh grid-rows-[auto_1fr] overflow-hidden"
>
  <header />
  <main class="row-start-2 viewport-main">
    <div class="viewport-frame command-center-page-frame">
      {CommandCenterLiteClient | CommandCenterOnboarding}
    </div>
  </main>
</div>
```

The [`CommandCenterLiteClient`](src/app/command-center/CommandCenterLiteClient.tsx:168) layout:

- Header card — business name, "New Estimate" + "Open Calculators" buttons
- 4-column stats row — Team count, Signed count, Draft/Sent count, Role
- 2-column grid — Quick Access links (6 cards) + Crew Access (join code + member list)
- Recent Estimates card — grid of estimate links with status badges

### 4.4 The "Cleaner Second Screen"

The "cleaner second screen" is most likely the **Calculators Directory** page ([`CalculatorsDirectoryClient.tsx`](src/app/calculators/CalculatorsDirectoryClient.tsx)). It features:

- Search bar with filtered results
- Category tabs: Concrete & Masonry, Framing & Lumber, Roofing & Siding, Mechanical & Site, Finish Carpentry, Business & Estimating
- Clean card grid layout
- Splash popup for first-time visitors

This is visually simpler and more "clean" compared to the main home page and command center. The individual calculator pages use the dark glass theme with `animated-gradient-bg`.

### 4.5 Component Library

| Directory                                                | Contents                                      |
| -------------------------------------------------------- | --------------------------------------------- |
| [`src/components/layout/`](src/components/layout/)       | Header, Footer                                |
| [`src/components/ui/`](src/components/ui/)               | SplashPopup, ThemeToggle, other UI primitives |
| [`src/components/content/`](src/components/content/)     | ArticleMarkdown (react-markdown wrapper)      |
| [`src/components/financial/`](src/components/financial/) | FinancialDashboard, FinancialDataFetcher      |
| [`src/components/pdf/`](src/components/pdf/)             | useContractorProfile hook                     |
| [`src/components/auth/`](src/components/auth/)           | Auth-related components                       |
| [`src/components/settings/`](src/components/settings/)   | Settings UI                                   |
| [`src/components/support/`](src/components/support/)     | Support/feedback                              |
| [`src/components/contact/`](src/components/contact/)     | Contact form                                  |
| [`src/components/providers/`](src/components/providers/) | Context providers                             |

**No shared design system component library** (no shadcn/ui, no Radix UI). All components are custom-built with Tailwind utility classes and the custom CSS classes in `globals.css`.

---

## 5. Tax Logic

### 5.1 Tax Architecture Overview

Tax logic is spread across multiple layers:

```
[User Selection]           [Calculation Engine]         [Verification Layer]
HomeTaxDefaults            taxEngine.ts                 calculations.ts
CalculatorPage.tsx         ├─ county rates              ├─ verifyEstimate()
  ├─ taxRegion select      ├─ capital improvement       ├─ basis points
  ├─ taxCounty select      └─ NYS Form ST-124           └─ tax_cents
  └─ store.taxRate
```

### 5.2 Tax-Related Files

| File                                                                                                           | Role                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`src/services/taxEngine.ts`](src/services/taxEngine.ts)                                                       | Core tax calculation: `calculateNysSalesTax()` — handles NYS county rates, capital improvements, ST-124 form logic              |
| [`src/data/nys-tax-rates.ts`](src/data/nys-tax-rates.ts)                                                       | Static table of NYS county combined tax rates. State rate: 4%. Key counties: Oneida 8.75%, Herkimer 8.25%, Madison 8.00%        |
| [`src/lib/store.ts`](src/lib/store.ts:74)                                                                      | `taxRate: number` — persisted user default (%), defaults to 0                                                                   |
| [`src/app/HomeTaxDefaults.tsx`](src/app/HomeTaxDefaults.tsx)                                                   | Tri-County tax selector UI on homepage — buttons for Oneida, Madison, Herkimer. Writes to `store.taxRate`                       |
| [`src/app/actions/calculations.ts`](src/app/actions/calculations.ts)                                           | Server-side verification: reads `tax_cents`, `subtotal_cents`, `tax_basis_points` from estimate inputs, verifies math integrity |
| [`src/app/calculators/_components/CalculatorPage.tsx`](src/app/calculators/_components/CalculatorPage.tsx:858) | Business Tax-Save calculator: county select dropdown, tax region toggle (NYS/Other), custom rate input                          |
| [`src/app/financial-terms/page.tsx`](src/app/financial-terms/page.tsx)                                         | References `NYS_COUNTY_TAX_RATES` for educational content                                                                       |

### 5.3 Tax Flow Per Calculator

Only the **Business Tax-Save** calculator (`business-tax-save` page key) has a dedicated tax calculation UI. Other calculators compute material quantities and costs but do **not** apply sales tax automatically.

The Business Tax-Save calculator flow:

1. User selects tax region (NYS or Other)
2. If NYS: selects county from dropdown → looked up in [`NYS_COUNTY_TAX_RATES`](src/data/nys-tax-rates.ts)
3. If Other: enters custom tax rate percentage
4. Calls [`calculateNysSalesTax()`](src/services/taxEngine.ts:39) with `{county, taxableAmount, projectType, customCombinedRate}`
5. Results include: `rateApplied`, `taxDue`, `statePortion`, `localPortion`, `requiresST124`, `notes`

### 5.4 Tax Defaults System

The homepage [`HomeTaxDefaults`](src/app/HomeTaxDefaults.tsx:18) component lets users tap a county to set `store.taxRate`:

- Oneida → 8.75%
- Madison → 8.00%
- Herkimer → 8.25%

This value is persisted in localStorage but **never automatically applied to calculator results or estimates**. It's available in the store but unused by calculation logic.

### 5.5 Server-Side Tax Verification

The [`verifyEstimate()`](src/app/actions/calculations.ts:16) function validates tax math integrity during save/finalize:

- Reads `subtotal_cents`, `tax_cents`, `total_cents` from estimate inputs
- Verifies: `total_cents === subtotal_cents + tax_cents`
- Uses `tax_basis_points` to recalculate expected tax
- DB constraint on `saved_estimates`: enforces `total_cents = subtotal_cents + tax_cents`
- County-specific basis points: Oneida = 875, Herkimer = 825, Madison = 800

---

## 6. Scroll & Layout Patterns

### 6.1 Core Layout Pattern

The app uses a "fixed viewport shell" pattern:

```css
.page-shell {
  /* radial gradient bg */
}
.viewport-main {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
.viewport-frame {
  max-width: 72rem;
  flex-direction: column;
  gap: 0.75rem;
}
```

**The key issue:** `viewport-main` has `overflow: hidden`, meaning content that exceeds the viewport is clipped, not scrollable. Individual sections within must manage their own scroll. This is intentional for the calculator pages (which have their own scroll containers) but causes problems for content-heavy pages.

### 6.2 Pages Using Different Scroll Patterns

| Page                      | Scroll Strategy                                                     | Issues                                                                            |
| ------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Calculators**           | `overflow-hidden` on shell, custom scroll within calculator section | Works as designed — single-screen calculator experience                           |
| **Command Center**        | `viewport-main` with overflow hidden                                | Content can be clipped on shorter screens                                         |
| **Saved Estimates**       | `overflow-y-auto` on main content area                              | Works but header is not sticky; requires scrolling past header to reach content   |
| **Field Notes (hub)**     | `viewport-main` with overflow hidden                                | Cards may be clipped if grid overflows viewport                                   |
| **Field Notes (article)** | `overflow-y-auto` on main                                           | Article content scrollable, sidebar sticky                                        |
| **Pricebook**             | Standard scroll                                                     | Full-page scrollable                                                              |
| **Cart**                  | `overflow-y-auto scrollbar-none`                                    | Mobile-friendly scroll                                                            |
| **Home page**             | Standard flex column layout                                         | Two-column grid ratio issues documented in [`LAYOUT_ISSUES.md`](LAYOUT_ISSUES.md) |

### 6.3 Known Layout Issues

From [`LAYOUT_ISSUES.md`](LAYOUT_ISSUES.md):

1. **Two-column grid ratio mismatch** — 59/41 split can compress sidebar
2. **820px height media query** — Reduces gap and applies `line-clamp: 3` on short viewports
3. **Column height mismatch** — Primary taller than sidebar creates whitespace
4. **Tax rate cards alignment** — Inconsistent on smaller screens
5. **Feature cards grid** — No `md:grid-cols-3` breakpoint for tablet

### 6.4 Screens Needing Collapsible/Tabbed Approaches

| Screen                                 | Current State                                                                                 | Recommendation                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **SavedContent.tsx** (67.7K)           | Single scrollable page with financial dashboard, estimate list, and inline price book builder | Break into tabs: Dashboard, Estimates, Builder                                                                     |
| **EstimateDetail.tsx** (45.9K)         | All sections visible at once: details, results, budget, invoices, actions                     | Collapsible sections or tabbed sub-views                                                                           |
| **CalculatorPage.tsx** (177K monolith) | Single component with all calculator logic, finalize modal, and all UI                        | Already uses sections, but finalize modal could be extracted                                                       |
| **Command Center**                     | Flat layout, all cards visible                                                                | The full `CommandCenterClient` already has workspace tabs but is dead code. Re-enable or adapt for the lite client |
| **Home page**                          | Long scroll with hero, features, tax defaults, market highlights                              | Collapsible sections or anchor nav                                                                                 |

### 6.5 The 177K CalculatorPage Monolith

[`CalculatorPage.tsx`](src/app/calculators/_components/CalculatorPage.tsx) at 177K chars is the single largest file in the codebase. It contains:

- All trade calculator rendering logic
- All input forms for every calculator type
- Result display panels
- Budget/material panels
- The entire finalize estimate modal
- AI optimization panel
- County selection UI
- Responsive device detection
- Error boundary integration

This is the #1 candidate for decomposition in any overhaul effort.

---

## Summary of Critical Findings

### Broken / Non-Functional

1. **"New Estimate" button does nothing** — `mode=draft` query param is never consumed
2. **Cart "Create invoice batch" does nothing** — Calls `clearCart()` and redirects, creates no actual records
3. **Full CommandCenterClient is dead code** — 64K component with workspace tabs never rendered
4. **PDF `body.ready` wait selector never fires** — Template doesn't add this class, adding 3s delay to every PDF

### Architectural Concerns

1. **CalculatorPage.tsx is 177K** — Monolithic beyond maintenance threshold
2. **SavedContent.tsx is 67.7K** — Needs decomposition
3. **No standalone estimate creation flow** — All estimates must originate from a calculator
4. **No component library** — All UI is bespoke Tailwind + custom CSS
5. **Two theme systems coexist** — Light `.public-page` theme and dark glass theme
6. **Tax rate from HomeTaxDefaults is never applied** — Stored but unused by calculations

### External Dependencies at Risk

1. **Browserless.io** — Single point of failure for PDF generation; 3s timeout is tight
2. **Resend** — Email delivery for all transactional emails
3. **Supabase** — All data storage, no local fallback

---

_This report provides the foundation for all subsequent implementation work. Reference specific file paths and component names when creating implementation tasks._

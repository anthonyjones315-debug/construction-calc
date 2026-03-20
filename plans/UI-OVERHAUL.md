# Pro Construction Calc — UI Overhaul Plan

> **Goal:** Tighten the existing warm orange + off-white brand identity. Fix overlapping/hidden content, establish a consistent global layout system for all calculator pages, improve visual hierarchy, and raise curb appeal across every surface — without a full redesign.

---

## 0. Root Cause Diagnosis

Before touching a single component, here's what's actually broken and why:

| Problem | Root Cause |
|---|---|
| Cards stacking over each other / content hidden | `no-scroll-shell` / `overflow: hidden` applied too broadly; `fixed` positioning on the shell traps content inside the viewport, clipping anything below the fold |
| Colors feel loose / inconsistent | Two conflicting CSS variable systems: the dark "industrial" tokens (`--color-bg: #020617`) in `globals.css` and the light "command-theme" overrides in the layout. Components mix both systems inconsistently |
| No visual hierarchy — everything looks the same weight | Cards uniformly use `border border-slate-300 bg-white rounded-2xl shadow-sm` with no differentiation between primary, secondary, and tertiary content areas |
| Low curb appeal on the public-facing calculator directory | The homepage has no real hero — it goes straight into a search bar and a flat grid. Zero visual hook |
| Calculator pages have no standard layout | Each calculator is rendered inside `CalculatorPage.tsx` which is ~1,800 lines and handles every calc variant in one giant if-else tree. The shell itself has no consistent header, body, sidebar, or footer zone |

---

## 1. Design Token Cleanup (`globals.css` + `layout.tsx`)

**This must happen first.** The rest of the plan depends on a single, coherent light-mode token set.

### 1a. Collapse to One Token System

In `globals.css`, the `:root` block should define the **light mode** (command-theme) tokens only. The dark industrial tokens are leftovers from an earlier direction and are actively fighting the current design.

**Tokens to lock in (replace the `:root` block):**

```css
:root {
  /* Page & surfaces */
  --color-bg:           #f6f4ef;   /* warm off-white page background */
  --color-surface:      #ffffff;   /* card / panel background */
  --color-surface-alt:  #fafaf8;   /* slightly off-white for nested surfaces */
  --color-surface-deep: #f0ede6;   /* sunken / inset zone (e.g. input wells) */

  /* Ink */
  --color-ink:          #0f1117;   /* primary text */
  --color-ink-mid:      #334155;   /* secondary text */
  --color-ink-dim:      #64748b;   /* placeholder / hint text */

  /* Brand orange */
  --color-orange-brand: #ea580c;   /* primary CTA, icons, links */
  --color-orange-dark:  #c2410c;   /* hover state */
  --color-orange-soft:  #fff7ed;   /* tinted background (orange-50 equivalent) */
  --color-orange-rim:   #fed7aa;   /* border on orange elements (orange-200) */

  /* Border */
  --color-border:       #e2e0db;   /* default card/input border */
  --color-border-strong:#cbd5e1;   /* stronger divider */

  /* Nav */
  --color-nav-bg:       rgba(255, 247, 237, 0.94);
  --color-nav-border:   #e9e4da;

  /* Status */
  --color-success:      #059669;
  --color-warning:      #d97706;
  --color-error:        #dc2626;
}
```

### 1b. Remove These Leftover Dark Tokens

Delete from `globals.css` (they are overridden by `.command-theme.light` anyway, but their presence creates confusion):

```
--color-ink: #f8fafc          ← dark version, conflicts
--color-surface: #1e293b      ← dark version, conflicts
--color-bg: #020617           ← dark version, conflicts
--color-panel-dark / --color-panel-deep
--color-nav-bg: #0a0f1a       ← dark version, conflicts
```

### 1c. Update `layout.tsx` Inline Critical CSS

The inline `<style>` block in `RootLayout` hardcodes some of these tokens. Sync it to match the new token values above so there's zero flash on load.

---

## 2. Shell & Scroll Architecture Fix

**This fixes the "content hidden / overlapping" issues.**

### 2a. Remove `no-scroll-shell` from Page-Level Wraps

`no-scroll-shell` sets `position: fixed; overflow: hidden; height: 844px`. This was meant for an app-shell approach on PWA but is leaking onto regular page routes.

**Rule:** `no-scroll-shell` should only ever appear on the root app shell wrapper — never on individual pages or route layouts.

Audit all page-level JSX for these class strings and remove them from anything below the root `<body>`:
- `no-scroll-shell`
- `overflow-hidden` on a `position: fixed` container
- Any explicit `height: 844px` or `height: 100dvh` on a page `<main>`

### 2b. Standard Page Shell

Every page `<main>` should follow this pattern:

```tsx
<main
  id="main-content"
  className="flex-1 min-h-0 overflow-y-auto bg-[--color-bg]"
  tabIndex={-1}
>
  {/* page content */}
</main>
```

The `flex-1 min-h-0` pair is critical — it lets the page grow inside a flex column layout (header → main → footer) without collapsing or overflowing the viewport.

### 2c. App Layout Stack

The root `<body>` flex column should be:

```
body  (flex flex-col min-h-dvh)
  ├── <Header />        (sticky top-0 z-50, fixed height --shell-header-h)
  ├── <main>            (flex-1 min-h-0 overflow-y-auto)
  └── <Footer />        (auto height)
```

Nothing in this stack should use `position: fixed` except the header. The `<main>` scroll happens on the `<main>` itself, not the body.

---

## 3. Header Polish

The current header is architecturally sound. These are targeted tightening passes.

### 3a. Height & Padding

- Set `--shell-header-h: 52px` consistently (currently some viewports render it at slightly different heights due to `min-h` inconsistencies)
- On mobile: reduce inner gap to `gap-1`, use `px-3` on the container — items are getting clipped on 375px viewports

### 3b. Brand Mark

Current logo renders "PC" on mobile (two letters, no context). Replace with a more recognizable mark:

```
Before: HardHat + "PC" (mobile) / "Pro Construction Calc" (desktop)
After:  HardHat + "ProCalc" (mobile 375px+) / "Pro Construction Calc" (sm: 640px+)
```

Remove the `Beta` pill — it reads as unfinished/untrustworthy to new visitors. Move it to the footer as a small legal-style note if needed.

### 3c. Nav Link Sizing

Desktop nav links are `text-[11px]` — that's too small for readability. Bump to `text-xs` (12px) and add a subtle active state:

```tsx
// Active nav link
"font-semibold text-orange-600 underline underline-offset-4 decoration-orange-300"

// Inactive nav link
"text-slate-600 hover:text-orange-600 transition-colors"
```

### 3d. Estimates Queue Badge

The estimates count badge (`bg-orange-500 px-1.5 py-[2px]`) reads as a notification dot but shows "0" by default. When count is 0, hide the badge entirely:

```tsx
{estimateCount > 0 && (
  <span className="rounded-full bg-orange-500 px-1.5 py-[2px] text-[9px] font-black text-white">
    {estimateCount}
  </span>
)}
```

### 3e. Mobile Nav Drawer

The current mobile nav is a simple dropdown below the header. It works but looks unfinished. Improvements:
- Add a subtle `backdrop-blur-sm` and `shadow-lg` to the dropdown
- Add `border-t-2 border-orange-500` as a visual anchor to the header
- Each nav item gets a `min-h-10` touch target (currently 9)
- Add the user's business name at the top of the mobile nav when logged in

---

## 4. Calculator Directory (Public Homepage)

This is the first thing visitors see. Currently it opens directly to a search bar + flat grid with no hook.

### 4a. Add a Hero Strip

Replace the current `border-b border-slate-300 bg-white px-4 py-3` header bar with a proper hero strip:

```
┌────────────────────────────────────────────────────────┐
│  [HardHat icon]  PRO CONSTRUCTION CALC                 │
│  Professional Estimating Calculators for Contractors   │
│  Oneida · Madison · Herkimer County, NY                │
│                                                        │
│  [  🔍  Search: "concrete slab", "roof pitch"...  ]   │
│                                                        │
│  42 professional calculators · 6 trade modules         │
└────────────────────────────────────────────────────────┘
```

**Implementation:**
- Background: `bg-white` with a subtle `border-b-2 border-orange-100`
- The kicker line: `text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600`
- The headline: `font-display text-2xl font-black text-slate-900` (Oswald)
- The sub: `text-sm text-slate-500`
- Search bar stays as-is, just gets `mt-3 max-w-2xl` centering

This adds ~60px of height and a clear visual hierarchy anchor. Total hero strip height: ~130px on desktop.

### 4b. Trade Module Grid Cards

Current cards are functional but all the same visual weight. Add a differentiation layer:

```
Before: white card, slate border, orange icon bg, "View all →"
After:  white card, slate border, LEFT orange accent bar (3px),
        icon with slightly larger touch zone, calc count badge,
        3 sample calculator chips at bottom
```

**CSS change per card:**
```tsx
className="group relative flex flex-col rounded-xl border border-[--color-border]
           bg-[--color-surface] p-4 shadow-sm transition-all duration-200
           hover:border-orange-300 hover:shadow-md
           before:absolute before:left-0 before:top-4 before:bottom-4
           before:w-[3px] before:rounded-full before:bg-orange-500/0
           hover:before:bg-orange-500 before:transition-all"
```

### 4c. "Recommended Calculators" Section

Currently shows 6 cards in a flat grid identical to the trade module grid — visually indistinguishable. Differentiate it:

- Section kicker: `text-orange-600` (already done ✓)
- Cards: give them a `bg-[--color-surface-alt]` background instead of white so they read as secondary
- Add a `→` arrow icon that appears on hover (already has `ArrowRight` ✓ — make sure it's hidden by default, visible on `group-hover`)

### 4d. Recent Chips Strip

The "Recent:" chip strip (`border-b border-slate-200 bg-slate-50`) is good. Small fix:
- Change `bg-slate-50` to `bg-[--color-surface-alt]` to use the token
- Make chips slightly larger: `px-3 py-1.5 text-xs` instead of `px-3 py-1 text-[11px]`

---

## 5. Command Center Dashboard

The Command Center has good bones — the layout structure is solid. These passes fix the visual flatness and hierarchy problems.

### 5a. Hero Article — Visual Hierarchy

The top article (`businessName` + action buttons) is fine but the actions are overwhelming on mobile (4 full-width buttons stacked). Restructure:

```
Before: 4 equal buttons stacked vertically on mobile
After:  1 primary CTA (full-width, orange)
        + 1 row of 3 secondary ghost buttons (icon + label, equal width)
```

```tsx
// Primary
<Link className="btn-primary w-full">
  New Estimate →
</Link>

// Secondary row
<div className="grid grid-cols-3 gap-2 mt-2">
  <Link className="btn-ghost">Calculators</Link>
  <Link className="btn-ghost">Price Book</Link>
  <Link className="btn-ghost">Field Notes</Link>
</div>
```

### 5b. Stat Cards — Color Differentiation

Currently all 4 stat cards (`Total`, `Signed`, `Sent`, `Drafts`) use identical white backgrounds. The numbers are colored but the cards are indistinguishable at a glance.

Add a tinted left border to each:

```tsx
// Total Estimates
className="... border-l-4 border-l-slate-400"

// Signed
className="... border-l-4 border-l-emerald-500"

// Sent
className="... border-l-4 border-l-blue-500"

// Drafts
className="... border-l-4 border-l-orange-500"
```

This creates instant visual scannability — contractors will be able to parse their pipeline in 2 seconds.

### 5c. Quick Access Grid

Current quick access cards all use `bg-slate-50` — they look like disabled states. Fix:

```
Before: bg-slate-50 border border-slate-200
After:  bg-white border border-[--color-border] hover:border-orange-300 hover:bg-orange-50/50
```

Also: the icons are `text-orange-600` which is good, but the card titles are `text-sm font-semibold text-slate-900` — bump to `font-bold` for stronger hierarchy.

### 5d. Crew Access Panel

The join code display is clunky — it's a `break-all` mono string that looks like a bug. Improve:

- Format the join code with dashes if it's a long string (e.g. `ABCD-EFGH-IJKL`)
- Give it a `bg-orange-50 border border-orange-200` background instead of slate so it reads as "special"
- Copy button: make it `rounded-lg` instead of `rounded-xl` (matches the code block better)

### 5e. Recent Estimates — Empty State

The empty state (no estimates yet) is well-designed. One addition:
- Add a second CTA: `Browse Calculators →` as a ghost button below "Start First Estimate"
- This guides new users who aren't sure what to estimate yet

### 5f. Pro Tips Section

Currently 3 identical tip cards with `Lightbulb` icon. These are good content but look like filler because they're all the same size and weight.

Improve:
- Vary the background: first tip gets `bg-orange-50/50`, rest stay `bg-slate-50`
- Add a subtle tip number badge: `01`, `02`, `03` in `text-[10px] font-black text-slate-300` at top-right

---

## 6. Global Calculator Layout Standard

**This is the biggest structural change.** The goal is a standard layout shell that wraps every individual calculator — replacing the sprawling inline layout logic inside `CalculatorPage.tsx`.

### 6a. The Standard Calculator Shell

Every calculator page should render inside this shell:

```
┌─────────────────────────────────────────────────────────┐
│  BREADCRUMB BAR  (Home / Calculators / Trade / Calc)    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────┐  ┌──────────────────┐ │
│  │   INPUTS PANEL              │  │  RESULTS PANEL   │ │
│  │   ─────────────────         │  │  ─────────────── │ │
│  │   [Input fields]            │  │  Primary result  │ │
│  │   [Unit toggle]             │  │                  │ │
│  │   [Calculate button]        │  │  Secondary rows  │ │
│  │                             │  │                  │ │
│  │                             │  │  [Action bar]    │ │
│  │                             │  │  Save / Email    │ │
│  └─────────────────────────────┘  └──────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  CONTEXT PANEL (collapsed by default on mobile)     ││
│  │  Pro Tip · Related Calcs · Material List            ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Column split:** `lg:grid-cols-[1fr_380px]` — inputs take the left, results take the right. On mobile, results appear below inputs (natural reading order).

### 6b. Create `CalculatorShell` Component

**File:** `src/app/calculators/_components/CalculatorShell.tsx`

```tsx
interface CalculatorShellProps {
  page: TradePageDefinition;
  inputsPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
  contextPanel?: React.ReactNode;
}

export function CalculatorShell({
  page,
  inputsPanel,
  resultsPanel,
  contextPanel,
}: CalculatorShellProps) {
  return (
    <main id="main-content" className="flex-1 min-h-0 bg-[--color-bg]" tabIndex={-1}>
      {/* Breadcrumb */}
      <CalculatorBreadcrumb page={page} />

      {/* Page header */}
      <CalculatorPageHeader page={page} />

      {/* Main grid */}
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Inputs */}
          <section aria-label="Calculator inputs" className="space-y-4">
            {inputsPanel}
          </section>

          {/* Results */}
          <section aria-label="Calculator results" className="space-y-4">
            {resultsPanel}
            {contextPanel && (
              <CalculatorContextPanel>{contextPanel}</CalculatorContextPanel>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
```

### 6c. Create `CalculatorPageHeader` Component

**File:** `src/app/calculators/_components/CalculatorPageHeader.tsx`

This replaces the inline header in `TradeLanding` and the implicit header inside `CalculatorPage`:

```tsx
export function CalculatorPageHeader({ page }: { page: TradePageDefinition }) {
  const Icon = TILE_ICON_MAP[page.category];

  return (
    <div className="border-b border-[--color-border] bg-[--color-surface]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center
                        rounded-xl bg-orange-50 border border-orange-200">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
            {page.heroKicker}
          </p>
          <h1 className="font-display text-xl font-black leading-tight text-slate-900 sm:text-2xl">
            {page.title}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
            {page.description}
          </p>
        </div>

        {/* Pro Tip (desktop only) */}
        <aside className="hidden max-w-[200px] text-xs text-slate-500 lg:block">
          <p className="font-bold uppercase tracking-[0.16em] text-orange-600 text-[10px]">
            Pro Tip
          </p>
          <p className="mt-1 line-clamp-3 leading-relaxed">{page.proTip}</p>
        </aside>
      </div>
    </div>
  );
}
```

### 6d. Create `CalculatorBreadcrumb` Component

**File:** `src/app/calculators/_components/CalculatorBreadcrumb.tsx`

Currently breadcrumbs are inline in `TradeLanding` but absent from individual calc pages. Standardize:

```tsx
export function CalculatorBreadcrumb({ page }: { page: TradePageDefinition }) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Calculators", href: "/calculators" },
    { label: CATEGORY_LABELS[page.category], href: `/calculators/${page.category}` },
    ...(page.type === "calculator" ? [{ label: page.title, href: page.canonicalPath }] : []),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-[--color-border] bg-[--color-surface-alt] px-4 py-1.5 sm:px-6"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-1.5 text-[11px] text-slate-500">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            <Link
              href={crumb.href}
              className={i === crumbs.length - 1
                ? "font-semibold text-slate-800"
                : "hover:text-orange-600 transition-colors"
              }
              aria-current={i === crumbs.length - 1 ? "page" : undefined}
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### 6e. Inputs Panel Standard Cards

All calculator inputs should live inside a card with consistent structure:

```tsx
// Standard input card wrapper
<div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
    {sectionLabel}
  </p>
  {/* inputs */}
</div>
```

Input fields use `ProInput` (already defined in `glass-elements`) — this is good, keep it.

**Problem to fix:** `ProInput` currently uses dark glass styling that conflicts with the light theme. Update its base styles:

```
Before: bg-[--color-input-bg] border-[--color-input-border]  ← points to dark tokens
After:  bg-white border-[--color-border] focus:border-orange-400
        text-[--color-ink] placeholder:text-[--color-ink-dim]
```

### 6f. Results Panel Standard

Results panel always renders as a sticky card on desktop:

```tsx
<div className="lg:sticky lg:top-[calc(var(--shell-header-h)+1rem)]
                rounded-xl border border-[--color-border] bg-[--color-surface]
                p-4 shadow-sm space-y-3">
  {/* Primary result — big, prominent */}
  <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
      {primaryResult.label}
    </p>
    <p className="mt-1 font-display text-3xl font-black text-slate-900">
      {primaryResult.value}
      <span className="ml-1 text-lg font-semibold text-slate-400">
        {primaryResult.unit}
      </span>
    </p>
  </div>

  {/* Secondary results — smaller, in a grid */}
  <div className="grid grid-cols-2 gap-2">
    {secondaryResults.map(r => (
      <div key={r.label} className="rounded-lg bg-[--color-surface-alt] px-3 py-2.5">
        <p className="text-[10px] text-slate-500">{r.label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">
          {r.value} <span className="text-xs font-normal text-slate-400">{r.unit}</span>
        </p>
      </div>
    ))}
  </div>

  {/* Action bar */}
  <div className="flex gap-2 pt-1 border-t border-[--color-border]">
    <button className="flex-1 btn-primary text-xs">Save to Estimate</button>
    <button className="btn-ghost text-xs px-3">Email PDF</button>
  </div>
</div>
```

---

## 7. Shared Button System

Currently buttons are fully inline-styled everywhere. Create a consistent button system via utility classes in `globals.css`:

```css
/* globals.css — add to utility layer */
@layer utilities {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-1.5 rounded-lg
           bg-orange-600 px-4 py-2.5 text-sm font-bold text-white
           transition-all duration-150
           hover:bg-orange-700 active:scale-[0.98]
           focus-visible:outline focus-visible:outline-2
           focus-visible:outline-offset-2 focus-visible:outline-orange-500
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center gap-1.5 rounded-lg
           border border-[--color-border] bg-[--color-surface]
           px-4 py-2.5 text-sm font-semibold text-slate-700
           transition-all duration-150
           hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700
           active:scale-[0.98]
           focus-visible:outline focus-visible:outline-2
           focus-visible:outline-offset-2 focus-visible:outline-orange-500;
  }

  .btn-danger {
    @apply inline-flex items-center justify-center gap-1.5 rounded-lg
           bg-red-600 px-4 py-2.5 text-sm font-bold text-white
           transition-all duration-150
           hover:bg-red-700 active:scale-[0.98];
  }
}
```

Then do a find/replace across the codebase to use these classes instead of the inline variants.

---

## 8. Footer Cleanup

The footer is minimal and functional. One pass:

- Increase vertical padding: `py-3` → `py-4`
- The disclaimer copy (`Built for contractors working across...`) is good — bump to `text-[11px]` so it's slightly more readable
- Add a "v0.1 Beta" version note in the copyright line so "Beta" lives in the footer not the header
- Ensure all link hover states use `hover:text-[--color-orange-brand]` consistently (they currently do ✓)

---

## 9. Implementation Order

Execute in this sequence to avoid regressions:

```
Phase 1 — Foundation (no visual changes yet, fixes breakage)
  1. Design token cleanup (Section 1)
  2. Shell / scroll architecture fix (Section 2)
  3. ProInput light-theme fix (Section 6e)

Phase 2 — Global components
  4. Shared button system (Section 7)
  5. Header polish (Section 3)
  6. Footer cleanup (Section 8)

Phase 3 — Pages
  7. Calculator directory hero + card polish (Section 4)
  8. Command Center hierarchy pass (Section 5)

Phase 4 — Calculator standard layout
  9. CalculatorBreadcrumb component (Section 6d)
  10. CalculatorPageHeader component (Section 6c)
  11. CalculatorShell component (Section 6b)
  12. Wire CalculatorPage.tsx to use CalculatorShell (Section 6a)
  13. Results panel standard (Section 6f)
```

---

## 10. Quick Wins (Can Be Done in < 30 min Each)

These are zero-risk changes with immediate visible impact:

1. **Remove `Beta` pill from header** — adds instant credibility
2. **Hide estimate badge when count is 0** — removes "broken" feeling
3. **Add `border-l-4` to stat cards** — instant hierarchy, ~3 lines changed
4. **Bump `btn-primary` min-height to `44px`** — better touch targets everywhere
5. **Add `shadow-md` on hover to all cards** — adds depth/interactivity signal
6. **Fix `text-[11px]` nav links → `text-xs`** — more readable without layout change
7. **Change all `bg-slate-50` inside cards to `bg-[--color-surface-alt]`** — uses token, slightly warmer feel

---

## 11. Files Touched Per Phase

| Phase | Files |
|---|---|
| 1 | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/glass-elements.tsx` |
| 2 | `src/app/globals.css`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx` |
| 3 | `src/app/calculators/CalculatorsDirectoryClient.tsx`, `src/app/command-center/CommandCenterLiteClient.tsx`, `src/app/command-center/CommandCenterClient.tsx` |
| 4 | `src/app/calculators/_components/CalculatorShell.tsx` (new), `src/app/calculators/_components/CalculatorPageHeader.tsx` (new), `src/app/calculators/_components/CalculatorBreadcrumb.tsx` (new), `src/app/calculators/_components/CalculatorPage.tsx` |

---

## 12. What We're NOT Changing

To keep scope contained and avoid regressions:

- ❌ No changes to routing or URL structure
- ❌ No changes to auth flow or Supabase integration
- ❌ No changes to calculator math logic
- ❌ No new dependencies (no new icon libraries, UI kits, etc.)
- ❌ No dark mode work — we're committing to the warm light theme
- ❌ No changes to PDF generation or email templates
- ❌ No changes to the Pricebook or Settings pages (separate pass)

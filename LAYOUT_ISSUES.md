# UI Layout & Spacing Issues Report

Based on code analysis and visual inspection of the home page, here are the identified layout clashes and recommendations:

## 🔴 Critical Issues (High Priority)

### 1. **Two-Column Grid Ratio Mismatch**

**Location:** `src/app/page.tsx` - Grid layout `lg:grid-cols-[1.35fr_0.92fr]`
**Problem:** Left column (59%) is significantly wider than right column (41%), causing potential visual imbalance
**Impact:** On certain content lengths, the sidebar might appear cramped or content could overflow
**Recommendation:**

- Test at different content lengths
- Consider adjusting ratio to `lg:grid-cols-[1.3fr_1fr]` for better balance
- Add min-width constraints to prevent sidebar compression below readable size

### 2. **Viewport Height Media Query (820px)**

**Location:** Custom CSS with special handling for `@media (min-width: 1200px) and (max-height: 820px)`
**Problem:** Reduces gap spacing and applies text clipping (`-webkit-line-clamp: 3`) which might hide important information
**Impact:** Content gets cut off for users on smaller laptop screens or secondary monitors
**Recommendation:**

- Remove or adjust the `820px` height breakpoint
- Use flexible spacing instead of hard gaps
- Avoid text clipping; let content wrap naturally

### 3. **Column Height Mismatch**

**Location:** Primary column vs. Secondary column container heights
**Problem:** Primary column with hero, features, and tax section is often taller than sidebar
**Impact:** Sidebar panels might float or create white space; footer alignment issues
**Recommendation:**

- Make both columns equal heights with `min-h-full`
- Use `lg:h-full` on grid container
- Ensure `overflow` is handled properly

## 🟡 Medium Priority Issues

### 4. **Sidebar Panel Text Overflow**

**Location:** `.home-secondary-column` panels (EXPLORE NEXT, TAX DEFAULTS, SHORTCUTS)
**Problem:** Long link text or section titles might overflow panel width
**Visual Issue:** Text could wrap unexpectedly or be cut off
**Fix:**

```tsx
// Add to each panel:
className = "... truncate hover:overflow-visible ...";
// Or use better text wrapping:
className = "... break-words ...";
```

### 5. **Feature Cards Grid Responsiveness**

**Location:** Feature cards use `sm:grid-cols-2 xl:grid-cols-3`
**Problem:** At tablet size (768px), cards might be too narrow or wide
**Recommendation:** Add `md:grid-cols-3` breakpoint or adjust gap

### 6. **Tax Rate Cards Alignment**

**Location:** HomeTaxDefaults component - 3-column grid
**Problem:** When stacked on smaller screens, might not align properly
**Visual Issue:** Inconsistent vertical spacing between Oneida/Madison/Herkimer cards
**Fix:**

```tsx
// Ensure consistent spacing:
className = "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3";
```

## 🟢 Lower Priority / Fine-tuning

### 7. **Button Spacing in Hero**

**Location:** CTA button group (Start Estimate + secondary buttons)
**Issue:** Buttons might stack awkwardly on tablet
**Fix:** Add explicit `flex flex-wrap` rules and gap control

### 8. **Section Padding Consistency**

**Location:** Gap between hero, features, tax section, and market highlights
**Issue:** Gaps vary (`gap-2`, `gap-3`, custom values)
**Fix:** Define consistent spacing scale

```tsx
const SPACING = {
  section: "gap-4 sm:gap-6", // Between major sections
  card: "gap-2 sm:gap-3", // Between cards
  element: "gap-1 sm:gap-2", // Within elements
};
```

## 📊 Test Results Overview

Created **7 layout-specific tests** in `e2e/layout-clashes.spec.ts`:

- ✅ Two-column desktop layout
- ✅ Hero heading alignment
- ✅ Section spacing consistency
- ✅ No horizontal overflow
- ✅ Tablet stacking (768px)
- ✅ Mobile single-column (375px)
- ⚠️ Short viewport height handling (820px)

## 🛠️ Recommended Fixes (Priority Order)

### Phase 1: Quick Wins

1. Remove or fix the `820px` height media query
2. Ensure consistent gap spacing throughout
3. Test the two-column ratio at different screen sizes

### Phase 2: Responsive Improvements

1. Add explicit breakpoints for tablet (768px)
2. Improve feature cards grid responsiveness
3. Fix sidebar panel text overflow

### Phase 3: Polish

1. Optimize button spacing
2. Fine-tune section padding
3. Add visual regression tests

## 📝 Files to Update

- `src/app/globals.css` - Fix media queries and spacing
- `src/app/page.tsx` - Adjust grid ratio and responsive classes
- `src/app/HomeTaxDefaults.tsx` - Improve card alignment
- `e2e/layout-clashes.spec.ts` - Run to verify fixes

## 🎯 Next Steps

1. Run layout tests with `npm run test:e2e -- e2e/layout-clashes.spec.ts --project=chromium`
2. Open HTML report with `npx playwright show-report`
3. Fix identified issues one column/section at a time
4. Re-run tests to verify fixes

# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-03-18 - Copy Buttons Need Visual Delight and Screen Reader Live Announcements
**Learning:** Copy buttons in data-dense components like `ProResult` often fail to give accessible feedback to screen readers when text changes dynamically from "Copy" to "Copied", while visual users benefit from clear success states (emerald highlights and checkmark icons) and keyboard ring visibility.
**Action:** When updating copy action controls, pair visual transition states (emerald highlight + check icon) with `focus-visible:ring-primary` and an `aria-live="polite"` / `role="status"` region for screen reader announcements.

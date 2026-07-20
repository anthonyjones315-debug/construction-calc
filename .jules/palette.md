## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Dual-Mode Form Controls and Redundant Announcements
**Learning:** In composite inputs using `<fieldset>` and `<legend>`, inner interactive elements must omit `aria-labelledby` referencing the legend's ID if they already have explicit, unique `aria-label` attributes to prevent redundant layout or name announcements. When elements act in single-input mode, nesting under a `<label>` provides native click-to-focus and does not require `<fieldset>`/`<legend>` structures.
**Action:** Always omit group-level `aria-labelledby` on internal controls of a fieldset that use distinct `aria-label`s, and preserve `<label>` wrapping for single inputs.

## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Overriding ARIA Names in Grouped Controls
**Learning:** Grouped controls within a `<fieldset>` / `<legend>` can suffer from redundant name announcements. To prevent the legend's group label from overriding descriptive individual `aria-label` attributes, sub-controls like those in `FeetInchesInput` must omit `aria-labelledby`. However, the primary `<input>` in a composite `ProInput` must retain `aria-labelledby` referencing the legend's ID to preserve its accessible name.
**Action:** Omit `aria-labelledby` on sub-controls with explicit `aria-label`s inside fieldsets, while retaining it on primary text inputs to ensure clean screen reader announcements.

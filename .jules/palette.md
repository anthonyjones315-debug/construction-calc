## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-17 - Accessible Naming for Fields inside Composite Groups
**Learning:** When a composite form field switches from a `<label>` wrapper to a `<fieldset>`/`<legend>` layout, nested controls (like the primary `<input>`) are no longer implicitly labeled. To prevent them from becoming unlabeled controls, the primary input must retain `aria-labelledby` referencing the legend's text, while other secondary controls (like a units `<select>`) must use a specific `aria-label` to avoid redundant announcements of the group label.
**Action:** Always verify that every nested control in a composite `<fieldset>` has a clear and distinct accessible name, either via `aria-labelledby` pointing to the legend, or via an explicit `aria-label`.

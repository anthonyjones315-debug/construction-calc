## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-24 - Individual Label Precedence in Composite Fieldsets
**Learning:** Placing `aria-labelledby` on interactive inputs inside a `<fieldset>` will cause modern screen readers to prioritize the legend group name, completely overriding the more specific and descriptive individual `aria-label` attributes on those inputs.
**Action:** Omit `aria-labelledby` on the sub-inputs/controls inside `<fieldset>` when they have descriptive `aria-label` attributes to ensure they are announced correctly.

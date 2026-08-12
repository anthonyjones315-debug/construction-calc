## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Overriding Descriptive ARIA Labels in Grouped Controls
**Learning:** When using `<fieldset>` and `<legend>` for composite grouping (e.g., in `FeetInchesInput` or `ProInput` with select), nested interactive controls should omit `aria-labelledby` referencing the group's legend ID. Referencing the group label via `aria-labelledby` on internal controls will override more specific and descriptive individual `aria-label` attributes (e.g., "feet", "inches", "fractional inches"), causing screen readers to lose specific input contexts.
**Action:** Ensure nested inputs inside a semantic group fieldset specifically omit `aria-labelledby` referencing the legend, and rely on explicit individual `aria-label` and `aria-describedby` attributes instead.

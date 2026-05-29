## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-05-29 - Large Click Targets in Composite Inputs
**Learning:** When using `<fieldset>` and `<legend>` for composite inputs, nesting all descriptive elements (label, sub-label, help text) inside a single `<label htmlFor={id}>` ensures the entire header remains a valid click target for focusing the primary input, maintaining UX fluidity while improving accessibility.
**Action:** Nest all legend content within a `<label>` when implementing the fieldset/legend pattern for composite inputs.

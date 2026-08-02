## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Deep Accessibility and Control Identification inside Fieldsets
**Learning:** Having an `aria-labelledby` pointing to a fieldset legend on every child control overrides their specific, descriptive `aria-label` attributes in screen readers, resulting in redundant or incorrect announcements. Furthermore, secondary subLabel and helpText should always be linked using `aria-describedby` to the interactive inputs.
**Action:** In composite fieldsets (like `FeetInchesInput`), omit `aria-labelledby` from controls that have highly descriptive `aria-label`s, and map support labels (subLabel, helpText) to controls via `aria-describedby` dynamically.

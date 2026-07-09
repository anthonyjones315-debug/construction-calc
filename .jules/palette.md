## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Descriptive Labels vs. Group Association
**Learning:** `aria-labelledby` takes precedence over `aria-label`. In composite fields (using `<fieldset>`/`<legend>`), internal interactive elements should omit `aria-labelledby` pointing to the group label if they have specific `aria-label` attributes. This prevents the group label from overriding the more descriptive individual labels, ensuring screen readers announce exactly what each control does (e.g., "Length value" vs "Length unit").
**Action:** Remove redundant `aria-labelledby` from internal controls of composite inputs when descriptive `aria-label`s are used.

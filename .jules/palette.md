## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-08-11 - Overriding Group Labels & Aria Associations
**Learning:** For composite inputs rendering with `<fieldset>` and `<legend>`, interactive elements (like input fields and selects) inside must omit `aria-labelledby` referencing the legend's ID if they have explicit, more descriptive `aria-label` values (e.g. "feet", "inches") to prevent the group label from overriding these. Also, sub-labels and help texts must be linked using `aria-describedby` on the primary controls.
**Action:** Omit `aria-labelledby` on internal controls inside `<fieldset>` when they have descriptive `aria-label`s, and bind extra helper texts using `aria-describedby` on primary inputs.

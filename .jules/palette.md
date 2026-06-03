## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Click-to-Focus for Composite Input Legends
**Learning:** While `<fieldset>` and `<legend>` are best for grouping composite inputs, the legend itself is not focusable and doesn't natively trigger focus on its children. Wrapping the legend content in a `<label htmlFor={primaryId}>` restores the expected "click-label-to-focus-input" behavior for the primary control in the group without violating accessibility rules.
**Action:** Always wrap the text inside a `<legend>` with a `<label>` associated with the first interactive control in the group (e.g., the "feet" input in a Feet/Inches component).

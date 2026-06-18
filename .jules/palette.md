## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-06-18 - Large Click Targets for Compound Inputs
**Learning:** For inputs grouped in a `<fieldset>`, users expect the heading text (the `<legend>`) to be clickable to focus the field. Wrapping the legend text in a `<label>` targeting the first input provides a "Large Click Target" that feels more native and accessible. However, care must be taken to avoid nesting a `<label>` inside a parent `<label>` container, which is an accessibility violation.
**Action:** Implement "Large Click Targets" by nesting a `<label>` inside `<legend>` for compound inputs. If the parent container can dynamically switch between `<label>` and `<fieldset>`, ensure the inner wrapper also switches between `<span>` and `<label>` to maintain valid HTML nesting.

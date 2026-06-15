## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Dynamic Root for Large Click Target Pattern
**Learning:** The "Large Click Target" pattern (wrapping a component in a `<label>`) is excellent for UX but invalid when the component contains multiple interactive elements (like a text input and a unit select). A hybrid approach—using a `<label>` root for simple inputs and a `<fieldset>` root for compound inputs—preserves both the large hit area and semantic accessibility.
**Action:** Dynamically switch between `<label>` and `<fieldset>` based on input complexity to maintain maximum clickability without violating accessibility standards.

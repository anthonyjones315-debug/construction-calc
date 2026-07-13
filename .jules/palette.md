## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-22 - Deep Accessibility for Input Hints
**Learning:** Providing `subLabel` or `helpText` visually is insufficient for accessibility. Screen readers must be programmatically linked to these hints using `aria-describedby` to ensure users with visual impairments receive the full context of an input field. Additionally, in composite fields (like Feet/Inches), internal inputs should use specific `aria-label`s and omit `aria-labelledby` referencing the group label to avoid redundant or overriding announcements.
**Action:** Always link supplementary text (hints, sub-labels) to inputs via `aria-describedby` and ensure composite components have specific labels for their internal parts.

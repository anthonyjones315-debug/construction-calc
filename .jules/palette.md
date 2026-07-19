## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-17 - Granular Accessibility and Interactive Labeling
**Learning:** In composite input components (like feet/inches or custom inputs with unit selects), interactive controls within a `<fieldset>` should omit `aria-labelledby` referencing the group's legend ID to prevent screen readers from muddying their descriptive individual `aria-label` names. Additionally, sub-labels and help texts should always be associated via `aria-describedby` on both single and composite input elements.
**Action:** Generate unique IDs for sub-labels and help texts, linking them via `aria-describedby` on inputs, and omit redundant `aria-labelledby` from grouped interactive controls with existing rich labels.

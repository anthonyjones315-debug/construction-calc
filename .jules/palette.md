## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Shadowing of aria-label by aria-labelledby
**Learning:** `aria-labelledby` takes precedence over `aria-label`. In composite components like `FeetInchesInput`, keeping `aria-labelledby` on internal inputs causes screen readers to ignore the descriptive `aria-label` (e.g., "Feet"), instead repeating the group label.
**Action:** Remove `aria-labelledby` from internal controls of a `fieldset` if they have specific `aria-label` attributes to ensure specific labels are announced.

## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-05-15 - Weather Status Accessibility
**Learning:** Weather summary widgets that rely solely on icon graphics fail screen readers because icon components lack condition text description. Adding visible condition text, `aria-hidden="true"` on decorative icons, and an informative `aria-label` on the region container ensures both sighted users and screen reader users receive full weather context.
**Action:** Always pair status icons with accessible text and container `aria-label` attributes describing weather conditions and metrics.

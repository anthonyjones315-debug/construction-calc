## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Landmark Roles for Promotional Banners
**Learning:** Using `role="banner"` on promotional or install popups creates duplicate `banner` landmarks that conflict with the primary site `<header>` landmark for screen reader users. Using `<aside>` or `role="region"` with a descriptive `aria-label` provides clean landmark hierarchy and navigation.
**Action:** Use `<aside aria-label="...">` for floating banners or notification popups rather than `role="banner"`.

## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-05-22 - Standardized Geolocation UX
**Learning:** Geolocation requests can be slow or fail silently, leaving the user wondering if their click was registered. Standardizing a visible loading state (spinning icon), disabling the button during fetch to prevent duplicates, and adding explicit ARIA attributes (`aria-label`, `aria-busy`) makes the "Use Current Location" feature significantly more robust and accessible.
**Action:** Always implement `isFetchingLocation` state management with `finally` blocks for geolocation handlers to ensure the UI correctly resets regardless of the outcome.

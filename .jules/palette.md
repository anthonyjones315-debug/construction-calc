## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Standardized Geolocation UX & Feature Parity
**Learning:** The "Use Current Location" feature was duplicated across multiple calculator views (public vs. authenticated) with inconsistent UX. Standardizing with `Loader2` (for visual feedback) and `aria-label`/`aria-busy` (for accessibility) ensures a predictable and inclusive experience regardless of the user's entry point.
**Action:** When improving a component used in one view, always audit for duplicates (e.g., public vs. CommandCenter versions) to maintain system-wide parity.

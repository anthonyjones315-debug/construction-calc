## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-05-06 - Async Feedback for Geolocation
**Learning:** Icon-only buttons that trigger long-running asynchronous processes (like geolocation and reverse geocoding) can leave users wondering if their click was registered. Swapping the icon for a spinner, disabling the button, and adding `aria-busy` provides immediate, accessible feedback.
**Action:** Always implement a loading state for async UI triggers, especially for location-based services that depend on external APIs or device permissions.

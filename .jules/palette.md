## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Dynamic ARIA for Async Operations
**Learning:** For icon-only buttons that trigger asynchronous operations (like geolocation), providing a static aria-label is insufficient. Using a dynamic aria-label that reflects the current state (e.g., "Fetching location...") combined with aria-busy ensures screen reader users are aware of the ongoing process and subsequent result.
**Action:** Always implement dynamic aria-label and aria-busy for buttons with asynchronous side effects.

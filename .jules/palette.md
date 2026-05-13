## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-05-13 - Standardizing 'Use Current Location' Feedback
**Learning:** Asynchronous actions like geolocation can leave users uncertain if a click was registered. Providing a loading state (spinner) and disabling the button prevents multiple clicks and provides immediate feedback. Standardizing this across components with ARIA labels (`aria-label`, `aria-busy`) ensures the experience is both delightful and accessible.
**Action:** Always implement a loading state and appropriate ARIA attributes for "Use Current Location" buttons or similar asynchronous UI triggers.

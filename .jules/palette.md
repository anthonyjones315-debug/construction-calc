## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Standardized Geolocation Loading State
**Learning:** Geolocation and reverse-geocoding often take 1-3 seconds, leading to a "dead" UI state if feedback isn't provided. Centralizing this logic into a reusable hook ensures all location-based buttons consistently provide a loading spinner, disable interaction to prevent race conditions, and include proper ARIA attributes for screen readers.
**Action:** Use the centralized `useGeolocation` hook for any "Use Current Location" feature to ensure consistent UX and accessibility (spinner, disabled state, aria-busy).

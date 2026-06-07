## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-06-07 - Standardized Geolocation Loading States
**Learning:** Asynchronous geolocation and reverse-geocoding (Nominatim) can take several seconds, leaving users wondering if the "Use Current Location" button worked. Providing a loading spinner, disabling the button, and using `aria-busy` improves perceived performance and accessibility.
**Action:** Always use the centralized `useGeolocation` hook for location-based features to ensure consistent loading feedback and error handling across the app.

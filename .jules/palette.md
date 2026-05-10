## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-14 - Loading Feedback for Geolocation Actions
**Learning:** Asynchronous actions that rely on external APIs (like Geolocation or Reverse Geocoding) can have unpredictable latency. Without a visual loading state, users may trigger multiple redundant requests or assume the interface is unresponsive. Standardizing a "Fetching" state with a spinning icon and disabled button improves both perceived performance and accessibility.
**Action:** Always implement a visible loading state (e.g., `Loader2` spin) and disable the trigger button during asynchronous location or coordinate fetching.

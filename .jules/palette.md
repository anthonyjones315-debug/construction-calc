## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-14 - Accessible Labeling for Web Components with Shadow DOM
**Learning:** For Web Components like `google.maps.places.PlaceAutocompleteElement`, standard `<label htmlFor="...">` association fails because the actual input is encapsulated in the Shadow DOM. Manually assigning an `id` to the custom element instance allows some assistive technologies to bridge the gap, and providing an `id` prop for consumers ensures consistency across the app.
**Action:** Always provide an `id` prop for wrapper components around Web Components and ensure it is passed down to the underlying element.

## 2025-05-15 - [Accessibility: Fieldset for multi-input groups]
**Learning:** Using a wrapping `<label>` for a group of interactive elements (like feet, inches, and fractions) is invalid HTML and fails screen reader announcement of the group context. Switching to `<fieldset>` and `<legend>` provides the correct semantic container for related form controls.
**Action:** Always use `<fieldset>` and `<legend>` instead of a top-level `<label>` when a custom component encapsulates multiple inputs that together form a single logical value.

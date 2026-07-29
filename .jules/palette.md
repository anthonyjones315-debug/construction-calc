## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-17 - Granular A11y & Focus Preservation in Composite Inputs
**Learning:** Over-applying `aria-labelledby` on internal child elements of a `<fieldset>` overrides descriptive individual `aria-label` properties in many screen readers. Additionally, standard single controls should use a `<label>` to preserve native click-to-focus, whereas composite fields should dynamically switch to `<fieldset>` and `<legend>`.
**Action:** Use `<label>` with `htmlFor` for simple inputs, and use `<fieldset>` with `<legend>` for composite inputs. On child inputs inside a `<fieldset>`, omit `aria-labelledby` when descriptive `aria-label`s are used to preserve screen-reader reading order.

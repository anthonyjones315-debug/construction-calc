## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Enhancing Click Targets for Composite Inputs
**Learning:** While `<fieldset>` and `<legend>` provide semantic grouping, they don't natively support click-to-focus for internal inputs. Nesting a `<label htmlFor={id}>` inside the `<legend>` allows the entire header area to function as a large click target for the primary input, maintaining the intuitive UX of standard labels while respecting accessibility boundaries.
**Action:** Always nest a `<label>` with the primary input's ID inside a `<legend>` when refactoring composite inputs for accessibility.

## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-20 - Large Click Target Pattern for Compound Components
**Learning:** Implementing the 'Large Click Target' pattern (making labels/legends clickable to focus inputs) requires careful handling of HTML nesting to maintain validity and accessibility. In `ProInput`, which can be a single input or a compound one with a select, nesting a `<label>` inside another `<label>` is an accessibility violation.
**Action:** Dynamically switch between rendering a `<label>` and a `<fieldset>`/`<legend>` based on the component's state. When the container is a `<label>`, the header should be a `<span>`. When it's a `<fieldset>`, the `<legend>` should contain a `<label>` pointing to the primary input.

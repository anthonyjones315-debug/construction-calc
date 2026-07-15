## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2025-05-15 - Balancing Semantic Grouping and Native Focus Behavior
**Learning:** While `<fieldset>` is correct for composite inputs, applying it to components that usually contain a single primary input (like `ProInput`) can break the native "click label to focus" behavior and visual focus rings.
**Action:** For single-input components with complex labels, use a `<div>` wrapper and a standard `<label htmlFor={id}>`. Use `aria-describedby` for sub-labels and help text to maintain accessibility without sacrificing native interaction patterns. Reserve `<fieldset>` for true multi-input groups.

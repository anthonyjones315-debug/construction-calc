## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Glass Modal Dialog Semantics & Backdrop Interactions
**Learning:** Glass overlay modals in this design system must explicitly include `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linked to the modal title ID, along with backdrop click dismissal checking `e.target === e.currentTarget` and focus-visible ring styles on close controls to ensure full keyboard and screen reader accessibility.
**Action:** Always include dialog ARIA attributes, title ID association, overlay click dismissal, and focus-visible close button styling when creating or enhancing glass overlay modals.

## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-18 - Keyboard Reveal for Hover-Only Interactive Elements
**Learning:** Interactive controls that hide using `opacity-0` and rely on `group-hover:opacity-100` remain invisible when focused via keyboard navigation. Pairing `focus-visible:opacity-100` with explicit `focus-visible:ring-2` styles ensures that keyboard users can discover, focus, and operate hover-only interactive controls (such as drag handles or card quick actions).
**Action:** Always add `focus-visible:opacity-100` alongside focus rings to interactive controls that use hover-based opacity hiding.

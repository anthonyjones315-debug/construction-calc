## 2025-05-14 - Accessibility Grouping for Composite Inputs
**Learning:** Wrapping multiple interactive controls (like feet, inches, and fractions) in a single `<label>` is an accessibility violation and confusing for screen readers. Using `<fieldset>` with a `<legend>` provides the correct semantic grouping and allows the group description to be announced properly for each internal control.
**Action:** Use `<fieldset>` and `<legend>` for any form component that combines multiple related inputs into a single logical field.

## 2026-03-17 - Coexistence of Security Sanitization and Dynamic Layout Components in Templates
**Learning:** Refactoring or optimizing dynamically generated layouts (such as PDF estimate/invoice templates) can accidentally prune nested visual nodes (like "materials list") if code merges/rewrites are not carefully audited. Security escaping (e.g., XSS prevention via `escapeHtml`) and critical UX sections (e.g., Materials Needed list) must coexist.
**Action:** Always verify that layout components are preserved, fully escaped with `escapeHtml`, and assertively verified in automated unit tests.

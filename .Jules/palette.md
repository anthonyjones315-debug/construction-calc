## 2026-03-18 - [Job Weather Widget Accessibility & Landmarks]
**Learning:** Weather widgets in CRM dashboards require proper landmark regions (`<section aria-label="...">`) and explicit ARIA status/alert roles for async state changes (loading/error) so screen readers can gracefully navigate job site details.
**Action:** When creating or editing weather widgets or asynchronous dashboard widgets, always wrap loading skeletons in `role="status"`, error containers in `role="alert"`, and decorative icons with `aria-hidden="true"`.

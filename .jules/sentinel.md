## 2026-03-17 - HTML escaping for PDF and Email templates
**Vulnerability:** User-controlled strings were being interpolated directly into HTML templates for PDF generation and email sending, leading to potential XSS vulnerabilities.
**Learning:** Even internal templates that are not rendered in the browser directly (like PDF generators) are vulnerable if they use browser engines (like Browserless.io) to render.
**Prevention:** Always use a shared `escapeHtml` utility for all user-provided data in HTML templates.

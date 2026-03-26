## 2025-05-15 - [XSS in PDF Templates]
**Vulnerability:** User-provided fields (client names, job addresses, contractor details) were interpolated directly into HTML templates used for PDF generation without escaping.
**Learning:** Even internal templates (like those used for PDF generation) can be XSS vectors if they handle user-controlled data and are rendered by a browser-like engine (e.g., Browserless.io). Redundant, inconsistent local `escapeHtml` implementations also led to incomplete protection.
**Prevention:** Use a centralized, robust `escapeHtml` utility that handles `null`/`undefined` and all special characters (`&`, `<`, `>`, `"`, `'`). Always escape all user-controlled strings in HTML templates.

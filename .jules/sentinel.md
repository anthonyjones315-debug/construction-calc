## 2025-05-15 - [XSS vulnerability in HTML templates]
**Vulnerability:** User-controlled strings (contractor/client names, addresses, notes) were interpolated directly into HTML templates for PDF generation and email notifications without sanitization.
**Learning:** Fragmented, local `escapeHtml` implementations across the codebase were inconsistent and incomplete, leading to some areas being entirely unprotected.
**Prevention:** Centralize HTML escaping into a single utility (`src/utils/html.ts`) and mandate its use for all user-controlled data in HTML templates.

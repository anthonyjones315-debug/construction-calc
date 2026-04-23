## 2025-05-15 - Centralized HTML Escaping for XSS Mitigation
**Vulnerability:** Widespread missing or inconsistent HTML sanitization in user-controllable fields used for generating invoices (PDF) and notification emails.
**Learning:** ad-hoc escaping logic in API routes was inconsistent (some escaped quotes, some didn't) and completely missing in the complex HTML template used for PDF generation. User data like contractor names, client names, and job notes were directly injected into HTML strings.
**Prevention:** Always use the centralized `escapeHtml` utility from `@/utils/html` for any user-provided data being rendered into HTML templates or email bodies. Standardize on escaping `&`, `<`, `>`, `"`, and `'`.

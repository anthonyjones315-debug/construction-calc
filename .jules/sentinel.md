## 2025-04-15 - [Centralized HTML Escaping]
**Vulnerability:** Cross-Site Scripting (XSS) in PDF and email templates due to unescaped user-controlled fields.
**Learning:** Multiple templates (estimates, feedback, invoice) were independently and inconsistently implementing or omitting HTML escaping. Centralizing this logic into a robust utility ensures consistent protection across the entire application.
**Prevention:** Always use the centralized `escapeHtml` utility from `src/utils/html.ts` when interpolating user-provided data into HTML strings. Apply formatting (like currency or numbers) *before* escaping to maintain UI consistency while staying secure.

## 2025-05-14 - [security improvement] Centralized HTML Escaping
**Vulnerability:** Cross-Site Scripting (XSS) via unsanitized user input in HTML templates (invoices, emails).
**Learning:** Redundant local implementations of `escapeHtml` were inconsistent (some missed `'`, others missed `&`) and many templates lacked escaping entirely for high-risk fields like contractor names, client addresses, and line item descriptions.
**Prevention:** Centralize all HTML escaping logic in `src/utils/html.ts` and ensure it is applied to ALL user-provided data before interpolation into HTML strings.

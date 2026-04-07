## 2025-03-14 - Centralized HTML Escaping
**Vulnerability:** XSS in HTML templates (emails and PDF reports) due to inconsistent or missing escaping of user-controlled data.
**Learning:** Internal templates and emails are major XSS vectors even if they aren't directly user-rendered in the main app. Attributes like `src` on `<img>` are particularly dangerous as they allow attribute-based XSS if not escaped.
**Prevention:** Always use the centralized `escapeHtml` utility from `src/utils/html.ts`. Apply it to all user-controlled strings before interpolation. For URLs in attributes, ensure they are also escaped.

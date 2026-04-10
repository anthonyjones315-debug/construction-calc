## 2025-05-14 - Robust HTML Escaping and Attribute Security
**Vulnerability:** XSS in PDF templates via unsanitized user data in both text nodes and HTML attributes (e.g., `img src`).
**Learning:** Internal templates rendered via browser engines (like Browserless.io) are equally susceptible to XSS. Escaping must cover text nodes AND attributes to prevent common bypasses (e.g., `"><script>`).
**Prevention:** Use a centralized `escapeHtml` utility that handles `&`, `<`, `>`, `"`, and `'`. Ensure the utility is type-safe (handles null/undefined) and consistently applied to all user-controlled data in templates.

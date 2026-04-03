## 2025-05-22 - Centralized HTML Escaping for XSS Prevention
**Vulnerability:** XSS risks in PDF and email generation due to unsanitized user-controlled strings (client names, addresses, job names, quote notes) being interpolated directly into HTML templates.
**Learning:** Browser-based rendering engines (like Browserless.io) used for PDF generation are susceptible to attribute-based and script-injection XSS if data is not escaped, even if the final output is not a live website. Single quotes must be escaped as `&#39;` to prevent attribute breakout.
**Prevention:** Use a centralized `escapeHtml` utility for all data interpolation in HTML templates. Ensure formatting logic (e.g., currency, numbers) is applied before escaping to preserve UI appearance.

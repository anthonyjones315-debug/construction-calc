## 2025-05-22 - [XSS in Internal PDF Templates]
**Vulnerability:** User-controlled data (names, addresses, job titles, and notes) was interpolated directly into HTML templates for PDF generation without escaping.
**Learning:** Internal templates rendered via browser engines (like Browserless.io) are just as susceptible to XSS as client-facing ones, especially if they are used to generate documents that might be viewed in a web browser.
**Prevention:** Always escape user-controlled strings before interpolation into HTML templates, even if the final output is a PDF. Use a centralized `escapeHtml` utility to ensure consistency and robustness (e.g., handling null/undefined).

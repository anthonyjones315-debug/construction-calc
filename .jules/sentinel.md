# Sentinel's Journal - Critical Security Learnings

## 2025-05-14 - [XSS in PDF Templates]
**Vulnerability:** User-controlled strings were directly interpolated into an HTML template used for PDF generation without sanitization.
**Learning:** Even if the HTML is rendered by a server-side browser (like Browserless.io) and returned as a PDF, it is still susceptible to XSS. If a malicious script is executed during the PDF generation phase, it could potentially access sensitive information or environment variables in the rendering context.
**Prevention:** Always escape user-provided data using a centralized, robust `escapeHtml` utility before interpolating it into any HTML template, regardless of how or where that HTML is rendered.

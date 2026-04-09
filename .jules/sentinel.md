## 2025-05-14 - XSS in PDF and Email Templates
**Vulnerability:** User-controlled data was interpolated directly into HTML strings for PDF generation (via Browserless.io) and email notifications (via Resend) without consistent or robust escaping.
**Learning:** Even if the final output is not rendered in a standard browser (e.g., a PDF), XSS is still a risk during the rendering process, and emails are particularly vulnerable to XSS and phishing if unsanitized data is included. Local `escapeHtml` implementations often miss cases like single quotes.
**Prevention:** Always use a centralized, robust `escapeHtml` utility for any HTML interpolation. Apply escaping to all user-controlled strings, including labels, names, and addresses.

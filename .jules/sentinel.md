## 2025-05-15 - XSS in PDF Generation Templates
**Vulnerability:** User-controlled data was interpolated directly into raw HTML strings used for PDF generation via Browserless.io.
**Learning:** Internal templates rendered by browser engines are just as susceptible to XSS as client-facing web pages. Even if the output is a "static" PDF, an attacker can inject `<script>` tags or malicious attributes if the engine executes JavaScript or renders complex HTML.
**Prevention:** Always use a centralized `escapeHtml` utility or a templating engine with auto-escaping for any HTML generation, including those used for PDFs or emails.

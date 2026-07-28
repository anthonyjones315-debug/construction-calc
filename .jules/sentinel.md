# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML Template Injection and XSS via Unescaped Headless PDF Templates
**Vulnerability:** The HTML template generator (`generateInvoiceHtml`) interpolated raw user-provided data directly into string-based HTML outputs. This exposed the rendering pipeline to Cross-Site Scripting (XSS) and HTML injection through client-supplied metadata, quote notes, and image URLs.
**Learning:** Headless renderers (like Browserless.io or Puppeteer) rendering unescaped HTML are highly dangerous, as XSS inside these privileged headless contexts can leak internal service metadata or read local system/file resources.
**Prevention:** Implement a robust `escapeHtml(value: unknown)` helper in all template generators, and sanitize image or source URLs (`sanitizeUrl`) to strictly allow safe protocols (`data:image/`, `http://`, and `https://`) while blocking malicious protocols like `javascript:`.

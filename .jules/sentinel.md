# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-05-02 - Server-Side PDF Generation HTML Injection and XSS Prevention
**Vulnerability:** User-controlled values (client names, project names, and line items) were rendered raw in an HTML document passed to a headless Chrome service (Browserless) for PDF rendering.
**Learning:** Raw string interpolation of dynamic inputs in server-side generated HTML templates is a major security risk when rendered in a headless browser, potentially allowing local file reading, internal network scanning, or arbitrary JavaScript execution.
**Prevention:** Strictly escape all dynamic user inputs using a custom robust `escapeHtml` helper, restrict logo and signature URLs to verified secure protocols (`https://`, `http://`, or `data:image/`), and pass the sanitized URLs through HTML escaping when rendering attributes to prevent attribute breakouts.

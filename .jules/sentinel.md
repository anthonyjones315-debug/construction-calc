# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML Injection and XSS in HTML-to-PDF Template Generation
**Vulnerability:** Dynamically generated HTML templates (e.g., invoices/estimates) were directly interpolating user-controlled parameters like client names, job site addresses, and contact numbers without escaping.
**Learning:** Raw string interpolation of external input inside HTML documents created server-side bypasses default React XSS protections (like JSX auto-escaping), making the app vulnerable to malicious markup or scripts when rendered in Browserless/headless browsers.
**Prevention:** Always sanitize/escape all text parameters with a robust `escapeHtml` utility and validate/sanitize URL parameters to only allow safe schemes (`data:image/`, `http://`, `https://`) before interpolating them into server-side HTML templates.

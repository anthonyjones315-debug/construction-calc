# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML Injection and XSS in PDF Template Generation
**Vulnerability:** User-controlled string fields (contractor name, client details, job address) and image URLs (logo, signatures) were directly interpolated into raw HTML template literals utilized by a server-side PDF generator (Browserless/Puppeteer). This allowed arbitrary HTML injection, potentially leading to client-side XSS or server-side request forgery (SSRF).
**Learning:** Raw HTML interpolation of user inputs is extremely risky, especially when parsed by server-side headless browsers, which may execute javascript or fetch local system files.
**Prevention:** Implement strict HTML escaping (`escapeHtml`) for all dynamic text parameters and strictly white-list safe URL schemes (`data:image/`, `http://`, `https://`) for image sources before generating raw HTML templates.

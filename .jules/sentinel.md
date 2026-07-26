# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML and XSS Injection in PDF Template Generation
**Vulnerability:** The PDF invoice template generator failed to escape user-controlled text parameters (e.g. contractor details, client info, line items, and notes) and accepted raw URLs for logo/signature images.
**Learning:** Raw string interpolation in HTML generation passed directly to browserless services results in HTML and cross-site scripting (XSS) execution risk within the PDF context.
**Prevention:** Implement a robust HTML escaping helper for all dynamic text parameters, sanitize image and signature source URLs to trust only safe schemas (`data:image/`, `http://`, `https://`), and rigorously verify PDF generation output via unit tests.

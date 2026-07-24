# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML/XSS Injection in PDF Template Generation
**Vulnerability:** The PDF invoice template generator (`generateInvoiceHtml`) interpolated raw, unsanitized user inputs (such as business names, client names, and project addresses) and raw image URLs directly into template literals.
**Learning:** Rendering arbitrary strings inside dynamic HTML templates processed by headless browsers or rendering engines exposes the application to Cross-Site Scripting (XSS), HTML injection, and malicious URL protocols (e.g. `javascript:` URI execution).
**Prevention:** Always escape user-controlled text using a strict HTML escaping function before rendering. Restrict resource URLs (like logos and signatures) to safe protocols (`data:image/`, `http://`, `https://`).

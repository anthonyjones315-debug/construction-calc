# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML/XSS Injection in Document PDF Generation
**Vulnerability:** Dynamically generated HTML strings for PDF rendering accepted raw user-controlled string inputs without escaping special characters, and loaded unsanitized contractor logo/signature URLs.
**Learning:** Rendering user-controlled inputs within string templates without escaping allows for arbitrary HTML and CSS injection, and unsanitized image URLs are susceptible to `javascript:` scheme execution.
**Prevention:** Always filter dynamic text parameters with a robust HTML escaping helper and strictly restrict image sources to approved protocol schemes (`data:image/`, `http://`, `https://`) before embedding them as attributes.

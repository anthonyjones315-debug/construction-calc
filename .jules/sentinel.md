# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-05-02 - Robust HTML Escaping Prevents TypeErrors and Denial of Service
**Vulnerability:** Unescaped template variables in PDF generation led to XSS/HTML Injection, but directly applying `escapeHtml` to optional/nullable fields led to TypeErrors and application crashes.
**Learning:** Applying string-replacement helpers like `.replace()` directly on untrusted payload attributes risks crashing the service with `TypeError` if they are optional or undefined, introducing a Denial of Service risk.
**Prevention:** Hardened `escapeHtml` helper to dynamically check inputs and safely default/covert non-string/undefined types before string-replacement operations.

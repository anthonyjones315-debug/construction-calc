# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - HTML Injection in PDF Generation
**Vulnerability:** User-provided data (e.g., client names, addresses, contractor info) was directly interpolated into HTML strings for PDF generation without escaping, creating a potential XSS vector.
**Learning:** Even internal HTML generation (like for PDF export) must be treated as untrusted if it includes user input. Local `escapeHtml` implementations were inconsistent and sometimes incomplete.
**Prevention:** Centralize security-critical logic like HTML escaping in a shared utility. Use a robust implementation that covers all common special characters (`&`, `<`, `>`, `"`, `'`) and apply it consistently to all user-provided data before HTML interpolation.

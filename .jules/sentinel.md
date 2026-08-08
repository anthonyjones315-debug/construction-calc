# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-20 - Arbitrary File Extension and XSS in Template Interpolation
**Vulnerability:** Business logo upload parsed user-controlled filenames (`file.name`) to determine target file extensions, leaving it susceptible to path traversal/spoofing. Separately, rendering `material_list` inside hidden template elements without HTML escaping created HTML injection and XSS risks.
**Learning:** Never trust client-provided file names or raw string arrays in HTML template rendering. Trusting user-controlled extensions can lead to remote code execution/asset manipulation, and omitting escaping on hidden elements is just as dangerous as on visible ones.
**Prevention:** Map MIME types (`file.type`) directly to a strict whitelist of extensions (`TYPE_TO_EXT`) on the server. Always pass dynamic text fields/arrays through a robust HTML-escaping function before rendering in any HTML template string.

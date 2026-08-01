# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-05-02 - HTML Injection and XSS in Dynamic HTML-to-PDF Templates
**Vulnerability:** Dynamic user input and URLs (such as client/contractor details and signature image sources) were interpolated directly into raw HTML template strings used for PDF generation.
**Learning:** Unescaped input inside HTML templates enables arbitrary HTML injection and potential server-side cross-site scripting (SSXSS) / protocol exploitation (e.g., via `javascript:` scheme).
**Prevention:** Always escape user-controlled text using a robust `escapeHtml` utility and restrict protocol/scheme handlers in dynamic URL/image sources to secure schemes (`data:image/`, `http://`, `https://`).

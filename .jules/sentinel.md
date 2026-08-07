# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML/XSS Injection & Attribute Breakout in PDF Templates
**Vulnerability:** The HTML template generator rendered raw contractor and client inputs using string interpolation without escaping, which exposed the app to HTML injection and cross-site scripting (XSS). Additionally, image source parameters were vulnerable to attribute breakouts even when standard protocol checks were applied.
**Learning:** Checking for safe URL protocols (e.g., `https:` or `data:`) is insufficient if the output is directly interpolated into double-quoted attributes (e.g., `<img src="${url}" />`). An attacker can supply a malicious payload containing double quotes (such as `https://example.com/logo.png" onload="alert(1)`) to breakout of the attribute.
**Prevention:** Always HTML-escape sanitized URLs before interpolating them inside HTML attributes. Utilize a strict protocol validation utility paired with robust HTML character escaping for all dynamic inputs.

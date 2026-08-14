# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML/XSS Injection in Server-Side HTML PDF Templates
**Vulnerability:** The HTML generator for PDF estimates/invoices built documents via string interpolation/template literals using user-controlled properties without escaping or protocol sanitization, allowing arbitrary HTML and Javascript payload injection.
**Learning:** Server-side templating without dedicated template engines often leads to developer over-reliance on standard string interpolation, bypassing automatic escaping mechanisms.
**Prevention:** Always escape standard HTML control characters (&, <, >, ", ') when dynamically rendering strings inside templates, validate and sanitize source URLs to prevent javascript: or breakout payload injection, and verify escaping behavior via targeted unit tests.

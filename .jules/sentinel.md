# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-20 - Unauthenticated Access to Paid External APIs
**Vulnerability:** The `/api/weather` endpoint was accessible without authentication and lacked rate limiting, allowing unauthorized users to consume the project's Google Maps API quota.
**Learning:** Internal utility endpoints that proxy paid external APIs are high-value targets for abuse. Relying on "security by obscurity" for internal-only routes is insufficient.
**Prevention:** Always enforce session-based authentication and IP-based rate limiting on any endpoint that calls a paid external API or performs resource-intensive operations.

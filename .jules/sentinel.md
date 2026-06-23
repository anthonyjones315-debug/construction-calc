# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-06-23 - Unprotected Weather API and Google Maps Credit Exhaustion
**Vulnerability:** The `/api/weather` endpoint lacked both authentication and rate limiting, allowing public access to geocoding services.
**Learning:** API routes that consume paid third-party services (like Google Maps) are high-value targets for abuse. Relying on client-side protection alone is insufficient for securing expensive backend operations.
**Prevention:** Always implement server-side `auth()` checks and IP-based rate limiting on any API route that triggers downstream paid API calls.

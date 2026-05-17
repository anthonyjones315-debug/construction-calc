# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-05-17 - Unprotected Paid API Endpoint
**Vulnerability:** The `/api/weather` endpoint was publicly accessible and consumed the Google Maps Geocoding API without authentication or rate limiting.
**Learning:** Public endpoints wrapping paid external APIs are high-value targets for quota exhaustion and unauthorized use. Next.js static generation requires explicit error propagation for `auth()` calls to prevent insecure response caching.
**Prevention:** Always implement authentication and rate limiting on endpoints that proxy paid services. Use a centralized utility to handle Next.js prerender bail-out errors by re-throwing them in route handlers.

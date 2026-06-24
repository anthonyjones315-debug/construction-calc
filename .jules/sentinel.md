# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Unprotected sensitive API endpoints
**Vulnerability:** Several API endpoints (e.g., `/api/weather`, `/api/crm/contacts`, `/api/ai/optimize`) were found to lack Clerk `auth()` or rate limiting, despite internal documentation or memory suggesting they were secured.
**Learning:** Inconsistency in security gate application across API routes can lead to unauthorized data access or resource exhaustion (e.g., Google Maps API costs).
**Prevention:** Audit all routes in `src/app/api/` for `auth()` and rate limiting. Standardize on a "fail-closed" pattern where authentication is the first check in every handler.

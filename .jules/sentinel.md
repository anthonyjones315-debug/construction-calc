# Sentinel Journal

## 2026-03-14 - Database and System Driver Information Leakage
**Vulnerability:** Internal database errors and connection failure stack traces were being returned in API responses (such as `/api/estimates/[id]/regen-share` and `/api/estimates/finalize`), exposing internal DB details to clients.
**Learning:** Returning un-sanitized thrown `Error` objects directly to clients can leak critical infrastructure, schema design, and driver specifics.
**Prevention:** Always intercept database/system errors, forward the raw stack/details to Sentry or internal logs, and return a safe, generic `"Internal Server Error"` response to the client.

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

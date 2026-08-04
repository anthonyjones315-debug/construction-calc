# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - API Information Leakage via Raw Database Errors
**Vulnerability:** The save and finalize estimate API routes would return raw database driver error messages and the Supabase project URL to the frontend during insert/update failures.
**Learning:** Directly returning `error.message` in JSON API responses during server-side errors leaks table structures, constraint failures, and internal database internals. This exposes critical backend architecture to unauthorized clients.
**Prevention:** Always capture the raw driver error in Sentry and backend console logging. Return a generic "Internal Server Error" or custom user-facing message along with a tracking UUID (`requestId`) for client diagnostics.

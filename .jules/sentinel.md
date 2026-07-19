# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-18 - Database Schema and Information Leakage via Raw Error Messages
**Vulnerability:** API routes like `signed-since`, `clients`, and `clients/sync` returned raw database exception messages directly to the client when a query failed.
**Learning:** Exposing raw error messages (`error.message`) from database drivers or clients (like Supabase) leaks table names, column structures, and constraint names. This information makes planning injection or other database-level exploits significantly easier.
**Prevention:** Always catch database and query-level exceptions, log them securely internally (e.g., via Sentry), and return generic, non-informative "Internal Server Error" messages to the client.

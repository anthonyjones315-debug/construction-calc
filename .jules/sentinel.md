# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-16 - Next.js Prerendering and API Authentication
**Vulnerability:** API routes using `auth()` or accessing headers could be incorrectly prerendered during build time, potentially baking in an "Unauthorized" response or causing build failures.
**Learning:** Next.js attempts to statically optimize routes. If a route uses dynamic functions like `headers()` (via `auth()`), it must be explicitly marked as dynamic to ensure correct behavior and prevent the accidental static generation of error states.
**Prevention:** Always use `export const dynamic = 'force-dynamic'` in API routes that perform authentication or use request-specific data like IP addresses for rate limiting.

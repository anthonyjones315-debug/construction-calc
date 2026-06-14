# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-16 - Information Leakage and Authentication Gaps in Utility APIs
**Vulnerability:** The `/api/weather` endpoint was publicly accessible and leaked raw exception messages (e.g., `error.message`) to users.
**Learning:** Utility endpoints, even those not directly handling PII, can incur costs (API quotas) and leak stack traces or internal implementation details if not properly guarded.
**Prevention:** Ensure all internal utility APIs are wrapped in `auth()` checks and return generic error messages. Use `force-dynamic` to ensure auth cookies are evaluated.

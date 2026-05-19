# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Next.js Prerendering and Auth Security
**Vulnerability:** Unauthenticated API endpoints calling paid external services (Google Maps) could lead to budget exhaustion. Hardening them with `auth()` requires special care for prerendering.
**Learning:** In Next.js, functions like `auth()` or `headers()` can throw errors during static generation (prerendering). If these are caught and not re-thrown, the route might be incorrectly cached as a success or failure, or potentially leak data.
**Prevention:** Implement an `isPrerenderError` check in catch blocks to re-throw specific Next.js/Clerk errors, ensuring the route correctly bails out of prerendering and is treated as dynamic.

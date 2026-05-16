# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-16 - Improper Prerender Error Handling in Authenticated Routes
**Vulnerability:** Returning a `401 Unauthorized` response when Next.js fails to access `headers()` or `auth()` during static prerendering.
**Learning:** In Next.js, certain errors during prerendering are signals to bail out of static generation and switch to dynamic rendering. Swallowing these and returning a 401 response can cause the build to cache an unauthorized state for all users.
**Prevention:** Always re-throw errors identified as prerender header access errors to allow Next.js to handle them appropriately.

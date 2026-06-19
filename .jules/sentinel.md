# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Missing API Authentication in the Absence of Global Middleware
**Vulnerability:** Several sensitive API endpoints (e.g., `/api/weather`, `/api/crm/contacts`) lacked explicit `auth()` checks, making them publicly accessible.
**Learning:** In projects without a centralized `middleware.ts` to enforce authentication, every route handler must manually verify the session. Security relies on developer discipline rather than infrastructure-level enforcement.
**Prevention:** Audit all `src/app/api/**/route.ts` files for `auth()` checks. Consider implementing a global middleware or a higher-order function to wrap route handlers with mandatory authentication.

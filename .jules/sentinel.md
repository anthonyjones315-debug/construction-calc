# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Denial of Wallet via Public API Endpoints
**Vulnerability:** Publicly accessible API endpoints (like `/api/weather`) that utilize paid external services (Google Maps API) without authentication or rate limiting.
**Learning:** Architectural oversight allowed public access to endpoints consuming billable resources, creating a risk of financial exhaustion (Denial of Wallet) via automated abuse.
**Prevention:** Always require authentication for endpoints that consume external paid resources, and implement rate limiting as a defense-in-depth measure to protect operational budgets.

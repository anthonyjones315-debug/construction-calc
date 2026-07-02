# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-07-02 - Missing Authentication on AI Proxy Endpoints
**Vulnerability:** The `/api/ai/optimize` endpoint was protected only by IP-based rate limiting, lacking an explicit authentication check.
**Learning:** Publicly accessible endpoints that proxy expensive external AI services (like Anthropic) pose both a financial and DDoS risk even with rate limiting. Relying solely on IP-based limiting is insufficient in distributed or serverless environments.
**Prevention:** Always verify the user's session using `auth()` before processing requests to resource-heavy or third-party API proxies. Place rate limiting before authentication to provide defense-in-depth against unauthenticated abuse.

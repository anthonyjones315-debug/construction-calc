# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - AI Credit Exploitation via Unauthenticated Optimization Route
**Vulnerability:** The AI optimization API (`/api/ai/optimize`) lacked session authentication, user-specific rate limiting, and parameter validation. An anonymous attacker could spam the endpoint, consuming expensive AI credits.
**Learning:** External integrations that incur direct financial costs (such as Anthropic Claude API calls) must never be exposed publicly without session checks, strict parameter constraints, and strong user-based rate limits.
**Prevention:** Authenticate all AI routes with `auth()`, enforce structural payload checks with Zod schemas, and track rate limits by session user ID rather than client IP.

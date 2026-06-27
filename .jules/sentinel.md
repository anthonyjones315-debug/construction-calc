# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Unauthenticated AI Credit Consumption
**Vulnerability:** The `/api/ai/optimize` endpoint was publicly accessible, allowing anyone to trigger LLM calls and consume Anthropic credits.
**Learning:** Security gates like rate limiting were implemented, but fundamental authentication was overlooked, likely due to a focus on functional testing over resource protection.
**Prevention:** Audit all API routes that call third-party paid services (AI, Geocoding) to ensure they are protected by `auth()` before processing.

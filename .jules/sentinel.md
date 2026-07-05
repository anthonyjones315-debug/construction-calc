# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Paid API Proxy Exposure and Falsy Coordinate Handling
**Vulnerability:** The `/api/weather` endpoint was public, allowing unauthorized access to the paid Google Maps Geocoding API. Additionally, it used truthiness checks on coordinate parameters, which would fail for valid `0` values.
**Learning:** Publicly exposing endpoints that proxy paid external APIs creates a significant cost/abuse risk. Input validation for coordinates must explicitly check for `undefined` or `null` to avoid breaking for valid `0` values.
**Prevention:** Always wrap paid API proxies with authentication and rate limiting. Use strict Zod validation and explicit nullish checks for numeric inputs.

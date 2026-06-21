# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-15 - Unauthenticated and Unthrottled API Credit Consumption
**Vulnerability:** The `/api/weather` endpoint lacked both authentication and rate limiting, allowing anonymous users to consume Google Maps Geocoding and Open-Meteo API credits.
**Learning:** Utility endpoints used within authenticated dashboard areas are sometimes overlooked for security checks if they aren't directly accessing sensitive user data, but they still represent a financial/DoS risk if they consume paid third-party resources.
**Prevention:** Standardize security checks for all internal API routes. Implement `auth()` and rate limiting by default for any endpoint that interacts with paid services or expensive computations.

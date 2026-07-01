# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2025-05-22 - DDoS Resilience Pattern for API Routes
**Vulnerability:** API routes checking authentication before rate limiting can be exploited to cause high load on authentication services (e.g., Clerk) or databases.
**Learning:** Placing rate limiting checks *before* authentication checks provides better DDoS resilience by rejecting excessive traffic at the edge of the handler logic.
**Prevention:** Standardize the security gate order in all API routes: 1. Rate Limit (IP-based), 2. Authentication (Session check).

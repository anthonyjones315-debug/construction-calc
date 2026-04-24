## 2025-05-15 - [Documenso Webhook Fail-Open and Timing Attack]
**Vulnerability:** The Documenso webhook receiver skipped signature verification if the secret was not configured (fail-open) and used non-constant time comparison for the signature.
**Learning:** Defensive checks should always fail-closed. Environment variables for secrets might be missing in some environments, and signature verification should never be optional for sensitive endpoints.
**Prevention:** Always verify that secrets are present before proceeding with authenticated logic. Use `crypto.timingSafeEqual` for all HMAC/signature comparisons.

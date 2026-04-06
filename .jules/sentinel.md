## 2025-05-19 - Webhook Signature Timing Attack Fix
**Vulnerability:** Standard string comparison (`!==`) for HMAC signatures in webhooks allows timing attacks to guess the signature byte-by-byte.
**Learning:** Even internal webhooks are susceptible if they use unsanitized comparison; Node.js `crypto.timingSafeEqual` is the standard defense but requires manual buffer length checks to avoid runtime errors.
**Prevention:** Always use `crypto.timingSafeEqual` with a preceding length check for any sensitive token or signature comparison.

## 2026-04-11 - Webhook Signature Timing Attack
**Vulnerability:** Direct string comparison (`!==`) was used for webhook signature verification.
**Learning:** Webhook signature verification is susceptible to timing attacks if direct string comparison is used, as it returns early upon finding the first mismatching character.
**Prevention:** Always use `crypto.timingSafeEqual` with fixed-length buffers for signature verification. Ensure to handle potential null/undefined values for headers to avoid TypeErrors when creating buffers.

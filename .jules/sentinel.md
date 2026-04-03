## 2025-05-15 - [XSS and Timing Attack Mitigation]
**Vulnerability:** XSS in PDF/Email templates and Timing Attacks in webhooks.
**Learning:** Distributed `escapeHtml` implementations were inconsistent (some missed `'` escaping). `crypto.timingSafeEqual` in Node.js throws `RangeError` if buffer lengths differ, which could leak information via 500 errors or cause crashes.
**Prevention:** Use a centralized `src/utils/html.ts` for all template interpolation. Always perform a length check before `timingSafeEqual` for webhook signature verification.

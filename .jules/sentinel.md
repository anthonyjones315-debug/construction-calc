## 2025-05-14 - Robust HTML Escaping and Timing-Safe Webhook Verification
**Vulnerability:** XSS in PDF templates and timing attacks in Documenso webhook signature verification.
**Learning:** High-impact user-facing documents like PDF templates are often overlooked for XSS but pose significant risk if rendered via browserless/headless Chrome using unsanitized user inputs. Additionally, standard string comparison for HMACs allows attackers to guess signatures byte-by-byte.
**Prevention:** Centralize HTML escaping in a shared utility (`src/utils/html.ts`) and use `crypto.timingSafeEqual` for all cryptographic signature checks.

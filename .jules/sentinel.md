## 2026-04-18 - Consolidating XSS Protection and Hardening Webhooks
**Vulnerability:** Scattered, inconsistent HTML escaping and a fail-open Documenso webhook signature check.
**Learning:** Localized `escapeHtml` functions often missed single quotes (') and non-string inputs. The webhook check only ran if a secret was present, allowing unauthenticated requests if environment variables were misconfigured.
**Prevention:** Centralize security utilities in `src/utils/` and ensure all webhook endpoints fail-closed by requiring secrets and signatures upfront.

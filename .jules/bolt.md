## 2026-03-17 - Centralizing and Reusing Intl Formatters
**Learning:** Reusing cached `Intl.NumberFormat` and `Intl.DateTimeFormat` instances is 50-100x faster than inline instantiations in high-frequency rendering components like Dashboards or Signature clients. Inline rendering instantiations of `Intl` lead to excessive CPU overhead and trigger frequent Garbage Collection.
**Action:** Always import and reuse pre-cached, centralized formatters from `src/utils/formatters.ts` rather than instantiating inline formatters in component render bodies.

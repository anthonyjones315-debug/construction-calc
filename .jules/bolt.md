## 2025-05-14 - [Cached Intl formatters]
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` is computationally expensive because it requires loading locale-specific data. In high-frequency loops or document generation, this can become a significant bottleneck. Centralizing these in a cached utility yields a measurable (~15x) speedup.
**Action:** Always use the centralized `getNumberFormatter` or `getDateTimeFormatter` from `src/utils/formatters.ts` instead of `new Intl.*` in performance-sensitive paths.

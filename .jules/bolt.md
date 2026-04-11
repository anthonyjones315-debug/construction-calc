## 2025-05-14 - Intl Formatter Caching
**Learning:** `Intl.NumberFormat` and `Intl.DateTimeFormat` instantiation is significantly more expensive than cached retrieval (measured ~10.8x difference). Deterministic key generation by sorting option keys is necessary for effective caching.
**Action:** Always use the centralized `getNumberFormatter` or `getDateTimeFormatter` utility from `@/utils/formatters` instead of `new Intl.NumberFormat` or `toLocaleString`, especially in animation loops or batch processing.

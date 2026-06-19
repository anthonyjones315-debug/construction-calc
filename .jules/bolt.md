## 2025-05-15 - Intl Formatter Caching
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` is expensive (~25x slower than reuse). High-traffic components or large lists suffer from repeated instantiation during renders.
**Action:** Always use centralized pre-instantiated formatters from `src/utils/formatters.ts` (e.g., `USD_FORMATTER`, `DATE_FORMATTER_FULL`) or use `getNumberFormatter`/`getDateTimeFormatter` to benefit from the internal cache.

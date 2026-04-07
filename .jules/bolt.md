## 2025-05-15 - Caching Intl Formatters
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` is expensive, especially in high-frequency contexts like `requestAnimationFrame` or large list rendering. Using a centralized cache with deterministic keys (sorted options) significantly reduces garbage collection and CPU overhead.
**Action:** Always use the centralized `getNumberFormatter` or `getDateTimeFormatter` from `@/utils/formatters` for any numeric or date formatting, particularly within render loops or animation frames.

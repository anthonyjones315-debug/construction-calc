## 2026-04-25 - Centralized Intl Formatter Caching
**Learning:** Repeatedly instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` in high-frequency paths (like `requestAnimationFrame` or large list rendering) is extremely expensive. Benchmarking showed a ~28x performance improvement by using a centralized cache.
**Action:** Always use the `getNumberFormatter` or `getDateTimeFormatter` utilities from `src/utils/formatters.ts` instead of creating new instances, especially in render loops or animation ticks.

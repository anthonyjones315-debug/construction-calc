## 2025-05-15 - Intl.NumberFormat Caching Speedup
**Learning:** Repeatedly instantiating `Intl.NumberFormat` (and `Intl.DateTimeFormat`) is significantly slower than reusing a cached instance. In a benchmark of 100,000 iterations, caching provided a ~15-17x speedup. This is particularly critical in high-frequency loops like `requestAnimationFrame` for animations.
**Action:** Always use the centralized `getNumberFormatter` or `getDateTimeFormatter` from `@/utils/formatters` instead of `new Intl.NumberFormat` or `new Intl.DateTimeFormat`.

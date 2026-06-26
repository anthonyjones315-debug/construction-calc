## 2025-06-26 - Optimized Intl Formatter instantiation
**Learning:** Reusing pre-instantiated `Intl` formatters is significantly faster than creating new ones in render loops. Benchmarking shows ~100x speedup for `NumberFormat` and ~60x for `DateTimeFormat`.
**Action:** Always use centralized formatters from `src/utils/formatters.ts` instead of `new Intl.NumberFormat` or `toLocaleDateString` in components.

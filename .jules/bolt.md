# Bolt Performance Journal

## 2025-05-22 - Hoisting Intl formatters for significant speedups
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` inside render loops or frequently called functions is extremely expensive. Benchmarks on this environment show that reusable instances are ~50-200x faster than repeated instantiation (e.g., ~12ms vs ~710ms for 10k NumberFormat operations).
**Action:** Always use centralized, pre-instantiated formatters from `src/utils/formatters.ts` for common locales and options (like USD currency or standard date formats) instead of calling `new Intl.*` or `.toLocaleString()` in components.

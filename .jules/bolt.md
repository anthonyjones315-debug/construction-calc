# Bolt's Performance Journal

## 2026-06-30 - Intl.DateTimeFormat Hoisting
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside render loops or frequently called functions is expensive. Benchmarks show that reusing pre-instantiated formatters can be up to 100x faster than creating new ones.
**Action:** Centralize common formatter configurations in `src/utils/formatters.ts` and hoist them to the module level or a cache to avoid repeated instantiation.

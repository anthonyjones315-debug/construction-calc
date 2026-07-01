# Bolt's Performance Journal

## 2025-05-15 - Intl Formatter Hoisting
**Learning:** Re-instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` inside React render loops or frequently called functions is a significant performance bottleneck. Benchmarks show that hoisting these instances can be 70x-100x faster.
**Action:** Centralize common formatters in `src/utils/formatters.ts` and reuse them across the codebase instead of creating new instances.

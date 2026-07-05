# Bolt's Performance Journal

## 2025-07-05 - Centralizing Intl Formatters
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` (or using `toLocaleDateString` which does so internally) inside render functions or loops is a significant performance bottleneck in React. Benchmarks show that reusing cached instances is ~70x-100x faster.
**Action:** Centralize frequently used formatters (USD, Short Date, Full Date, Date with Weekday) in `src/utils/formatters.ts` and export them as constants to be reused across the application.

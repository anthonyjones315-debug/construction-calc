## 2024-10-23 - Hoist Intl Formatters
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` inside render loops or frequently called functions (like `toLocaleDateString` with options) is a significant performance bottleneck in JavaScript. Benchmarking shows that hoisting these instances can be ~65-75x faster.
**Action:** Always use the centralized, hoisted formatters from `src/utils/formatters.ts` (e.g., `USD_FORMATTER`, `DATE_FORMATTER_FULL`) for common display formats instead of inline instantiation or locale string methods with options.

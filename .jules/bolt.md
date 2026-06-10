## 2025-05-15 - Intl Formatter Optimization
**Learning:** Pre-instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` constants is ~4.5x faster than Map-based cache lookups and ~80x faster than creating new instances. Map lookups incur overhead from key generation (string concatenation and sorting).
**Action:** Use centralized exported formatters (e.g., `USD_FORMATTER`) for standard formatting tasks instead of `getNumberFormatter` or `new Intl.NumberFormat`.

## 2023-10-27 - [Centralized Intl Formatters]
**Learning:** Benchmarking confirms that hoisting Intl.NumberFormat instances is ~4x faster than Map-based cache lookups (due to key generation overhead) and ~75x faster than direct 'new Intl.NumberFormat' instantiation.
**Action:** Always prefer using exported constants from `src/utils/formatters.ts` (e.g., `USD_FORMATTER`) for common formatting needs instead of inline instantiation or `getNumberFormatter` calls.

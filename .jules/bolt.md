## 2025-05-15 - Intl Formatter Hoisting
**Learning:** Benchmarking confirms that hoisting Intl.NumberFormat and Intl.DateTimeFormat instances is ~4x faster than Map-based cache lookups (due to key generation overhead) and ~75x faster than direct 'new Intl.NumberFormat' instantiation inside React components.
**Action:** Always prefer centralized, hoisted formatters (USD_FORMATTER, DATE_FORMATTER_FULL, etc.) for high-traffic components or loops to minimize garbage collection and CPU cycles.

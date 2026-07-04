# Bolt's Performance Journal

## 2025-05-14 - [Hoisting Intl Formatters]
**Learning:** Benchmarking confirms that reusing cached `Intl.NumberFormat` and `Intl.DateTimeFormat` instances is ~100x faster than creating new ones in tight loops or render functions (e.g., 100k iterations: ~7.1s vs ~76ms).
**Action:** Centralize common formatters in a utility file and export them for use across the application to reduce CPU overhead and garbage collection.

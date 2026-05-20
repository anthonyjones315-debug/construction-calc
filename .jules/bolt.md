## 2025-01-24 - Performance impact of Intl.NumberFormat hoisting
**Learning:** Re-instantiating `Intl.NumberFormat` within a function (especially those called in loops or frequently during re-renders) is significantly slower than using a hoisted module-level constant. Measurement showed a ~70x performance difference (897ms vs 13ms for 10,000 iterations).
**Action:** Always hoist `Intl` formatters (Number, DateTime, etc.) to a module-level constant when the configuration is static to avoid expensive initialization overhead.

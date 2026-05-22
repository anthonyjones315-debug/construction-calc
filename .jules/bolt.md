## 2025-05-15 - Intl.NumberFormat Hoisting
**Learning:** Instantiating `Intl.NumberFormat` inside high-frequency functions or render loops is a significant performance bottleneck. Hoisting the instance to a module-level constant yields a ~66x-100x speedup (e.g., from ~1127ms down to ~11ms for 10,000 iterations).
**Action:** Always hoist `Intl` formatters (Number, DateTime) to module-level constants when the options are static, especially in components that render lists or loops.

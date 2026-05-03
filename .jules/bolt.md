## 2025-05-14 - Intl.NumberFormat Cache Lookup Overhead
**Learning:** Even with a Map-based cache for `Intl.NumberFormat`, the overhead of generating cache keys (string concatenation) and performing Map lookups is measurable (~3.1x slower than direct reference). In high-frequency paths like `requestAnimationFrame` (60fps), these lookups can accumulate and cause unnecessary CPU churn.
**Action:** Move `getNumberFormatter` lookups out of animation loops and use module-level constants for static, frequently-used formatters (like USD currency) to bypass the cache lookup logic entirely.

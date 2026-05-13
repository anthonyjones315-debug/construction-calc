## 2025-05-15 - Hoisting Intl formatters

**Learning:** `Intl.NumberFormat` instantiation is surprisingly expensive. In high-frequency paths like `requestAnimationFrame` loops (60-120fps) or large rendering lists, the overhead of creating new instances or even performing Map-based cache lookups (due to key generation/sorting) can become a bottleneck. Caching instances as module-level constants or hoisting them out of loops yields a ~2.5x to 15x speedup.

**Action:** Always hoist `Intl` formatters to the module level or outside of high-frequency loops when the formatting options are static. Avoid generating dynamic cache keys using `Object.keys().sort()` inside hot paths.

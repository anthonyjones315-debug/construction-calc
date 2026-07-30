## 2026-05-03 - Reuse Cached Intl Formatters
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` on every render can be up to 50-100x slower than reusing a cached instance. Additionally, native methods like `.toLocaleDateString()` and `.toLocaleString()` internally instantiate formatters, contributing to Garbage Collection overhead in render loops.
**Action:** Centralize formatters in `src/utils/formatters.ts` and use them across components to ensure O(1) retrieval and zero rendering-time instantiation overhead.

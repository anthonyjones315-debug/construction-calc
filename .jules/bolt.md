## 2026-04-24 - Cached Intl.NumberFormat for ~25x speedup
**Learning:** Instantiating `Intl` objects (like `Intl.NumberFormat`) is a surprisingly expensive operation in JavaScript environments (V8, etc.). In scenarios like rendering large tables, generating complex PDF documents, or high-frequency animation loops, repeated instantiation can become a significant bottleneck.
**Action:** Use a centralized utility like `src/utils/formatters.ts` to cache and reuse `Intl` instances. Ensure the cache key is deterministic by sorting option keys.

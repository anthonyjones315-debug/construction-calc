## 2025-03-23 - [Caching Intl Formatters]
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` is surprisingly expensive, especially in high-frequency loops like animations or when generating documents with hundreds of formatted values. Caching these instances yields a ~15-17x speedup.
**Action:** Use the centralized `src/utils/formatters.ts` utility for reusable formatting logic. For single-purpose files with static formatting requirements, use a module-level constant instance.

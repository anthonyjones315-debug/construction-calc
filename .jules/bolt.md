## 2025-05-15 - [Intl Formatters Caching]
**Learning:** `Intl.NumberFormat` and `Intl.DateTimeFormat` are expensive to instantiate. Using them inside `requestAnimationFrame` loops or large template mappings can lead to measurable performance degradation and high GC pressure.
**Action:** Always cache and reuse `Intl` formatters, especially when used in high-frequency contexts. Use a static `Map` for dynamic options (like decimal precision).

## 2025-05-15 - [Intl Formatter Caching]
**Learning:** Reusing cached `Intl.NumberFormat` and `Intl.DateTimeFormat` instances is significantly faster (~50-100x) than inline instantiation during render cycles. Instantiating these objects is one of the most expensive common operations in UI rendering.
**Action:** Centralize common formatting configurations in `src/utils/formatters.ts` as exported constants and prefer them over `toLocaleString` or `new Intl.*` in components.

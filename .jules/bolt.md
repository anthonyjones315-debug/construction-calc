## 2025-05-14 - Centralized Intl Formatter Caching

**Learning:** Initializing `Intl.NumberFormat` and `Intl.DateTimeFormat` instances is a heavy operation in JavaScript. In high-frequency scenarios like React re-renders or `requestAnimationFrame` animation loops, repeated allocation of these objects can cause measurable CPU overhead and garbage collection pressure. Centralizing these instances in a cached Map, keyed by locale and options (with sorted keys), significantly improves performance.

**Action:** Use the `getNumberFormatter` and `getDateTimeFormatter` utilities from `@/utils/formatters` for all numeric and date formatting instead of `toLocaleString` or creating new `Intl` instances manually.

## 2025-05-15 - Intl Formatter Caching
**Learning:** Initializing `Intl.NumberFormat` and `Intl.DateTimeFormat` objects is computationally expensive. In high-frequency paths like `requestAnimationFrame` loops for UI animations or bulk document generation, repeated instantiation causes measurable CPU overhead and potentially frame drops (jank).
**Action:** Always use the centralized caching utility in `src/utils/formatters.ts` (`getNumberFormatter`, `getDateTimeFormatter`) to reuse `Intl` instances based on a deterministic key (locale + sorted options).

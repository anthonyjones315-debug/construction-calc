# Bolt's Journal

## 2025-05-16 - Reusing Cached Intl Formatters for High-Frequency Rendering
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` inline within frequently called functions or React render loops is extremely expensive (up to 50x-100x slower) and leads to significant Garbage Collection (GC) pauses and UI micro-stutter.
**Action:** Always import and use centralized cached helper functions like `getNumberFormatter` and `getDateTimeFormatter` to lookup or pre-instantiate locale formatters instead of calling `new Intl.*` or `.toLocaleDateString` on demand.

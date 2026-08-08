# Bolt Journal

## 2026-03-06 - Reducing Garbage Collection Churn in High-Frequency Render Mappings
**Learning:** Inline instantiation of `Intl` formatter instances (including implicit creations via `.toLocaleString` and `.toLocaleDateString` with options) inside list mapping loops and high-frequency dashboard render loops results in huge allocation churn and GC pauses. Reusing a centralized cached formatter with deterministic cache keys provides a massive performance boost (often 50-100x faster) without affecting rendering correctness.
**Action:** Always import and use the centralized caching formatters (`getDateTimeFormatter` and `getNumberFormatter`) instead of inline `.toLocaleString()`, `.toLocaleDateString()`, and `new Intl.*Format` in render loops and client components.

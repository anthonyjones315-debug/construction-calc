## 2025-05-15 - Caching Intl Formatters
**Learning:** Creating new `Intl.NumberFormat` or `Intl.DateTimeFormat` instances inline inside render bodies or highly-frequently called functions introduces substantial garbage collection and CPU overhead. Standardizing and caching these formatters yields a 50-100x performance improvement.
**Action:** Always import centralized pre-configured cached formatters from `@/utils/formatters` instead of calling `new Intl.NumberFormat` or `new Intl.DateTimeFormat` locally or within render paths.

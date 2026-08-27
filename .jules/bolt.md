## 2026-03-27 - Centralized Intl Formatter Caching in High-Frequency Render Loops
**Learning:** Interactive calculator components re-evaluate calculation memo blocks during range slider dragging or typing. Calling `.toLocaleString()` inline inside these loops causes V8 to construct or resolve `Intl.NumberFormat` instances on every render step, generating garbage collection pressure.
**Action:** Always import and use `getNumberFormatter()` from `@/utils/formatters` in calculation render paths to reuse module-scoped cached `Intl.NumberFormat` instances.

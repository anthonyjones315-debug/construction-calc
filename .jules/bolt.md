# Bolt's Performance Journal

## 2026-05-03 - Centralized Cached Intl Formatters Pattern
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` repeatedly in Next.js page components or render bodies is extremely expensive (~25x slower). The codebase features a centralized formatter utility at `src/utils/formatters.ts` that dynamically caches instances by locale and options.
**Action:** Always check `src/utils/formatters.ts` first and add or reuse pre-configured formatters (e.g., `USD_FORMATTER_COMPACT` for whole-dollar formats) instead of using local `new Intl` calls.

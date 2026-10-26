# Bolt's Journal - Critical Learnings

## 2026-10-26 - Cached Intl Formatters Utility Pattern
**Learning:** Re-instantiating `new Intl.NumberFormat` or calling `toLocaleDateString`/`toLocaleString` inline in React component render paths allocates new formatter objects on every render. Reusing cached `Intl` instances via `@/utils/formatters` (`getNumberFormatter` and `getDateTimeFormatter`) eliminates object allocation overhead.
**Action:** Use `getNumberFormatter` and `getDateTimeFormatter` from `@/utils/formatters` whenever formatting dates or currencies in UI components.

## 2026-03-18 - Cached Intl Formatters for Estimate Detail Views
**Learning:** Instantiating `new Intl.NumberFormat` inside dollar formatting functions called per-row during line item table rendering creates unnecessary object allocations and ICU formatter initializations.
**Action:** Use `getNumberFormatter` and `getDateTimeFormatter` from `@/utils/formatters` for currency and date formatting across client component render passes.

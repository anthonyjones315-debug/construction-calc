## 2026-03-30 - [Auto-select on focus for calculator inputs]
**Learning:** For calculator inputs where users frequently replace default values (e.g., `ProInput`, `FeetInchesInput`), implementing 'auto-select on focus' using `onFocus={(e) => e.target.select()}` significantly improves user efficiency by allowing immediate replacement of text upon focus.
**Action:** Use `onFocus={(e) => e.target.select()}` for numeric or calculation-heavy inputs where overwriting the existing value is the primary user intent.

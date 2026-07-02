## 2025-05-15 - Intl Formatter Hoisting
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` inside a React render loop or frequently called utility function is a significant performance bottleneck (up to 100x slower than using a pre-instantiated instance).
**Action:** Always hoist Intl formatters to the module level or use a centralized caching utility. Ensure "Full" date formatters include the year to prevent UI regressions on business documents.

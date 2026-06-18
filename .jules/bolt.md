## 2024-05-22 - Centralized Intl Formatter Re-use
**Learning:** Benchmarking confirmed that hoisting Intl.NumberFormat and Intl.DateTimeFormat instances is ~60-70x faster than direct 'new Intl' instantiation. Constructing these objects is expensive because it involves locale data lookup and option resolution.
**Action:** Always prefer using centralized, pre-instantiated formatters from `src/utils/formatters.ts` for common currency and date formats, especially within render loops or high-frequency utility functions.

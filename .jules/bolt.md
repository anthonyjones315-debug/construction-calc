# Bolt's Performance Journal

## 2026-03-17 - Regression Protection for Centralized Formatters
**Learning:** High-performance caching layers (like centralized cached `Intl` formatters) are susceptible to regression during complex branch merges or debug hotfixes, which can quietly reintroduce expensive inline object instantiations and heavy Garbage Collection pressure.
**Action:** Always secure performance-critical utilities with dedicated unit tests (e.g., `src/utils/formatters.test.ts`) and run them during integration/commit checks to guarantee formatters remain cached, deterministic, and active across major frontend views.

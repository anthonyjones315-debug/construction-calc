# Bolt's Journal - Critical Learnings Only

## 2026-05-14 - The Cost of Map-Based Formatter Caching
**Learning:** The `getNumberFormatter` utility in `src/utils/formatters.ts` incurs significant overhead (~2.75x to 11x slower) due to deterministic cache-key generation (sorting keys and stringification). In high-frequency contexts like `requestAnimationFrame` (60fps) or within large report generation loops, this overhead becomes a bottleneck.
**Action:** Always hoist `Intl.NumberFormat` instances to the module level or component `useEffect` scope when options are constant, rather than calling the caching utility in every iteration.

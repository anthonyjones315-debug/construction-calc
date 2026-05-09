## 2025-05-15 - Animation Loop Hoisting
**Learning:** The `getNumberFormatter` utility in `src/utils/formatters.ts` incurs significant overhead due to cache-key generation (sorting/stringification). In high-frequency contexts like `requestAnimationFrame`, this is ~11x slower than a hoisted reference.
**Action:** Always hoist `Intl` formatters out of loops and high-frequency animation callbacks, even when using a caching utility.

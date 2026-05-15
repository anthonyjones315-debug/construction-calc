## 2025-05-14 - Redundant Cache-Key Generation in High-Frequency Loops
**Learning:** The `getNumberFormatter` utility in `src/utils/formatters.ts` incurs significant overhead during cache-key generation (sorting keys and stringifying options). In high-frequency contexts like `requestAnimationFrame` (60-120fps), calling this every frame can be ~10.9x slower than using a hoisted reference.
**Action:** Always hoist `Intl.NumberFormat` instances (or the result of `getNumberFormatter`) outside of loops or `requestAnimationFrame` callbacks when the formatting options are invariant.

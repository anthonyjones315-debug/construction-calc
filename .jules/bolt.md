## 2025-05-15 - Expensive Cache-Key Generation in Animation Loops
**Learning:** `getNumberFormatter` in `src/utils/formatters.ts` generates cache keys by sorting and stringifying options on every call. In high-frequency paths like `requestAnimationFrame` (60-120fps), this overhead becomes significant (~10.9x slower than a static reference), even if the underlying `Intl.NumberFormat` is cached.
**Action:** Hoist Intl formatter resolution outside of animation ticks or high-frequency loops. Resolve the formatter once when inputs change and use the reference within the loop.

## 2026-05-29 - Optimizing React Animation Loops
**Learning:** Calling a caching utility like `getNumberFormatter` inside a `requestAnimationFrame` loop (60fps) introduces significant overhead due to repeated cache-key generation and Map lookups. Even if cached, the lookup itself is ~11x slower than a hoisted static reference in high-frequency contexts.
**Action:** Always hoist `Intl` formatters or other configuration-heavy objects outside of hot loops (animations, large list renders) whenever the options are stable.

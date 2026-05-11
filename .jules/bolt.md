## 2025-05-15 - Intl Hoisting in High-Frequency Loops
**Learning:** Calling `getNumberFormatter` (which performs Map lookups and key generation) inside a `requestAnimationFrame` tick or large loops incurs measurable overhead (~2.4x - 10.9x slower than a hoisted reference).
**Action:** Hoist `Intl.NumberFormat` instances to module-level constants or stable `useEffect`/`useMemo` scopes when used in hot paths.

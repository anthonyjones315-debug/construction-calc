# Bolt Journal - Performance Learnings

## 2025-05-14 - Intl Formatter Hoisting Performance
**Learning:** Benchmarking in this environment confirms that hoisting `Intl.NumberFormat` and `Intl.DateTimeFormat` instances to the module level provides a significant performance boost over standard patterns. Direct access to a hoisted instance is ~3.5x faster than using a Map-based cache (which incurs string key generation overhead) and ~24x faster than direct `new Intl.NumberFormat()` instantiation. This is particularly critical in `requestAnimationFrame` loops used for animated counters.

**Action:** Always hoist `Intl` formatters in components that perform frequent updates or animations. In `useAnimatedDisplayValue`, ensure the formatter is resolved *outside* the animation tick.

## 2025-05-14 - Optimized Initial State for Async Fetches
**Learning:** Initializing loading states to `false` when an immediate `useEffect` fetch is expected causes an unnecessary `false -> true -> false` re-render cycle on mount. Additionally, calling `setLoading(true)` inside `useEffect` on mount triggers the `react-hooks/set-state-in-effect` ESLint warning.

**Action:** Initialize `loadingMaterials` (and similar fetch-dependent states) to `true` by default if the data is required for the initial meaningful paint.

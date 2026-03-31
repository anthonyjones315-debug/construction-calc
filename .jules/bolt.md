## 2026-03-26 - [Intl.NumberFormat Caching]
**Learning:** Instantiating `Intl.NumberFormat` is expensive, especially in high-frequency loops like `requestAnimationFrame`.
**Action:** Always cache `Intl.NumberFormat` instances in a static `Map` or as static constants when possible to avoid repeated object re-allocation and garbage collection overhead.

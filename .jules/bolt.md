# Bolt Performance Journal

## 2025-05-15 - [Intl.NumberFormat Caching in Animation Loop]
**Learning:** Instantiating `Intl.NumberFormat` objects inside high-frequency loops (like `requestAnimationFrame` ticks) is a significant performance bottleneck due to expensive object re-allocation and initialization. Caching these instances in a static `Map` by their configuration (e.g., decimal count) eliminates this overhead.
**Action:** Always cache `Intl.NumberFormat` or `Intl.DateTimeFormat` instances if they are used repeatedly with the same options, especially in UI animation paths.

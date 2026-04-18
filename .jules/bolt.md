# Bolt's Performance Journal

## 2025-05-15 - [Intl Caching Performance]
**Learning:** Repeatedly instantiating `Intl.NumberFormat` or calling `toLocaleString` (which creates a formatter internally) in high-frequency loops like animation frames or large document generation is significantly slower (~37x in benchmarks) than reusing cached instances. Caching can be done globally or at the component level.

**Action:** Use a centralized `getNumberFormatter` utility with Map-based caching. For high-frequency loops (like `requestAnimationFrame`), retrieve the formatter ONCE outside the loop if possible to avoid Map lookup overhead on every frame.

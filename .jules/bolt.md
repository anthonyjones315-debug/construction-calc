# Bolt's Journal - Critical Learnings

## 2025-05-15 - Intl Formatter Caching Speedup
**Learning:** Benchmarking confirms that reusing cached Intl.NumberFormat and Intl.DateTimeFormat instances is ~50-70x faster than inline instantiation. Inline NumberFormat for 10k iterations took ~620ms vs ~9ms cached. Inline DateTimeFormat took ~1050ms vs ~19ms cached.
**Action:** Always use centralized formatters for common currency and date formats to avoid the heavy cost of instantiation in render loops.

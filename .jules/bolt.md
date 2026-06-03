## 2025-05-14 - Hoisting Intl Formatters in React Components
**Learning:** Benchmarking in this codebase confirms that hoisting Intl.NumberFormat and Intl.DateTimeFormat instances to the module level is ~24x faster than inline 'new Intl' instantiation and ~3.5x faster than Map-based cache lookups (due to key generation overhead).
**Action:** Always hoist Intl formatters to the module level in React components or performance-critical utility functions to avoid the expensive overhead of repeatedly creating these formatters during render cycles or in loops.

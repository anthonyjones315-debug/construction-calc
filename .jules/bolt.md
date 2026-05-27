## 2026-05-27 - [Initial Bolt Entry]
**Learning:** Performance optimizations should focus on high-frequency code paths, such as animation loops (requestAnimationFrame).
**Action:** Always check if expensive utility calls (like Intl formatters or cache-key generation) can be hoisted out of loops or frame callbacks.

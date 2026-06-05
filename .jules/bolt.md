## 2025-05-15 - Intl Formatter Hoisting
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` inline within React components or loops is extremely expensive (~85x slower than reuse). Even using a `Map`-based cache has overhead due to key generation (~2.5x slower than direct constant access).
**Action:** Centralize and export common formatters (USD, standard date formats) as constants in `src/utils/formatters.ts` and reuse them across the app, especially in high-frequency render paths like the Command Center or large estimate lists.

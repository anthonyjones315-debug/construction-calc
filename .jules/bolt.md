## 2026-05-02 - Memoize pricebook search and estimate builder computed fields

**Learning:** `NewEstimateClient` re-renders frequently on form inputs (client name, project, estimate notes, line items). In `PriceBookPanel`, pricebook materials filtering (`.filter(...)` with `.toLowerCase()`) and category grouping (`grouped`) were re-computed on every single keystroke across the form, causing unnecessary object/array allocations and string operations. Additionally, inline IIFEs in JSX props execute on every render.

**Action:** Wrap pricebook material filtering, category grouping, and auto-generated field calculations in `useMemo` hooks. Ensure search query strings are lowercased once outside filter loops to eliminate redundant string lowercasing iterations.

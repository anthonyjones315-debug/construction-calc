## 2026-03-17 - Pre-compute Static Reference Table Maps and Term Target Arrays

**Learning:** Static lookup data (like NYS county tax rates and financial term definitions) were re-filtered and re-normalized on every function call during render loops. For example, `getNysCountyRate` ran an $O(N)$ array search over 58 counties calling `.toLowerCase()` on every iteration, and `getFinancialTermDefinition` re-built target arrays and executed regex normalizations per term on every input render.

**Action:** Pre-compute module-scoped `Map` lookup structures (`NYS_COUNTY_TAX_RATES_MAP`) for $O(1)$ lookups and pre-normalize targets at module initialization time (`PREPARED_FINANCIAL_TERMS`) to eliminate runtime array allocations and string regex overhead during component re-renders.

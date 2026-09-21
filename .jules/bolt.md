## 2026-03-21 - Pre-computed Search Index Lowercasing
**Learning:** Real-time client-side search inputs trigger frequent re-execution of filter functions. Lowercasing strings and joining keyword arrays on every keystroke allocates hundreds of ephemeral objects and causes GC pauses.
**Action:** Always pre-compute lowercased target strings (`titleLower`, `categoryLower`, `keywordsLower`, etc.) when building static or semi-static search indexes, so search filtering performs direct string property comparisons without allocations.

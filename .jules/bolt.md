## 2026-03-18 - Pre-compute Date Timestamps Before Array Sorting

**Learning:** Calling `new Date(string).getTime()` or `new Date()` inside JavaScript array `.sort((a, b) => ...)` comparator functions creates $2 \times N \log N$ temporary Date object instantiations and incurs repeated date string parsing overhead per comparison.
**Action:** Pre-compute numeric timestamps (e.g. `updatedAtTime = Date.parse(updatedAt) || 0`) on objects during mapping prior to calling `.sort()`, making array comparator functions simple, zero-allocation numeric subtractions (`b.updatedAtTime - a.updatedAtTime`).

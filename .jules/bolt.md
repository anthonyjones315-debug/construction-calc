## 2026-03-18 - dnd-kit SortableContext Array Reference Stability
**Learning:** In `@dnd-kit/sortable`, passing an inline array map like `items.map(p => p.id)` to `SortableContext` creates a new array reference on every parent render, forcing `@dnd-kit` to re-register sortable items and triggering unnecessary re-renders across all cards during drag events.
**Action:** Always wrap column item IDs in `useMemo(() => items.map(p => p.id), [items])` and wrap card components in `React.memo`.

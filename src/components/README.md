# Components Design Tokens

Use semantic Tailwind tokens instead of literal brand values.

Primary token:
- `bg-primary`
- `text-primary`
- `border-primary/30`

Complementary secondary palette:
- `text-secondary-50`
- `bg-secondary-20`
- `border-secondary-70/40`

Glass system:
- Prefer shared primitives from [`glass-elements.tsx`](/Users/anthonyjones/GitHub/construction-calc/src/components/ui/glass-elements.tsx)
- Prefer semantic tokens (`--color-surface`, `--color-border`) and utility classes like `.glass-container` for cards (solid surfaces, no blur).
- Use `.glass-container`, `.glass-panel`, `.glass-modal`, `.glass-button`, and `.glass-input` instead of duplicating glass CSS

Composition rules:
- Keep component styling in Tailwind classes or shared glass utilities in [`globals.css`](/Users/anthonyjones/GitHub/construction-calc/src/app/globals.css)
- Do not introduce new orange hex outside the brand scale (`#ea580c` / `rgb(234 88 12 / …)`); use CSS variables (`--color-primary`, `--color-orange-brand`, etc.)
- For copy color roles, use `text-copy-primary`, `text-copy-secondary`, `text-copy-tertiary`, and `text-copy-accent`
- For field typography, use `text-field-input`, `text-field-label`, and `text-field-hint`

Lazy loading:
- Use `next/dynamic` at the route or shell boundary for heavy glass popups and modals
- Keep shared primitives in [`glass-elements.tsx`](/Users/anthonyjones/GitHub/construction-calc/src/components/ui/glass-elements.tsx), and lazy-load the feature component that composes them

Performance verification:
- Run [`scripts/liquid-orange-glass-performance-test.js`](/Users/anthonyjones/GitHub/construction-calc/scripts/liquid-orange-glass-performance-test.js) in the browser console against the iPhone 15 shell viewport

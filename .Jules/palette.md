## 2026-04-03 - [Interactive Aria-Label Pattern]
**Learning:** When a button's `aria-label` or text changes dynamically upon interaction (e.g., "Copy" to "Copied"), automated tests using static label locators will fail or become stale. Additionally, consistent typography (like `uppercase` and `tracking-widest`) must be accounted for in visual assertions.
**Action:** Use persistent role-based locators or re-query interactive elements to verify state transitions in Playwright. Ensure UI feedback strings match the design system's casing and spacing rules.

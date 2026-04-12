## 2025-05-15 - Testing State-Transitioning ARIA Labels
**Learning:** When verifying UI changes that modify `aria-label` attributes on interaction (like a copy feedback button), Playwright locators using `get_by_label` will become stale or invalid after the label changes.
**Action:** Use persistent role-based locators or re-query the element after the interaction to verify the state transition correctly in Playwright scripts.

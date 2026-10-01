# Palette's Journal - UX & Accessibility Learnings

## 2026-05-02 - Semantic Buttons for Modal Triggers
**Learning:** Using dummy `<a href="#">` tags as triggers for third-party modal preference centers (e.g., Termly CMP) causes unexpected URL hash mutations and page jump-to-top behavior for keyboard and screen reader users.
**Action:** Always use `<button type="button">` for non-navigational interactive triggers, preserving required trigger classes (e.g., `termly-display-preferences`) and adding explicit `focus-visible` ring styles.

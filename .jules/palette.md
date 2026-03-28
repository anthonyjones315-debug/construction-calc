# Palette's UX Journal

## 2025-03-25 - [Material List Copy Feedback]
**Learning:** In utility-heavy applications like calculators, providing immediate visual confirmation for "Copy" actions is critical. Users often perform these actions as a prelude to leaving the page (pasting into another app), so a high-contrast feedback state (e.g., green tint + "Copied" text) ensures confidence without needing to double-check.
**Action:** Always implement a 2-second feedback state for copy buttons using a simple boolean toggle and `setTimeout`.

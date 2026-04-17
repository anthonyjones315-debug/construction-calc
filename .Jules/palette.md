## 2024-04-17 - [Micro-feedback for clipboard actions]
**Learning:** Users often feel uncertain when clicking "Copy" buttons if there's no immediate visual change. Providing a temporary "Copied" state with a clear visual transition (color/text change) significantly improves the perceived reliability of the UI.
**Action:** Always implement local state-driven feedback (e.g., a 2-second 'Copied' state) for clipboard operations.

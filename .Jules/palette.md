## 2025-05-15 - [Copy Button Feedback Pattern]
**Learning:** Interactive 'Copy' buttons should provide temporary visual feedback (e.g., text changing to 'Copied' and icon changing to a checkmark) for approximately 2 seconds to confirm user success. Using `useEffect` with a cleanup function ensures robust timer management and prevents state updates if the component unmounts.
**Action:** Implement this pattern for all clipboard-copying interactions in the app.

## 2026-04-02 - [Interactive 'Copy' button feedback]
**Learning:** Interactive 'Copy' buttons should provide temporary visual feedback (e.g., text changing to 'Copied' and icon changing to a checkmark) for approximately 2 seconds to confirm user success, especially when global notifications might not be visible.
**Action:** Use a local `copied` state with a `useEffect` cleanup for the timer when implementing similar feedback patterns.

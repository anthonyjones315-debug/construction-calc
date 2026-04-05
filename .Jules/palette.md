## 2025-05-15 - [Copy Feedback Implementation]
**Learning:** Reusable UX pattern for 'Copy' buttons in this design system requires a 2-second visual state change (text, icon, and styling) paired with an updated `aria-label` for screen readers.
**Action:** Apply the `copied` state pattern using `useState` and `useEffect` with a `clearTimeout` cleanup to all interactive copy buttons.

## 2025-05-15 - [React Ref Update Warning]
**Learning:** Updating a `useRef` value directly during the render phase in `PlaceAutocomplete.tsx` triggered a React linting error. Refs should only be updated in effects or event handlers to avoid issues with React's rendering lifecycle.
**Action:** Wrap ref updates in a `useEffect` hook to ensure they happen after the render phase.

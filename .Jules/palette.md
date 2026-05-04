# Palette's Journal

## 2026-05-04 - Async Feedback Consistency in Calculator Modules
**Learning:** The application uses similar calculator logic in both standard (`src/app/calculators`) and administrative (`src/app/command-center`) contexts. UX improvements like async loading states and ARIA busy attributes must be applied to both to maintain a consistent professional feel and ensure accessibility for all user roles.
**Action:** When modifying core interactive components (calculators, estimators), search for sister components in `command-center` or other module paths to ensure UX parity.

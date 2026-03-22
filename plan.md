1. **Understand the problem**:
   The file `src/app/calculators/_components/CalculatorPage.tsx` contains deeply nested inline event handlers for the `UnitToggle` component. Specifically, at line ~4088 (and a few other places, e.g., line 4126 and 4234), `onChange` handlers are defined inline with multiple lines of logic (state updates based on the selected mode).

2. **Assess the risk**:
   Extracting these inline handlers to standalone functions outside of the JSX (but inside the component) is a safe refactoring. It improves readability and maintainability without changing the behavior. We need to be careful to bind to the correct state setter functions and preserve the exact logic.
   - Handlers to extract:
     - `handleWallStudSpacingChange(nextMode: WallStudSpacingMode)`
     - `handleWallStudHeightChange(nextMode: WallStudHeightMode)`

3. **Plan the changes**:
   - Create a `handleWallStudSpacingChange` function within `CalculatorPage`.
   - Replace the inline `onChange` at ~4088 with the new function.
   - Create a `handleWallStudHeightChange` function within `CalculatorPage`.
   - Replace the inline `onChange` at ~4126 with the new function.
   - Replace the inline `onChange` at ~4234 with the new function.

4. **Implement**:
   - Add the functions near the top of the `CalculatorPage` component, where other handlers and state are defined.
   - Update the JSX to use the new handlers.

5. **Verify**:
   - Run linter (`npm run lint`).
   - Run typecheck (`npm run typecheck`).
   - Ensure the tests pass.

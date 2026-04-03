## 2025-04-03 - [Auto-select numeric inputs on focus]
**Learning:** For calculator-heavy interfaces where users often replace default or previous values, adding `onFocus={(e) => e.target.select()}` to numeric inputs significantly reduces friction by removing the need for manual text selection.
**Action:** Always implement auto-selection for numeric inputs in calculators and form-heavy tools to improve input efficiency.

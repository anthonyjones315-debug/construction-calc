## 2025-05-14 - Auto-select on focus for numeric inputs
**Learning:** Contractors using mobile devices in the field frequently need to replace default values or previous measurements. Providing 'auto-select on focus' for numeric inputs significantly reduces friction by allowing immediate replacement without manual deletion.
**Action:** Always implement `onFocus={(e) => e.target.select()}` for numeric input fields in trade calculators and estimation forms.

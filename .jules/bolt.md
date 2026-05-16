## 2026-05-16 - Hoisting Intl Formatters
**Learning:** Instantiating `Intl.NumberFormat` inside a function that is called frequently (like `formatCurrency` in a list or render loop) is significantly slower (~70-90x) than using a hoisted, module-level constant. This is because `Intl` object creation is heavy, whereas the `format` method is highly optimized.
**Action:** Always hoist `Intl` formatters to the module level or use a memoized cache when the options are static or limited.

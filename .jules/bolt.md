## 2025-05-14 - Intl Formatter Caching

**Learning:** Repeatedly instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` is expensive, especially in high-frequency loops like `requestAnimationFrame` (60fps). Caching these instances based on locale and options can provide a ~15-17x speedup and significantly reduce garbage collection pressure.

**Action:** Use the centralized `src/utils/formatters.ts` utility for dynamic Intl formatting, or module-level constants for static configurations. Always move formatter retrieval outside of tight loops.

## 2025-05-14 - Test Dependencies in Templates

**Learning:** Some tests (e.g., `tests/invoice-template.spec.ts`) may depend on specific data being present in the generated HTML, even if it's not visible in the UI (e.g., `payload.material_list` in a hidden span).

**Action:** When refactoring templates, ensure that all fields checked by existing tests are preserved in the output, or update the tests if the fields are truly obsolete.

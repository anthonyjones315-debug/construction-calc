## 2025-05-14 - [Next.js Blocking Route Delay]
**Learning:** Next.js App Router can incur significant (~21s) delays when accessing dynamic data (like headers or auth) outside a `<Suspense>` boundary during rendering. This often manifests as a "blocking route" error in logs.
**Action:** Always wrap dynamic layouts or route segments that consume auth/headers in `<Suspense>` to unblock the initial shell rendering and prevent artificial TTFB inflation.

## 2025-05-14 - [Localized Intl Hoisting]
**Learning:** Hoisting `Intl.NumberFormat` to a module-level constant is a effective way to reduce GC pressure and instantiation overhead in high-frequency renders (like calculators). However, passing a hardcoded locale (e.g., 'en-US') causes a regression in dynamic localization.
**Action:** Use `new Intl.NumberFormat()` without arguments to create a hoisted instance that respects the environment's/user's default locale while still avoiding re-instantiation in the render loop.

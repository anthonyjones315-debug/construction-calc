## 2025-05-15 - Intl Formatter Centralization
**Learning:** Reusing `Intl` formatter instances via a central cache is significantly faster (~50-100x) than inline instantiation during renders. This is particularly impactful in dashboard components that render many currency or date values.
**Action:** Always check `src/utils/formatters.ts` for existing formatters before using `new Intl.*` or `.toLocaleDateString()`.

## 2025-05-15 - Dependency Management Caution
**Learning:** Running `pnpm install` in this environment may generate a `pnpm-lock.yaml` file even if `package-lock.json` exists. This file is large and pollutes PRs.
**Action:** Always check for and remove `pnpm-lock.yaml` before submitting if it was unintentionally generated during dependency restoration.

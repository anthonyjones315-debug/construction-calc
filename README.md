# Pro Construction Calc

Professional construction estimating for contractors across Oneida, Madison, and Herkimer counties. Trade calculators, Field Notes, saved estimates, and client-ready PDFs built for real field workflows.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Monitoring:** Sentry (error boundaries + release tracking)
- **Email / CRM:** Resend
- **PWA:** App Router manifest + custom service worker

---

## Key Features

### 48+ Trade Calculators

Professional-grade estimation for **Concrete**, **Framing**, **Roofing**, and more. Slab and footing volume, wall studs, rafter length, shingle bundles, pitch & slope, insulation R-value, trim, flooring, and business/margin tools — all tuned for field use.

### Field Notes

Native contractor guidance hub with on-site articles for regional tax, estimating, and field planning topics. Content lives in-app and stays tied to the calculator workflow.

### Field Access

Mobile install prompts are available for field use, and the app now uses a custom service worker to support a more app-like PWA experience with offline fallback, install shortcuts, and update-aware field access.

### Account Security

Email/password accounts can enable email 2FA with a 6-digit code flow. Codes are delivered through Resend using a lightweight branded HTML template and expire after 5 minutes.

### Sentry Audit

Full-context error reporting for field failures. Calculator inputs and trade context are attached to errors so issues can be reproduced and fixed quickly.

### Regional Coverage

Built around **Oneida**, **Madison**, and **Herkimer** county workflows, including county tax defaults, estimate PDFs, and operator-friendly handoff guides.

---

## Quick Start

```bash
npm install
npm run dev
# http://localhost:3000
```

**Validate before deploy:**

```bash
npm run lint
npm run typecheck
npm run build
npm run check-calcs
```

Copy `.env.local.example` to `.env.local` and set required variables (see repo docs or `.env.local.example` for the full list).

## Supabase Production Pooling

- Use `SUPABASE_DB_TRANSACTION_URL` for runtime database traffic. This should be the Supabase Transaction pooler on port `6543`.
- Use `SUPABASE_DB_SESSION_URL` only for `npm run db:push`. This should be the Session pooler on port `5432`.
- [`src/db/index.ts`](/Users/anthonyjones/GitHub/construction-calc/src/db/index.ts) uses `postgres` plus Drizzle with `max: 10` to avoid serverless connection spikes.
- [`drizzle.config.ts`](/Users/anthonyjones/GitHub/construction-calc/drizzle.config.ts) is intentionally pinned to the session URL so migrations do not run through the transaction pooler.
- Owner isolation for estimates is defined in [`estimates-rls-production.sql`](/Users/anthonyjones/GitHub/construction-calc/src/lib/supabase/estimates-rls-production.sql) and mirrored in [`schema.sql`](/Users/anthonyjones/GitHub/construction-calc/src/lib/supabase/schema.sql).

---

## Versioning

Releases follow [Keep a Changelog](https://keepachangelog.com/). See [CHANGELOG.md](./CHANGELOG.md) for version history.
- **Supabase Health Check**

Run the master verification script:

```bash
supabase db remote:run supabase_master_check.sql
```

Or use the Node health check script:

```bash
npm run supabase:health
```

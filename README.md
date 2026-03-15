# Pro Construction Calc — The Estimating Cockpit for Oneida County

Professional construction estimating for contractors in the Mohawk Valley. Trade calculators, regional Field Notes, and offline-ready PWA built for jobsites in Rome, Utica, Marcy, and Floyd.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Monitoring:** Sentry (error boundaries + release tracking)
- **Email / CRM:** Resend
- **PWA:** Serwist (offline support)

---

## Key Features

### 48+ Trade Calculators

Professional-grade estimation for **Concrete**, **Framing**, **Roofing**, and more. Slab and footing volume, wall studs, rafter length, shingle bundles, pitch & slope, insulation R-value, trim, flooring, and business/margin tools — all tuned for field use.

### Field Notes

Native regional expertise hub. Oneida County Freeze-Lines (Rome vs. Utica), NYS Retainage Laws, and insulation R-value guides. No external click-aways; content lives on-site.

### Offline Mode

PWA verified for jobsites in Rome/Utica dead zones. `/offline` is precached; core flows remain usable when connectivity drops.

### Sentry Audit

Full-context error reporting for field failures. Calculator inputs and trade context are attached to errors so issues can be reproduced and fixed quickly.

### Local Authority

Built for **Marcy**, **Floyd**, **Utica**, and the wider Oneida County area. Frost depth, retainage, and material assumptions are aligned with local practice and code.

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

---

## Versioning

Releases follow [Keep a Changelog](https://keepachangelog.com/). See [CHANGELOG.md](./CHANGELOG.md) for version history.

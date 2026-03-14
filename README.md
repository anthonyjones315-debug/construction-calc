# Build Calc Pro — Launch Operations Guide

Production Next.js app for construction estimating, lead capture, auth, and pricing workflows.

## Stack

- Framework: Next.js (App Router)
- Runtime: Node.js
- Hosting: Vercel
- Auth: Auth.js + Google OAuth
- Data: Supabase

## Local validation

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
```

Run locally:

```bash
npm run dev
# http://localhost:3000
```

## Required environment variables

Copy `.env.local.example` to `.env.local` and set values.

Critical:

- `AUTH_SECRET`
- `AUTH_URL` (production: `https://proconstructioncalc.com`)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (or `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional by feature:

- `ANTHROPIC_API_KEY` (AI optimizer endpoint)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_ADSENSE_ID`
- `NEXT_PUBLIC_AMAZON_TAG`

## Vercel deploy checklist

1. Import repo into Vercel (framework auto-detects Next.js).
2. Add all required environment variables for Production.
3. Set project domain to `proconstructioncalc.com`.
4. Ensure DNS for apex domain is configured.
5. Confirm redirect behavior from `www.proconstructioncalc.com` to apex.
6. Deploy and verify build logs are clean of errors.

## Launch-day smoke tests

After deploy, verify:

- Home page and calculators load.
- Google sign-in works end-to-end.
- Protected routes redirect to sign-in when logged out.
- `/api/prices/update` returns `200`.
- `/api/leads/signup` accepts valid consented signup.
- `/api/ai/optimize` returns `503` when `ANTHROPIC_API_KEY` is missing (expected) or valid response when set.

## Notes

- `npm run lint` uses `next lint` (deprecated warning in Next.js 15, still functional).
- Runtime telemetry TODOs exist in error boundaries for future Sentry wiring.

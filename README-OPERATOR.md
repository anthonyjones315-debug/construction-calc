# README-OPERATOR

Platform handoff for March 17, 2026.

This project is ready to be operated as an owner-facing estimating platform, not treated like a half-finished dev sandbox. The shared product copy is aligned to the current tri-county footprint, the retired markdown Field Notes structure has been removed, and the opening splash now points people toward the guide experience instead of the old beta email capture.

## What is live right now

- Pro Construction Calc is the active product name.
- Tri-county tax defaults are live for Oneida `8.75%`, Madison `8.00%`, and Herkimer `8.25%`.
- Saved estimates, estimate PDFs, invoice PDFs, and the financial dashboard are connected workflows.
- PostHog tracking runs through `/ingest` on non-homepage routes.
- Mobile users should reopen the live app to get the latest release because stale service workers are cleared on launch.
- `Field Notes` content lives in `src/data/field-notes.ts`.
- `Blog` content lives in `src/data/blog.ts`.

## Operator guides

- [01 Financial Audit](./docs/how-to/01-financial-audit.md)
- [02 Content Publishing](./docs/how-to/02-content-publishing.md)
- [03 Estimate To Invoice](./docs/how-to/03-estimate-to-invoice.md)
- [04 Troubleshooting Proxy](./docs/how-to/04-troubleshooting-proxy.md)
- [05 PWA Management](./docs/how-to/05-pwa-management.md)

## Morning start

If you are starting the day as the Owner, this is the shortest clean routine:

1. Open the app and confirm the splash routes cleanly into the guide experience.
2. Check `Saved Estimates` and the financial dashboard for billed, unbilled, and margin movement.
3. Review any estimate or invoice PDF you expect to send today.
4. If content is being published, update only the active content sources and keep live slugs stable.
5. If a field device looks stale, reopen the live app before assuming something is broken.

## Owner view of the platform

The platform is strongest today in four areas:

- Fast estimating and saved handoff
- Cents-perfect document checking
- Tri-county tax handling
- Clear operator workflows for publishing, analytics checks, and field refreshes

If something feels wrong tomorrow morning, start with the matching guide in `docs/how-to/` before treating it like a rebuild problem.

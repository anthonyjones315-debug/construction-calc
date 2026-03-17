# Changelog

All notable changes to Pro Construction Calc are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.1.2] - 2026-03-16

### Added

- No-scroll layout shell using `100dvh` and `overflow-hidden` across home, calculators, command center, saved estimates, and guides for stable mobile viewport behavior.
- Sentry Feedback + Session Replay on Login and Command Center pages with a "Report a bug" trigger.
- AI Material Optimizer endpoint and UI, plus Browserless-powered PDF generation with contractor-first, white-label estimate templates.
- Email 2FA with 6-digit OTP verification, resend cooldowns, replay-safe token cleanup, and branded Resend HTML security emails.

### Changed

- Wall Framing and Roofing calculators to use job-site terminology, staggered stud / advanced framing modes, OC presets, and roofing bundle/underlayment/nail breakdowns.
- Glossary and guide surfaces to match the command-theme brand system and updated Tri-County tax defaults with Oneida-focused defaults.
- CSP configuration and Termly loader behavior to reduce console noise while allowing consent API calls and Google identity flows.
- PWA behavior shifted from stale-worker avoidance to a proper registered service worker with installable, offline-fallback field behavior.

---

## [1.1.1] - 2026-03-16

### Added

- NYS tax engine service with Oneida 8.75% rate, capital improvement (ST-124) handling, and tax breakdown outputs.
- Capital Improvement toggle and compliant tax breakdown in the Tax Save calculator.
- Glossary and User Guide pages with schema markup, plus 2026 compliance guidance.
- Scraping compliance policy document and robots.txt guard helper.

### Changed

- User Guide updated with all-electric 2026 mandate and Marcy UDC reminders for regional bids.

---

## [1.1.0] - 2026-03-16

### Added

- Financial terminology database with reusable definitions and calculator input copy for business/management tools.

### Changed

- Profit Margin, Labor Rate, Lead Estimator, and Tax Save calculators now use industry-standard inputs, units, and outputs (bid price, CAC, loaded labor rates, tax impact).
- Calculator inputs reset to trade-appropriate defaults per tool, including financial calculators.

---

## [1.0.0] - 2026-03-15

### Added

- Sentry error boundary with `calculator_audit` context for field failure reporting.
- Unified Field Notes hub with Oneida County seed content (freeze-lines, retainage, insulation).
- Resend CRM infrastructure for branded estimates and client communication.

### Changed

- Visual brand purge: 0 placeholder images; industrial SVG icons across calculator categories.

### Fixed

- Rafter Pro Tip correction (slope and seat-cut guidance).
- Auth navigation (Back to Command Center link and styling).

---

[1.0.0]: https://github.com/anthonyjones/construction-calc/releases/tag/v1.0.0

## 2025-05-15 - Missing Authentication on sensitive API endpoints
**Vulnerability:** API endpoints like `/api/ai/optimize` and `/api/weather` were accessible without authentication, allowing potential abuse of paid third-party API quotas (Anthropic and Google Maps).
**Learning:** In a Next.js application without a global middleware for authentication, it is easy to forget manual `auth()` checks in individual Route Handlers.
**Prevention:** Always verify that every Route Handler in `src/app/api/` (except for public webhooks or intentionally public endpoints) includes an `auth()` check and is marked as `force-dynamic`.

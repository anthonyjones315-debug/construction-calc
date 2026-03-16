<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Pro Construction Calc. Events are captured across both client-side React components and server-side Next.js API routes and Server Actions. PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), and the server-side `getPostHogClient()` helper is used in all API routes. Users are identified on sign-in and registration so client and server events are correlated by distinct ID. The PostHog ingest proxy is configured via Next.js rewrites (`/ingest/*` → PostHog US servers), keeping analytics traffic first-party.

| Event | Description | File |
|---|---|---|
| `sign_in_attempted` | User attempted to sign in (Google OAuth or email/password) | `src/app/auth/signin/SignInClient.tsx` |
| `sign_in_failed` | Credentials sign-in failed due to invalid email or password | `src/app/auth/signin/SignInClient.tsx` |
| `user_registered` | New user account successfully created (server-side Server Action) | `src/app/register/actions.ts` |
| `estimate_saved` | Contractor saved a draft estimate to the database (server-side API route) | `src/app/api/estimates/save/route.ts` |
| `estimate_finalized` | Contractor finalized and sent an estimate for client signature — top conversion event | `src/app/api/estimates/finalize/route.ts` |
| `estimate_signed` | Client signed a finalized estimate via the public signing link | `src/app/api/sign/[code]/route.ts` |
| `estimate_emailed` | User sent an estimate via email from the EmailEstimateModal | `src/components/ui/EmailEstimateModal.tsx` |
| `pdf_generated` | User generated a PDF export of an estimate (server-side API route) | `src/app/api/generate-pdf/route.ts` |
| `lead_signup` | Visitor submitted their email for the waitlist/launch list | `src/app/api/leads/signup/route.ts` |
| `calculator_calculated` | User opened the Finalize modal, indicating they used a trade calculator and viewed results | `src/app/calculators/_components/CalculatorPage.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/344737/dashboard/1365680)
- [Estimate Conversion Funnel](https://us.posthog.com/project/344737/insights/hk9amybg) — Calculator Used → Estimate Finalized → Estimate Signed
- [Estimate Activity Over Time](https://us.posthog.com/project/344737/insights/g9KgrA2B) — Daily trend of all estimate lifecycle events
- [New User Registration Funnel](https://us.posthog.com/project/344737/insights/rVpW3Afd) — Sign In Attempted → User Registered
- [Lead Signups Over Time](https://us.posthog.com/project/344737/insights/WsmWXAnY) — Daily waitlist/launch list signups
- [Auth Health: Sign-In Attempts vs Failures](https://us.posthog.com/project/344737/insights/DaYZ9jfW) — Monitor authentication friction

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

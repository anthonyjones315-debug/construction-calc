# Clerk + Supabase

## Runtime sync (no SQL required)

- On each authenticated request, `auth()` in [`src/lib/auth/config.ts`](../auth/config.ts) calls `ensurePublicUserRecord` to upsert `public.users` and stores the stable UUID in Clerk **`publicMetadata.appUserId`**.
- API routes use the Supabase **service role** (`createServerClient`) and bypass RLS.

## Environment

Add to `.env.local` (or Vercel) so Clerk’s embedded routes match this app:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Optional fallbacks (see [Clerk redirect docs](https://clerk.com/docs/guides/development/customize-redirect-urls)).  
**This app also sets redirects in code** (so env fallbacks are optional):

- **Sign-in** ([`SignInClient`](../../app/sign-in/[[...sign-in]]/SignInClient.tsx)): defaults to `/command-center`; honors safe `callbackUrl`, `redirect_url`, or `next` query params.
- **Sign-up** ([`SignUpClient`](../../app/sign-up/[[...sign-up]]/SignUpClient.tsx)): defaults to `/settings#business-profile` so new accounts land on **Business Profile** setup.

```bash
# Optional — only if you want Clerk env to override app defaults
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/command-center
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/settings#business-profile
```

In the [Clerk Dashboard](https://dashboard.clerk.com/), add `/sign-in` and `/sign-up` to allowed paths / redirect URLs for your production domain.

### Crew join codes (same login as owners)

1. The owner shares the **join code** from Command Center (generated per business).
2. The crew member **creates a Clerk account or signs in**, then opens **Command Center** with no business yet.
3. They use **Join with code** on the setup screen ([`JoinBusinessWithCodeForm`](../../app/command-center/JoinBusinessWithCodeForm.tsx)), which calls `POST /api/command-center/join`.
4. The API uses the same `auth()` user id as the rest of the app (`public.users` id synced from Clerk). No separate “crew login” — it’s Clerk + invite code.

### “Publishable key not valid” (runtime)

Clerk validates `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` on the client. Fix it by doing **one** of the following:

1. **Use real keys from one Clerk application**  
   In [Dashboard → API keys](https://dashboard.clerk.com/last-active?path=api-keys), copy:
   - **Publishable key** — must start with `pk_test_` (dev) or `pk_live_` (prod).  
   - **Secret key** — must start with `sk_test_` or `sk_live_` and belong to the **same** instance.  
   Do not paste the secret key into `NEXT_PUBLIC_*`.

2. **Fix common `.env.local` mistakes**  
   - No quotes unless the whole value is quoted consistently; avoid smart quotes.  
   - No spaces around `=`.  
   - No line breaks in the middle of the key.  
   - Restart `npm run dev` after any change (Turbopack picks up env at process start).

3. **Keyless local dev**  
   Remove **both** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from `.env.local` so Clerk can use [keyless](https://clerk.com/docs/guides/development/clerk-environment-variables) mode. If you previously used keyless, delete a stale `.clerk/` directory in the repo root (if present), then restart dev.

4. **Production / Vercel**  
   Set the same variables in the host’s Environment Variables UI; `NEXT_PUBLIC_*` must be available at **build** time for Next.js.

### Content-Security-Policy / `Failed to load Clerk JS` / `https:///npm/...`

Clerk loads its browser bundle from `https://<your-instance-host>/npm/@clerk/clerk-js/...` (see [`loadClerkJsScript`](https://github.com/clerk/javascript) in `@clerk/shared`). If the publishable key is **wrong or truncated**, the SDK can’t resolve a host and tries to load `https:///npm/...` — the script fails, you may see **CSP `script-src` violations**, and **`ClerkRuntimeError: failed_to_load_clerk_js`**.

**Fix:** use the **full** publishable key from [Dashboard → API keys](https://dashboard.clerk.com/last-active?path=api-keys), or remove both Clerk keys for [keyless](https://clerk.com/docs/guides/development/clerk-environment-variables) dev. Do **not** set `NEXT_PUBLIC_CLERK_PROXY_URL` unless you use a [proxy](https://clerk.com/docs/guides/development/deployment/proxy); a bad or empty proxy can break the script URL the same way.

## Optional SQL

See [`clerk-supabase-migration.sql`](./clerk-supabase-migration.sql) for disabling the legacy `next_auth` → `public.users` trigger and optional `clerk_user_id` column.

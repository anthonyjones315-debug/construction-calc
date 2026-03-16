import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/
const FORMSPREE_URL = 'https://formspree.io/f/xyknwlrz'
const CONSENT_VERSION = '2026-03-13'

// Rate limit: 3 signups per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 600_000 })
    return true
  }
  if (entry.count >= 3) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: {
    email?: string
    source?: string
    marketingConsent?: boolean
    consentVersion?: string
  }
  try {
    body = await req.json() as { email?: string; source?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const source = (body.source ?? 'unknown').slice(0, 50)
  const consentVersion = (body.consentVersion ?? '').slice(0, 32)
  const marketingConsent = body.marketingConsent === true
  const userAgent = (req.headers.get('user-agent') ?? 'unknown').slice(0, 500)

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  if (!marketingConsent || consentVersion !== CONSENT_VERSION) {
    return NextResponse.json({ error: 'Explicit marketing consent is required.' }, { status: 400 })
  }

  // ── Step 1: Persist to Supabase using the service role key ───────────────────
  const db = createServerClient()
  const { error: dbError } = await db
    .from('email_signups')
    .insert({
      email,
      source,
      marketing_consent: true,
      consent_text: 'I agree to receive product updates and launch emails at this address. If marketing emails are sent, they will include unsubscribe instructions.',
      consent_version: consentVersion,
      consent_recorded_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    })

  if (dbError && dbError.code !== '23505') {
    // 23505 = unique violation (already signed up) — not a real error
    Sentry.captureException(dbError)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  // ── Step 2: Best-effort email notification (never blocks success response) ───
  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source }),
  }).catch(() => {
    // Non-critical — lead already persisted in Supabase
  })

  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: email,
    event: 'lead_signup',
    properties: { source },
  })
  posthog.identify({
    distinctId: email,
    properties: { email },
  })
  await posthog.shutdown()

  return NextResponse.json({ ok: true })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

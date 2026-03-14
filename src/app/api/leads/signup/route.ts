import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/
const FORMSPREE_URL = 'https://formspree.io/f/xyknwlrz'

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
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: { email?: string; source?: string }
  try {
    body = await req.json() as { email?: string; source?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const source = (body.source ?? 'unknown').slice(0, 50)

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // ── Step 1: Persist to Supabase (guaranteed, uses service role key) ──────────
  const db = createServerClient()
  const { error: dbError } = await db
    .from('email_signups')
    .insert({ email, source })

  if (dbError && dbError.code !== '23505') {
    // 23505 = unique violation (already signed up) — not a real error
    console.error('Lead signup DB error:', dbError.message)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }

  // ── Step 2: Best-effort email notification (never blocks success response) ───
  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source }),
  }).catch(() => {
    // Non-critical — lead already persisted in Supabase
  })

  return NextResponse.json({ ok: true })
}

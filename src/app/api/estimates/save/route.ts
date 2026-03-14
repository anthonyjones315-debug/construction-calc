import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'
import { ensurePublicUser } from '@/lib/supabase/ensurePublicUser'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name?: string
    calculator_id?: string
    results?: unknown[]
    inputs?: Record<string, unknown>
    total_cost?: number | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const db = createServerClient()
  await ensurePublicUser(db, session)
  const { data, error } = await db.from('saved_estimates').insert({
    user_id: session.user.id,
    name: (body.name ?? 'Untitled Estimate').slice(0, 200),
    calculator_id: (body.calculator_id ?? 'unknown').slice(0, 100),
    inputs: body.inputs ?? {},
    results: body.results ?? [],
    total_cost: body.total_cost ?? null,
  }).select('id').single()

  if (error) {
    console.error('Save estimate error:', error.message)
    return NextResponse.json({ error: 'Save failed.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

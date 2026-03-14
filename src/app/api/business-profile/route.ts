import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'
import { ensurePublicUser } from '@/lib/supabase/ensurePublicUser'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerClient()
  const { data, error } = await db
    .from('business_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found — that's fine (new user)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data ?? null })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const db = createServerClient()
  await ensurePublicUser(db, session)

  const { error } = await db
    .from('business_profiles')
    .upsert(
      {
        user_id:          session.user.id,
        business_name:    String(body.business_name    ?? '').slice(0, 200) || null,
        business_phone:   String(body.business_phone   ?? '').slice(0, 50)  || null,
        business_email:   String(body.business_email   ?? '').slice(0, 200) || null,
        business_address: String(body.business_address ?? '').slice(0, 500) || null,
        business_website: String(body.business_website ?? '').slice(0, 200) || null,
        logo_url:         body.logo_url ? String(body.logo_url).slice(0, 500) : null,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('business-profile PUT error:', error.message)
    return NextResponse.json({ error: 'Save failed.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

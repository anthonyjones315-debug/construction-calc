import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerClient()
  const { data, error } = await db
    .from('user_materials')
    .select('*')
    .eq('user_id', session.user.id)
    .order('category')
    .order('material_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('[materials POST] session.user.id:', session.user.id)

  const body = await req.json()
  const db = createServerClient()
  const { data, error } = await db
    .from('user_materials')
    .insert({
      user_id: session.user.id,
      material_name: String(body.material_name ?? '').slice(0, 200),
      category: String(body.category ?? 'Other').slice(0, 50),
      unit_type: String(body.unit_type ?? 'each').slice(0, 50),
      unit_cost: Number(body.unit_cost) || 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

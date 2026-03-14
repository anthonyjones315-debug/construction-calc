import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerClient()
  const { data, error } = await db
    .from('saved_estimates')
    .select('id, name, calculator_id, total_cost, created_at, results')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/estimates error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ estimates: data })
}

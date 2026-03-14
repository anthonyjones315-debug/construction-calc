import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const db = createServerClient()
  const { error } = await db
    .from('saved_estimates')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id) // scope to owner

  if (error) {
    console.error('DELETE /api/estimates/[id] error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from 'next-auth'

/**
 * Ensures the authenticated user exists in public.users.
 * The sync trigger handles new sign-ins, but existing sessions created before
 * the trigger was set up may be missing from public.users.
 */
export async function ensurePublicUser(db: SupabaseClient, session: Session) {
  const { user } = session
  await db.from('users').upsert(
    {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
    },
    { onConflict: 'id' }
  )
}

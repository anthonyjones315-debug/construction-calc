import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const supabaseReady = isValidHttpUrl(supabaseUrl) && supabaseServiceKey.length > 0

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],

  // Wire Supabase as the database adapter — saves users/sessions to your Supabase DB
  // Only active when env vars are present AND the URL is a valid HTTP/S URL
  adapter: supabaseReady
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseServiceKey })
    : undefined,

  callbacks: {
    session({ session, user }) {
      // Attach user ID to session so components can query saved estimates
      if (user?.id) session.user.id = user.id
      return session
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // JWT sessions when no adapter (local dev fallback), DB sessions when Supabase is active
  session: {
    strategy: supabaseReady ? 'database' : 'jwt',
  },
})

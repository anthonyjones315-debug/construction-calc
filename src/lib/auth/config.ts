import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],

  // Wire Supabase as the database adapter — saves users/sessions to your Supabase DB
  // Only active when env vars are present (safe for local dev without Supabase)
  adapter: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
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
    strategy: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'database' : 'jwt',
  },
})

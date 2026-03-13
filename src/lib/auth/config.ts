import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (user) session.user.id = user.id
      return session
    },
  },
  pages: { signIn: '/auth/signin', error: '/auth/error' },
})

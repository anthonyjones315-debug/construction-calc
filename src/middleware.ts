import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED = ['/saved', '/pricebook', '/settings']

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (PROTECTED.some(p => pathname.startsWith(p)) && !req.auth) {
    const signIn = new URL('/auth/signin', req.url)
    signIn.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signIn)
  }
})

export const config = {
  matcher: ['/saved/:path*', '/pricebook/:path*', '/settings/:path*'],
}

'use client'

import { AuthSessionProvider } from '@/lib/auth/client'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>
}

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from 'next-auth/react'
import { Bookmark } from 'lucide-react'

export default function SavedPage() {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1 bg-[--color-bg]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[--color-orange-soft] flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-7 h-7 text-[--color-orange-brand]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-2">Saved Estimates</h1>
            <p className="text-[--color-ink-dim]">Your saved estimates will appear here. This feature is coming soon.</p>
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
}

'use client'
export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Bookmark, FileDown, Trash2, Calculator, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface SavedEstimate {
  id: string
  name: string
  calculator_id: string
  total_cost: number | null
  created_at: string
  results: { label: string; value: string | number; unit?: string; highlight?: boolean }[]
}

function SavedContent() {
  const { data: session, status } = useSession()
  const [estimates, setEstimates] = useState<SavedEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) { setLoading(false); return }

    supabase
      .from('saved_estimates')
      .select('id, name, calculator_id, total_cost, created_at, results')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setEstimates(data as SavedEstimate[])
        setLoading(false)
      })
  }, [session, status])

  async function deleteEstimate(id: string) {
    setDeleting(id)
    await supabase.from('saved_estimates').delete().eq('id', id)
    setEstimates(prev => prev.filter(e => e.id !== id))
    setDeleting(null)
  }

  async function downloadPDF(estimate: SavedEstimate) {
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { EstimatePDF } = await import('@/components/pdf/EstimatePDF')
      const React = (await import('react')).default
      // @ts-expect-error react-pdf typing mismatch with React 19
      const blob = await pdf(React.createElement(EstimatePDF, {
        data: {
          title: estimate.name,
          calculatorLabel: estimate.calculator_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results: estimate.results as any,
          generatedAt: new Date(estimate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }
      })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${estimate.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('PDF export failed — try again')
      setTimeout(() => setDownloadError(null), 4000)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[--color-orange-soft] flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-[--color-orange-brand]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-2">Sign In to View Saved Estimates</h1>
        <p className="text-[--color-ink-dim] mb-6">Create a free account to save estimates and access them from any device.</p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          Sign In Free
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-[--color-ink]">Saved Estimates</h1>
          <p className="text-sm text-[--color-ink-dim] mt-1">{estimates.length} estimate{estimates.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Link
          href="/calculators"
          className="flex items-center gap-2 text-sm font-medium bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white px-4 py-2 rounded-lg transition-all"
        >
          <Calculator className="w-4 h-4" aria-hidden />
          New Estimate
        </Link>
      </div>

      {downloadError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-4">{downloadError}</p>
      )}

      {estimates.length === 0 ? (
        <div className="text-center py-16 bg-[--color-surface] rounded-2xl border border-gray-200/80">
          <Bookmark className="w-12 h-12 text-[--color-ink-dim] mx-auto mb-4 opacity-40" />
          <p className="text-[--color-ink-dim] mb-4">No saved estimates yet.</p>
          <Link
            href="/calculators"
            className="text-[--color-orange-brand] font-medium hover:underline text-sm"
          >
            Run your first calculation →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {estimates.map(est => {
            const hero = est.results?.find(r => r.highlight)
            return (
              <div
                key={est.id}
                className="bg-[--color-surface] rounded-xl border border-gray-200/80 shadow-sm p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[--color-ink] truncate">{est.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[--color-ink-dim]">
                      {new Date(est.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {hero && (
                      <span className="text-xs font-bold text-[--color-orange-brand]">
                        {hero.value} {hero.unit}
                      </span>
                    )}
                    {est.total_cost && (
                      <span className="text-xs font-bold text-green-600">
                        ${est.total_cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadPDF(est)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[--color-orange-brand] border border-[--color-orange-brand]/30 hover:border-[--color-orange-brand] px-2.5 py-1.5 rounded-lg transition-all"
                    title="Download PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" aria-hidden />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteEstimate(est.id)}
                    disabled={deleting === est.id}
                    className="flex items-center p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete estimate"
                    aria-label="Delete estimate"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SavedPage() {
  return (

      <div className="flex flex-col min-h-screen bg-[--color-bg]">
        <Header />
        <main id="main-content" className="flex-1">
          <SavedContent />
        </main>
        <Footer />
      </div>

  )
}

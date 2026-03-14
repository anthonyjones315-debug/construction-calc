'use client'
import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import type { CalculationResult } from '@/types'

interface PDFButtonProps {
  results: CalculationResult[]
  calculatorLabel: string
  projectName?: string
}

async function generateAndDownload(
  results: CalculationResult[],
  calculatorLabel: string,
  projectName?: string
) {
  const { pdf } = await import('@react-pdf/renderer')
  const { EstimatePDF } = await import('./EstimatePDF')
  const React = (await import('react')).default

  const estimateData = {
    title: projectName ?? `${calculatorLabel} Estimate`,
    calculatorLabel,
    results,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
  }

  // @ts-expect-error react-pdf typing mismatch with React 19
  const blob = await pdf(React.createElement(EstimatePDF, { data: estimateData })).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${calculatorLabel.toLowerCase().replace(/\s+/g, '-')}-estimate.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Free export — no account required */
export function ExportPDFButton({ results, calculatorLabel, projectName }: PDFButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    if (!results.length) return
    setLoading(true)
    setError('')
    try {
      await generateAndDownload(results, calculatorLabel, projectName)
    } catch (err) {
      console.error('PDF export error:', err)
      setError('Export failed — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={loading || !results.length}
        className="flex items-center gap-1.5 text-sm font-semibold border border-[--color-orange-brand]/40 hover:border-[--color-orange-brand] hover:bg-[--color-orange-soft] text-[--color-orange-brand] px-4 py-2.5 rounded-lg transition-all disabled:opacity-40 whitespace-nowrap min-h-[44px]"
        title="Download PDF — no account needed"
        aria-label="Export estimate as PDF"
      >
        {loading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Generating…</>
          : <><FileDown className="w-3.5 h-3.5" aria-hidden /> Export PDF</>
        }
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/** Save PDF — account required, saves to Supabase then downloads */
export function SavePDFButton({ results, calculatorLabel, projectName }: PDFButtonProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Hidden when not signed in
  if (!session) return null

  async function handleSave() {
    if (!results.length) return
    setLoading(true)
    setError('')
    try {
      // Save to Supabase
      if (session?.user?.id) {
        const { supabase } = await import('@/lib/supabase/client')
        await supabase.from('saved_estimates').insert({
          user_id: session.user.id,
          name: projectName ?? `${calculatorLabel} Estimate`,
          calculator_id: calculatorLabel.toLowerCase().replace(/\s+/g, '_'),
          inputs: {},
          results: results as unknown as Record<string, unknown>[],
          total_cost: null,
        })
      }
      // Download PDF
      await generateAndDownload(results, calculatorLabel, projectName)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save PDF error:', err)
      setError('Save failed — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSave}
        disabled={loading || !results.length}
        className="flex items-center gap-1.5 text-sm font-semibold bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white px-4 py-2.5 rounded-lg transition-all disabled:opacity-40 whitespace-nowrap shadow-sm min-h-[44px]"
        title="Save estimate and download PDF"
      >
        {loading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Saving…</>
          : saved
          ? <>✓ Saved!</>
          : <><FileDown className="w-3.5 h-3.5" aria-hidden /> Save PDF</>
        }
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/** Combined — always shows Export PDF, shows Save PDF only when signed in */
export function PDFButtonGroup(props: PDFButtonProps) {
  const { data: session } = useSession()
  return (
    <div className="flex items-center gap-2">
      <ExportPDFButton {...props} />
      {session && <SavePDFButton {...props} />}
    </div>
  )
}

export function PDFButton(props: PDFButtonProps) {
  return <PDFButtonGroup {...props} />
}

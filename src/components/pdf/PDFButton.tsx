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

export function PDFButton({ results, calculatorLabel, projectName }: PDFButtonProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!results.length) return
    setLoading(true)

    try {
      // Dynamically import PDF renderer to keep initial bundle small
      const { pdf, Document, Page } = await import('@react-pdf/renderer')
      const { EstimatePDF } = await import('./EstimatePDF')
      const React = (await import('react')).default

      const estimateData = {
        title: projectName ?? `${calculatorLabel} Estimate`,
        calculatorLabel,
        results,
        generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      }

      // @ts-expect-error react-pdf typing mismatch with React 19
      const blob = await pdf(React.createElement(EstimatePDF, { data: estimateData })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${calculatorLabel.toLowerCase().replace(/\s+/g, '-')}-estimate.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <button
        onClick={() => { import('next-auth/react').then(m => m.signIn()) }}
        className="flex items-center gap-1.5 text-xs font-medium text-[--color-orange-brand] border border-[--color-orange-brand]/30 hover:border-[--color-orange-brand] px-3 py-2 rounded-lg transition-all whitespace-nowrap"
        title="Sign in to export PDF"
      >
        <FileDown className="w-3.5 h-3.5" />
        Save PDF
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || !results.length}
      className="flex items-center gap-1.5 text-xs font-medium bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white px-3 py-2 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
    >
      {loading ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting…</>
      ) : (
        <><FileDown className="w-3.5 h-3.5" /> Save PDF</>
      )}
    </button>
  )
}

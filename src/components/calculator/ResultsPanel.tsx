'use client'
import type { CalculationResult } from '@/types'
import { cn } from '@/utils/cn'

interface ResultsPanelProps {
  results: CalculationResult[]
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results.length) {
    return (
      <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <p className="text-sm text-[--color-ink-dim] text-center py-4">Enter values to see results</p>
      </div>
    )
  }

  const highlighted = results.filter(r => r.highlight)
  const rest = results.filter(r => !r.highlight)

  return (
    <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">Results</h2>
      </div>

      {/* Hero results */}
      {highlighted.map((r, i) => (
        <div key={i} className="mx-4 mb-3 rounded-xl bg-gradient-to-br from-[--color-orange-brand] to-[--color-orange-dark] p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{r.label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-display font-bold">{r.value}</span>
            <span className="text-sm opacity-80">{r.unit}</span>
          </div>
          {r.description && <p className="text-xs opacity-70 mt-1">{r.description}</p>}
        </div>
      ))}

      {/* Secondary results */}
      {rest.length > 0 && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {rest.map((r, i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl bg-[--color-surface-alt] border border-gray-100 p-3',
                rest.length % 2 !== 0 && i === rest.length - 1 && 'col-span-2'
              )}
            >
              <p className="text-xs text-[--color-ink-dim] font-medium uppercase tracking-wider">{r.label}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-display font-bold text-[--color-ink]">{r.value}</span>
                <span className="text-xs text-[--color-ink-dim]">{r.unit}</span>
              </div>
              {r.description && <p className="text-xs text-[--color-ink-dim] mt-0.5">{r.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

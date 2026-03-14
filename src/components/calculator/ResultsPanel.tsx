'use client'
import type { CalculationResult } from '@/types'
import { useStore } from '@/lib/store'
import { cn } from '@/utils/cn'

interface ResultsPanelProps {
  results: CalculationResult[]
}

/** Extract a numeric dollar amount from a result, or null if it's not a cost row. */
function parseCostValue(r: CalculationResult): number | null {
  if (r.unit === '$') {
    const n = parseFloat(String(r.value))
    return isFinite(n) ? n : null
  }
  if (typeof r.value === 'string' && r.value.startsWith('$')) {
    const n = parseFloat(r.value.slice(1))
    return isFinite(n) ? n : null
  }
  return null
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const { taxRate, setTaxRate } = useStore()

  if (!results.length) {
    return (
      <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <p className="text-sm text-[--color-ink-dim] text-center py-4">Enter values to see results</p>
      </div>
    )
  }

  const highlighted = results.filter(r => r.highlight)
  const rest = results.filter(r => !r.highlight)

  // Sum all cost values in the results
  const costTotal = results.reduce<number | null>((acc, r) => {
    const c = parseCostValue(r)
    if (c === null) return acc
    return (acc ?? 0) + c
  }, null)

  const hasCost = costTotal !== null && costTotal > 0
  const tax = hasCost && taxRate > 0 ? Math.round(costTotal! * taxRate) / 100 : 0
  const withTax = hasCost ? costTotal! + tax : 0

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

      {/* Tax section — only shown when results include a cost */}
      {hasCost && (
        <div className="mx-4 mb-4 rounded-xl border border-gray-200/80 bg-[--color-surface-alt] p-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label htmlFor="tax-rate" className="text-xs font-bold uppercase tracking-wider text-[--color-ink-dim]">
              Sales Tax
            </label>
            <div className="flex items-center gap-1">
              <input
                id="tax-rate"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={taxRate}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  setTaxRate(isFinite(v) ? Math.min(30, Math.max(0, v)) : 0)
                }}
                className="w-16 px-2 py-1 text-sm text-right rounded-lg border border-gray-200 bg-[--color-surface] text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
                aria-label="Tax rate percentage"
              />
              <span className="text-xs text-[--color-ink-dim]">%</span>
            </div>
          </div>

          {taxRate > 0 ? (
            <div className="space-y-1 pt-1 border-t border-gray-200/60">
              <div className="flex justify-between text-xs text-[--color-ink-dim]">
                <span>Subtotal</span>
                <span>${costTotal!.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[--color-ink-dim]">
                <span>Tax ({taxRate}%)</span>
                <span>+${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[--color-ink] pt-1 border-t border-gray-200/60">
                <span>Total with Tax</span>
                <span className="text-[--color-orange-brand]">${withTax.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[--color-ink-dim]">Enter your local rate to see taxed total</p>
          )}
        </div>
      )}
    </div>
  )
}

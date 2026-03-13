'use client'
import { useStore } from '@/lib/store'
import { CATEGORIES, CALCULATORS } from '@/data'
import type { CalculatorId } from '@/types'
import { cn } from '@/utils/cn'

export function Sidebar() {
  const { activeCalculator, setActiveCalculator } = useStore()

  return (
    <aside
      className="w-60 shrink-0 bg-[--color-nav-bg] text-[--color-nav-text] flex flex-col overflow-y-auto"
      aria-label="Calculator navigation"
    >
      <div className="py-4 px-3 flex flex-col gap-1">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="mb-1">
            {/* Category header */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 select-none">
              {cat.emoji} {cat.label}
            </div>

            {/* Calculators in category */}
            {cat.calculators.map(calcId => {
              const calc = CALCULATORS.find(c => c.id === calcId)
              if (!calc) return null
              const isActive = activeCalculator === calcId

              return (
                <button
                  key={calcId}
                  onClick={() => setActiveCalculator(calcId as CalculatorId)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    'flex items-center gap-2.5',
                    isActive
                      ? 'bg-[--color-orange-brand] text-white font-semibold'
                      : 'hover:bg-white/8 hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-base leading-none" aria-hidden>{calc.emoji}</span>
                  <span className="truncate">{calc.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom promo */}
      <div className="mt-auto mx-3 mb-4 p-3 rounded-xl bg-[--color-orange-brand]/10 border border-[--color-orange-brand]/20">
        <p className="text-xs text-[--color-orange-brand] font-semibold mb-1">PDF Export</p>
        <p className="text-[11px] text-white/50 leading-relaxed">Save any estimate as a pro PDF. Sign in to unlock.</p>
      </div>
    </aside>
  )
}

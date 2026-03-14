'use client'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { CATEGORIES, CALCULATORS } from '@/data'
import type { CalculatorId } from '@/types'
import { cn } from '@/utils/cn'
import { Home } from 'lucide-react'

export function Sidebar() {
  const { activeCalculator, setActiveCalculator } = useStore()

  return (
    <aside
      className="w-56 shrink-0 flex flex-col overflow-y-auto"
      style={{ background: 'var(--color-nav-bg)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      aria-label="Calculator navigation"
    >
      {/* Home link */}
      <div className="px-3 pt-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f9fafb'
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#9ca3af'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Home className="w-4 h-4" aria-hidden />
          Home
        </Link>
      </div>

      {/* Calculator groups */}
      <nav className="py-3 px-3 flex flex-col gap-0.5 flex-1" aria-label="Calculators">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="mb-1">
            {/* Category label — aria-hidden, decorative */}
            <div
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest select-none"
              style={{ color: '#4b5563' }}
              aria-hidden
            >
              {cat.label}
            </div>

            {cat.calculators.map(calcId => {
              const calc = CALCULATORS.find(c => c.id === calcId)
              if (!calc) return null
              const isActive = activeCalculator === calcId

              return (
                <button
                  key={calcId}
                  onClick={() => setActiveCalculator(calcId as CalculatorId)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2.5"
                  style={isActive
                    ? { background: '#e8820c', color: '#ffffff', fontWeight: '600' }
                    : { background: 'transparent', color: '#d1d5db' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = '#f9fafb'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#d1d5db'
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-sm leading-none shrink-0" aria-hidden>{calc.emoji}</span>
                  <span className="truncate">{calc.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Free PDF promo — ADA: #fb923c on rgba(232,130,12,0.15) bg = visible */}
      <div
        className="mx-3 mb-4 p-3 rounded-xl"
        style={{ background: 'rgba(232,130,12,0.12)', border: '1px solid rgba(232,130,12,0.25)' }}
      >
        <p className="text-xs font-bold mb-1" style={{ color: '#fb923c' }}>📄 Free PDF Export</p>
        <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
          Export any estimate as PDF instantly — no sign-in needed.
        </p>
      </div>
    </aside>
  )
}

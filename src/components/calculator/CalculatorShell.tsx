'use client'
import { useEffect, useId, useRef } from 'react'
import { useStore } from '@/lib/store'
import { CALCULATORS } from '@/data'
import { ResultsPanel } from './ResultsPanel'
import { AIOptimizer } from '@/components/ai/AIOptimizer'
import { PDFButton } from '@/components/pdf/PDFButton'
import type { CalculationResult } from '@/types'
import { cn } from '@/utils/cn'

const AFFILIATE_ADS: Partial<Record<string, { label: string; cta: string; href: string }>> = {
  sprayfoam:  { label: 'Spray Foam Insulation Kit', cta: 'Shop on Amazon',  href: 'https://amzn.to/4cGL1qN' },
  flooring:   { label: 'Flooring & Underlayment',   cta: 'Shop on Amazon',  href: 'https://amzn.to/4br0GZ4' },
  roofPitch:  { label: 'Roof Pitch Gauge & Tools',  cta: 'Shop on Amazon',  href: 'https://amzn.to/411y17Z' },
  framing:    { label: 'Framing Nailers & Guns',    cta: 'Shop on Amazon',  href: 'https://amzn.to/3P4YsXS' },
  paint:      { label: 'Paint Sprayers & Supplies', cta: 'Shop on Amazon',  href: 'https://amzn.to/4lsT3Wo' },
}

function AffiliateAd({ calcId }: { calcId: string }) {
  const ad = AFFILIATE_ADS[calcId]
  if (!ad) return null
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-[--color-surface] px-5 py-3.5 shadow-sm hover:border-[--color-orange-brand]/40 hover:shadow-md transition-all group"
      aria-label={`Sponsored: ${ad.label} — ${ad.cta}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl" aria-hidden>🛒</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-dim]">Sponsored</p>
          <p className="text-sm font-semibold text-[--color-ink] truncate">{ad.label}</p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-[--color-orange-brand] group-hover:underline whitespace-nowrap">{ad.cta} →</span>
    </a>
  )
}

interface CalculatorShellProps {
  children: React.ReactNode
  results: CalculationResult[]
  showPDF?: boolean
}

// Shared input wrappers ────────────────────────────────────────────

interface NumInputProps {
  label?: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  id?: string
}

export function NumInput({ label, value, onChange, min = 0, max = 10000, step = 1, unit, id }: NumInputProps) {
  const autoId = useId()
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : autoId)
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[--color-ink-mid]">
          {label}{unit && <span className="text-[--color-ink-dim] font-normal ml-1">({unit})</span>}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (isFinite(v)) onChange(Math.max(min, Math.min(max, v)))
        }}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] text-base"
      />
    </div>
  )
}

interface SelectInputProps {
  label?: string
  value: string | number
  onChange: (v: string) => void
  options: { value: string | number; label: string }[]
  id?: string
}

export function SelectInput({ label, value, onChange, options, id }: SelectInputProps) {
  const autoId = useId()
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : autoId)
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[--color-ink-mid]">{label}</label>}
      <select
        id={inputId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] text-base appearance-none"
      >
        {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  )
}

interface ToggleGroupProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string | number; label: string }[]
}

export function ToggleGroup({ label, value, onChange, options }: ToggleGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[--color-ink-mid]">{label}</span>
      <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-[--color-surface-alt]" role="group" aria-label={label}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(String(o.value))}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-all',
              value === o.value
                ? 'bg-[--color-orange-brand] text-white'
                : 'text-[--color-ink-mid] hover:bg-white/50'
            )}
            aria-pressed={value === o.value}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface WasteInputProps {
  value?: number
  waste?: number           // alias for value
  onChange?: (v: number) => void
  onWasteChange?: (v: number) => void  // alias for onChange
  enabled?: boolean
  includeWaste?: boolean   // alias for enabled
  onToggle?: (v: boolean) => void
  onIncludeChange?: (v: boolean) => void  // alias for onToggle
}

export function WasteInput({ value, waste, onChange, onWasteChange, enabled, includeWaste, onToggle, onIncludeChange }: WasteInputProps) {
  const resolvedValue   = value   ?? waste          ?? 10
  const resolvedEnabled = enabled ?? includeWaste   ?? true
  const resolvedOnChange: (v: number) => void  = onChange        ?? onWasteChange  ?? ((_v) => undefined)
  const resolvedOnToggle: (v: boolean) => void = onToggle        ?? onIncludeChange ?? ((_v) => undefined)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[--color-ink-mid]">Waste Factor</span>
        <label className="flex items-center gap-1.5 text-sm text-[--color-ink-dim] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={resolvedEnabled}
            onChange={e => resolvedOnToggle(e.target.checked)}
            className="accent-[--color-orange-brand] w-4 h-4"
          />
          Include
        </label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={resolvedValue}
          onChange={e => resolvedOnChange(Number(e.target.value))}
          disabled={!resolvedEnabled}
          className="flex-1 accent-[--color-orange-brand] disabled:opacity-40"
          aria-label={`Waste factor: ${resolvedValue}%`}
        />
        <span className="text-sm font-mono font-bold text-[--color-orange-brand] w-10 text-right">{resolvedValue}%</span>
      </div>
    </div>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  id?: string
}

export function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : autoId)
  return (
    <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-[--color-ink-mid] cursor-pointer select-none">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="accent-[--color-orange-brand] w-4 h-4"
      />
      {label}
    </label>
  )
}

export function InputGroup({ label, unit, description, children }: { label?: string; unit?: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      {label && <p className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">{label}{unit && <span className="font-normal normal-case text-[--color-ink-dim] ml-1">({unit})</span>}</p>}
      {description && <p className="text-xs text-[--color-ink-dim] -mt-1">{description}</p>}
      {children}
    </div>
  )
}

// Calculator Shell ────────────────────────────────────────────────

export function CalculatorShell({ children, results, showPDF = true }: CalculatorShellProps) {
  const { activeCalculator } = useStore()
  const calc = CALCULATORS.find(c => c.id === activeCalculator)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  // On mobile, scroll results into view when they first populate
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (results.length > 0 && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [results])

  if (!calc) return null

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-display font-bold text-[--color-ink] flex items-center gap-2">
              <span aria-hidden>{calc.emoji}</span>
              {calc.label}
            </h1>
            <p className="text-sm text-[--color-ink-dim] mt-1">{calc.seoBlurb}</p>
          </div>
          {showPDF && results.length > 0 && (
            <PDFButton results={results} calculatorLabel={calc.label} />
          )}
        </div>
      </div>

      {/* Two-column layout → stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-5">
            Inputs
          </h2>
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Results + AI */}
        <div ref={resultsRef} className="flex flex-col gap-4">
          <ResultsPanel results={results} />
          <AIOptimizer results={results} />
        </div>
      </div>

      <AffiliateAd calcId={activeCalculator} />
    </div>
  )
}

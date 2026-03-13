'use client'
import { useStore } from '@/lib/store'
import { CALCULATORS } from '@/data'
import { ResultsPanel } from './ResultsPanel'
import { AIOptimizer } from '@/components/ai/AIOptimizer'
import { PDFButton } from '@/components/pdf/PDFButton'
import type { CalculationResult } from '@/types'
import { cn } from '@/utils/cn'

interface CalculatorShellProps {
  children: React.ReactNode
  results: CalculationResult[]
  showPDF?: boolean
}

export function CalculatorShell({ children, results, showPDF = true }: CalculatorShellProps) {
  const { activeCalculator } = useStore()
  const calc = CALCULATORS.find(c => c.id === activeCalculator)

  if (!calc) return null

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-[--color-ink] flex items-center gap-2">
              <span aria-hidden>{calc.emoji}</span>
              {calc.label}
            </h1>
            <p className="text-sm text-[--color-ink-dim] mt-1">{calc.seoBlurb}</p>
          </div>
          {showPDF && (
            <PDFButton results={results} calculatorLabel={calc.label} />
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-5">
            Inputs
          </h2>
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Results + AI */}
        <div className="flex flex-col gap-4">
          <ResultsPanel results={results} />
          <AIOptimizer results={results} />
        </div>
      </div>
    </div>
  )
}

// ─── Reusable Input Components ────────────────────────────────────────────────

interface InputGroupProps {
  label: string
  unit?: string
  children: React.ReactNode
  description?: string
}

export function InputGroup({ label, unit, children, description }: InputGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[--color-ink] mb-1.5">
        {label}
        {unit && <span className="text-[--color-ink-dim] font-normal ml-1">({unit})</span>}
      </label>
      {children}
      {description && <p className="text-xs text-[--color-ink-dim] mt-1">{description}</p>}
    </div>
  )
}

interface NumInputProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

export function NumInput({ value, onChange, min = 0, max, step = 0.1, placeholder }: NumInputProps) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt]
        text-[--color-ink] text-sm
        focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] focus:border-transparent
        transition-all"
    />
  )
}

interface SelectInputProps<T extends string | number> {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
}

export function SelectInput<T extends string | number>({ value, onChange, options }: SelectInputProps<T>) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt]
        text-[--color-ink] text-sm
        focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] focus:border-transparent
        transition-all appearance-none cursor-pointer"
    >
      {options.map(o => (
        <option key={String(o.value)} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

interface WasteInputProps {
  waste: number
  includeWaste: boolean
  onWasteChange: (v: number) => void
  onIncludeChange: (v: boolean) => void
}

export function WasteInput({ waste, includeWaste, onWasteChange, onIncludeChange }: WasteInputProps) {
  return (
    <div className="pt-2 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[--color-ink]">Waste Factor</label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-[--color-ink-dim]">Include</span>
          <div
            onClick={() => onIncludeChange(!includeWaste)}
            className={cn(
              'w-9 h-5 rounded-full transition-colors cursor-pointer',
              includeWaste ? 'bg-[--color-orange-brand]' : 'bg-gray-300'
            )}
            role="switch"
            aria-checked={includeWaste}
          >
            <div className={cn(
              'w-4 h-4 bg-white rounded-full shadow-sm transition-transform m-0.5',
              includeWaste ? 'translate-x-4' : 'translate-x-0'
            )} />
          </div>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={25}
          step={1}
          value={waste}
          onChange={e => onWasteChange(parseInt(e.target.value))}
          disabled={!includeWaste}
          className="flex-1 accent-[--color-orange-brand] disabled:opacity-40"
          aria-label={`Waste ${waste}%`}
        />
        <span className={cn('text-sm font-mono font-bold w-10 text-right', includeWaste ? 'text-[--color-orange-brand]' : 'text-gray-300')}>
          {waste}%
        </span>
      </div>
    </div>
  )
}

interface ToggleGroupProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
}

export function ToggleGroup<T extends string>({ value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div className="flex rounded-xl border border-gray-200 overflow-hidden">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-all',
            value === o.value
              ? 'bg-[--color-orange-brand] text-white'
              : 'bg-[--color-surface-alt] text-[--color-ink-dim] hover:bg-gray-100'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'w-4.5 h-4.5 rounded flex items-center justify-center border transition-all',
          checked
            ? 'bg-[--color-orange-brand] border-[--color-orange-brand]'
            : 'border-gray-300 bg-white group-hover:border-[--color-orange-brand]'
        )}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-[--color-ink]">{label}</span>
    </label>
  )
}

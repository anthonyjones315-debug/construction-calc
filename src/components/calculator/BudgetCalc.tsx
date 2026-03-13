'use client'
import { useState } from 'react'
import { Plus, Trash2, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { MARKET_PRICES_BASE, PROJECT_PRESETS } from '@/data'
import type { BudgetItem } from '@/types'
import { AIOptimizer } from '@/components/ai/AIOptimizer'
import { PDFButton } from '@/components/pdf/PDFButton'
import type { CalculationResult } from '@/types'

export function BudgetCalc() {
  const {
    budgetItems, addBudgetItem, removeBudgetItem, updateBudgetItemPrice,
    setBudgetItems, marketPrices, setMarketPrices,
    selectedMaterial, setSelectedMaterial, materialQty, setMaterialQty,
    isUpdatingPrices, setIsUpdatingPrices,
  } = useStore()

  const [activePreset, setActivePreset] = useState<string | null>(null)

  const total = budgetItems.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

  // Convert budget items to CalculationResult[] for AI + PDF
  const budgetResults: CalculationResult[] = [
    { label: 'Total Estimate', value: `$${total.toFixed(2)}`, unit: '', highlight: true },
    ...budgetItems.map(item => ({
      label: item.name,
      value: `$${(item.quantity * item.pricePerUnit).toFixed(2)}`,
      unit: '',
      description: `${item.quantity} ${item.unit} × $${item.pricePerUnit}`,
    })),
  ]

  function addMaterial() {
    if (!selectedMaterial || materialQty <= 0) return
    const price = marketPrices[selectedMaterial]
    if (!price) return
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      name: selectedMaterial,
      quantity: materialQty,
      unit: price.unit,
      pricePerUnit: price.price,
    }
    addBudgetItem(newItem)
  }

  function loadPreset(key: string) {
    const preset = PROJECT_PRESETS[key]
    if (!preset) return
    setActivePreset(key)
    const items: BudgetItem[] = preset.budget.map(b => {
      const price = marketPrices[b.name] ?? { price: 0, unit: 'ea' }
      return {
        id: crypto.randomUUID(),
        name: b.name,
        quantity: b.quantity,
        unit: price.unit,
        pricePerUnit: price.price,
      }
    })
    setBudgetItems(items)
  }

  async function updatePrices() {
    setIsUpdatingPrices(true)
    try {
      const res = await fetch('/api/prices/update', { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { prices: typeof MARKET_PRICES_BASE }
        setMarketPrices(data.prices)
      }
    } catch { /* use existing prices */ }
    finally { setIsUpdatingPrices(false) }
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[--color-ink]">💰 Budget Tracker</h1>
          <p className="text-sm text-[--color-ink-dim] mt-1">Build a material list with live pricing estimates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={updatePrices}
            disabled={isUpdatingPrices}
            className="flex items-center gap-1.5 text-xs text-[--color-ink-dim] hover:text-[--color-ink] border border-gray-200 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
            title="Update prices with AI"
          >
            {isUpdatingPrices
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Prices
          </button>
          <PDFButton results={budgetResults} calculatorLabel="Budget Tracker" />
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-3">Project Presets</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PROJECT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                activePreset === key
                  ? 'bg-[--color-orange-brand] text-white border-[--color-orange-brand]'
                  : 'bg-white text-[--color-ink] border-gray-200 hover:border-[--color-orange-brand]'
              }`}
            >
              {preset.emoji} {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Material */}
        <div className="lg:col-span-1 bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-4">Add Material</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[--color-ink] mb-1.5">Material</label>
              <select
                value={selectedMaterial}
                onChange={e => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] appearance-none"
              >
                {Object.keys(marketPrices).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-ink] mb-1.5">
                Quantity
                {selectedMaterial && marketPrices[selectedMaterial] && (
                  <span className="text-[--color-ink-dim] font-normal ml-1">
                    ({marketPrices[selectedMaterial].unit})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={materialQty}
                min={0.01}
                step={0.01}
                onChange={e => setMaterialQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
            </div>
            {selectedMaterial && marketPrices[selectedMaterial] && (
              <p className="text-xs text-[--color-ink-dim]">
                Unit price: ${marketPrices[selectedMaterial].price.toFixed(2)} / {marketPrices[selectedMaterial].unit}
              </p>
            )}
            <button
              onClick={addMaterial}
              className="w-full flex items-center justify-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add to List
            </button>
          </div>
        </div>

        {/* Line Items */}
        <div className="lg:col-span-2 bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">Materials</h2>
            {budgetItems.length > 0 && (
              <button onClick={() => setBudgetItems([])} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {budgetItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-[--color-ink-dim]">
              Add materials above or load a project preset to get started
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {budgetItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[--color-ink] truncate">{item.name}</p>
                    <p className="text-xs text-[--color-ink-dim]">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[--color-ink-dim]">$</span>
                    <input
                      type="number"
                      value={item.pricePerUnit}
                      step={0.01}
                      min={0}
                      onChange={e => updateBudgetItemPrice(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20 text-sm text-right px-2 py-1 rounded-lg border border-gray-200 bg-[--color-surface-alt] focus:outline-none focus:ring-1 focus:ring-[--color-orange-brand]"
                      title="Unit price"
                    />
                    <span className="text-xs text-[--color-ink-dim]">/{item.unit}</span>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm font-bold text-[--color-ink]">
                      ${(item.quantity * item.pricePerUnit).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBudgetItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {budgetItems.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-[--color-surface-alt] flex items-center justify-between">
              <span className="text-sm font-bold text-[--color-ink] uppercase tracking-wide">Total Estimate</span>
              <span className="text-2xl font-display font-bold text-[--color-orange-brand]">
                ${total.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Analyzer */}
      <AIOptimizer
        results={budgetResults}
        context={`Budget tracker with ${budgetItems.length} line items, total $${total.toFixed(2)}`}
      />
    </div>
  )
}

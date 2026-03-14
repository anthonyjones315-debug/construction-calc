import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CalculatorId, BudgetItem, AIAnalysis, MarketPrices } from '@/types'
import { MARKET_PRICES_BASE } from '@/data'

// ─── Calculator Input State ───────────────────────────────────────────────────

interface ConcreteState {
  type: 'slab' | 'footing' | 'forms'
  length: number; width: number; thickness: number
  bagSize: 80 | 60; waste: number; includeWaste: boolean
}

interface FramingState {
  wallLength: number; wallHeight: number; spacing: 12 | 16 | 24
  hasSheathing: boolean; hasDrywall: boolean; waste: number; includeWaste: boolean
}

interface RoofingState {
  length: number; width: number; pitch: number
  type: 'shingles' | 'metal'; hasDecking: boolean; waste: number; includeWaste: boolean
}

interface RoofPitchState {
  rise: number; run: number; spanFt: number
}

interface RoofingSquaresState {
  length: number; width: number; pitch: number; waste: number; includeWaste: boolean
}

interface RaftersState {
  span: number; pitch: number; overhang: number; count: number
}

interface FlooringState {
  length: number; width: number; waste: number
  includeWaste: boolean; costPerSqFt: number
}

interface InsulationState {
  area: number; type: 'batt' | 'sprayfoam' | 'cellulose-blown' | 'cellulose-dense'
  rValue: number; studSize: '2x4' | '2x6'; spacing: 16 | 24; waste: number; includeWaste: boolean
}

interface SprayFoamState {
  area: number; thickness: number; type: 'open' | 'closed'; waste: number; includeWaste: boolean
}

interface CelluloseState {
  area: number; rValue: number; type: 'attic' | 'dense-pack'; waste: number; includeWaste: boolean
}

interface SidingState { area: number; waste: number; includeWaste: boolean }
interface PaintState { area: number; coats: number; waste: number; includeWaste: boolean }

interface WireGaugeState {
  amps: number; voltage: 120 | 240; distance: number; material: 'copper' | 'aluminum'
}

interface LaborState { workers: number; hours: number; wage: number }

// ─── App State ────────────────────────────────────────────────────────────────

interface AppState {
  activeCalculator: CalculatorId
  marketPrices: MarketPrices
  budgetItems: BudgetItem[]
  selectedMaterial: string
  materialQty: number
  aiAnalyses: Record<string, AIAnalysis>
  isUpdatingPrices: boolean
  isAnalyzing: boolean
  analyzingTabs: Record<string, boolean>
  showScrollTop: boolean

  // Calculator inputs
  concrete: ConcreteState
  framing: FramingState
  roofing: RoofingState
  roofPitch: RoofPitchState
  roofingSquares: RoofingSquaresState
  rafters: RaftersState
  flooring: FlooringState
  insulation: InsulationState
  sprayfoam: SprayFoamState
  cellulose: CelluloseState
  siding: SidingState
  paint: PaintState
  wireGauge: WireGaugeState
  labor: LaborState
}

interface AppActions {
  setActiveCalculator: (id: CalculatorId) => void
  setMarketPrices: (prices: MarketPrices) => void
  setIsUpdatingPrices: (v: boolean) => void
  setIsAnalyzing: (v: boolean) => void
  setAnalyzingTab: (id: string, v: boolean) => void
  setAiAnalysis: (id: string, content: string) => void
  clearAiAnalysis: (id: string) => void
  setShowScrollTop: (v: boolean) => void
  addBudgetItem: (item: BudgetItem) => void
  removeBudgetItem: (id: string) => void
  updateBudgetItemPrice: (id: string, price: number) => void
  setBudgetItems: (items: BudgetItem[]) => void
  setSelectedMaterial: (m: string) => void
  setMaterialQty: (q: number) => void
  updateConcrete: (patch: Partial<ConcreteState>) => void
  updateFraming: (patch: Partial<FramingState>) => void
  updateRoofing: (patch: Partial<RoofingState>) => void
  updateRoofPitch: (patch: Partial<RoofPitchState>) => void
  updateRoofingSquares: (patch: Partial<RoofingSquaresState>) => void
  updateRafters: (patch: Partial<RaftersState>) => void
  updateFlooring: (patch: Partial<FlooringState>) => void
  updateInsulation: (patch: Partial<InsulationState>) => void
  updateSprayFoam: (patch: Partial<SprayFoamState>) => void
  updateCellulose: (patch: Partial<CelluloseState>) => void
  updateSiding: (patch: Partial<SidingState>) => void
  updatePaint: (patch: Partial<PaintState>) => void
  updateWireGauge: (patch: Partial<WireGaugeState>) => void
  updateLabor: (patch: Partial<LaborState>) => void
}

export const useStore = create<AppState & AppActions>()(
  persist(
  immer((set) => ({
    // App state
    activeCalculator: 'concrete',
    marketPrices: MARKET_PRICES_BASE,
    budgetItems: [],
    selectedMaterial: Object.keys(MARKET_PRICES_BASE)[0],
    materialQty: 1,
    aiAnalyses: {},
    isUpdatingPrices: false,
    isAnalyzing: false,
    analyzingTabs: {},
    showScrollTop: false,

    // Default calculator inputs
    concrete: { type: 'slab', length: 10, width: 10, thickness: 4, bagSize: 80, waste: 10, includeWaste: true },
    framing: { wallLength: 20, wallHeight: 8, spacing: 16, hasSheathing: false, hasDrywall: false, waste: 10, includeWaste: true },
    roofing: { length: 30, width: 20, pitch: 4, type: 'shingles', hasDecking: true, waste: 10, includeWaste: true },
    roofPitch: { rise: 4, run: 12, spanFt: 24 },
    roofingSquares: { length: 30, width: 20, pitch: 4, waste: 10, includeWaste: true },
    rafters: { span: 24, pitch: 4, overhang: 12, count: 20 },
    flooring: { length: 15, width: 12, waste: 10, includeWaste: true, costPerSqFt: 3.50 },
    insulation: { area: 500, type: 'batt', rValue: 13, studSize: '2x4', spacing: 16, waste: 10, includeWaste: true },
    sprayfoam: { area: 500, thickness: 2, type: 'closed', waste: 10, includeWaste: true },
    cellulose: { area: 500, rValue: 38, type: 'attic', waste: 10, includeWaste: true },
    siding: { area: 1000, waste: 10, includeWaste: true },
    paint: { area: 1000, coats: 2, waste: 5, includeWaste: true },
    wireGauge: { amps: 20, voltage: 120, distance: 50, material: 'copper' },
    labor: { workers: 2, hours: 8, wage: 25 },

    // Actions
    setActiveCalculator: (id) => set((s) => { s.activeCalculator = id }),
    setMarketPrices: (prices) => set((s) => { s.marketPrices = prices }),
    setIsUpdatingPrices: (v) => set((s) => { s.isUpdatingPrices = v }),
    setIsAnalyzing: (v) => set((s) => { s.isAnalyzing = v }),
    setAnalyzingTab: (id, v) => set((s) => { s.analyzingTabs[id] = v }),
    setAiAnalysis: (id, content) => set((s) => { s.aiAnalyses[id] = { calculatorId: id as CalculatorId, content, timestamp: Date.now() } }),
    clearAiAnalysis: (id) => set((s) => { delete s.aiAnalyses[id] }),
    setShowScrollTop: (v) => set((s) => { s.showScrollTop = v }),
    addBudgetItem: (item) => set((s) => { s.budgetItems.push(item) }),
    removeBudgetItem: (id) => set((s) => { s.budgetItems = s.budgetItems.filter(i => i.id !== id) }),
    updateBudgetItemPrice: (id, price) => set((s) => {
      const item = s.budgetItems.find(i => i.id === id)
      if (item) item.pricePerUnit = price
    }),
    setBudgetItems: (items) => set((s) => { s.budgetItems = items }),
    setSelectedMaterial: (m) => set((s) => { s.selectedMaterial = m }),
    setMaterialQty: (q) => set((s) => { s.materialQty = q }),
    updateConcrete: (p) => set((s) => { Object.assign(s.concrete, p) }),
    updateFraming: (p) => set((s) => { Object.assign(s.framing, p) }),
    updateRoofing: (p) => set((s) => { Object.assign(s.roofing, p) }),
    updateRoofPitch: (p) => set((s) => { Object.assign(s.roofPitch, p) }),
    updateRoofingSquares: (p) => set((s) => { Object.assign(s.roofingSquares, p) }),
    updateRafters: (p) => set((s) => { Object.assign(s.rafters, p) }),
    updateFlooring: (p) => set((s) => { Object.assign(s.flooring, p) }),
    updateInsulation: (p) => set((s) => { Object.assign(s.insulation, p) }),
    updateSprayFoam: (p) => set((s) => { Object.assign(s.sprayfoam, p) }),
    updateCellulose: (p) => set((s) => { Object.assign(s.cellulose, p) }),
    updateSiding: (p) => set((s) => { Object.assign(s.siding, p) }),
    updatePaint: (p) => set((s) => { Object.assign(s.paint, p) }),
    updateWireGauge: (p) => set((s) => { Object.assign(s.wireGauge, p) }),
    updateLabor: (p) => set((s) => { Object.assign(s.labor, p) }),
  })),
  {
    name: 'bcp-calc-state',
    // Only persist calculator inputs and active tab — not transient UI state
    partialize: (state) => ({
      activeCalculator: state.activeCalculator,
      concrete:         state.concrete,
      framing:          state.framing,
      roofing:          state.roofing,
      roofPitch:        state.roofPitch,
      roofingSquares:   state.roofingSquares,
      rafters:          state.rafters,
      flooring:         state.flooring,
      insulation:       state.insulation,
      sprayfoam:        state.sprayfoam,
      cellulose:        state.cellulose,
      siding:           state.siding,
      paint:            state.paint,
      wireGauge:        state.wireGauge,
      labor:            state.labor,
      budgetItems:      state.budgetItems,
    }),
  }
  )
)

// ─── Calculator Types ─────────────────────────────────────────────────────────

export type CalculatorId =
  | 'concrete'
  | 'framing'
  | 'roofing'
  | 'roofingSquares'
  | 'roofPitch'
  | 'rafters'
  | 'flooring'
  | 'insulation'
  | 'sprayfoam'
  | 'cellulose'
  | 'siding'
  | 'paint'
  | 'wireGauge'
  | 'labor'
  | 'budget'
  | 'unitConverter'

export type CategoryId =
  | 'concrete'
  | 'framing'
  | 'roofing'
  | 'insulation'
  | 'finishes'
  | 'electrical'
  | 'labor'

export interface CalculationResult {
  label: string
  value: string | number
  unit: string
  description?: string
  highlight?: boolean
}

export interface Calculator {
  id: CalculatorId
  label: string
  category: CategoryId
  emoji: string
  blurb: string
  seoBlurb: string
}

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  calculators: CalculatorId[]
}

// ─── Budget Types ─────────────────────────────────────────────────────────────

export interface BudgetItem {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
}

export interface MarketPrice {
  price: number
  unit: string
}

export type MarketPrices = Record<string, MarketPrice>

// ─── Preset Types ─────────────────────────────────────────────────────────────

export interface ProjectPreset {
  name: string
  emoji: string
  description: string
  budget: Array<{ name: string; quantity: number }>
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AIAnalysis {
  calculatorId: CalculatorId
  content: string
  timestamp: number
}

// ─── Auth / User Types ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
}

// ─── Saved Estimate Types ─────────────────────────────────────────────────────

export interface SavedEstimate {
  id: string
  userId: string
  name: string
  calculatorId: CalculatorId
  inputs: Record<string, unknown>
  results: CalculationResult[]
  budgetItems?: BudgetItem[]
  totalCost?: number
  createdAt: string
  updatedAt: string
}

// ─── PDF Types ────────────────────────────────────────────────────────────────

export interface PDFEstimateData {
  title: string
  calculatorLabel: string
  results: CalculationResult[]
  budgetItems?: BudgetItem[]
  totalCost?: number
  projectName?: string
  generatedAt: string
}

// ─── View Types ───────────────────────────────────────────────────────────────

export type AppView = 'calculator' | 'blog' | 'faq' | 'about' | 'help' | 'privacy'

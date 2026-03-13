import type { MarketPrices, ProjectPreset, Calculator, Category } from '@/types'

export const MARKET_PRICES_BASE: MarketPrices = {
  'Concrete (Ready-Mix)':    { price: 150,   unit: 'cu yd' },
  'Concrete (80lb Bag)':     { price: 6.50,  unit: 'bag' },
  'Form Lumber (2x4x8)':     { price: 5.50,  unit: 'ea' },
  'Stud (2x4x8)':            { price: 6.00,  unit: 'ea' },
  'Stud (2x6x8)':            { price: 9.50,  unit: 'ea' },
  'OSB Sheathing (4x8)':     { price: 22.00, unit: 'sheet' },
  'Drywall (4x8x1/2)':       { price: 18.00, unit: 'sheet' },
  'Roof Decking (4x8)':      { price: 32.00, unit: 'sheet' },
  'Roofing Shingles':        { price: 35.00, unit: 'bundle' },
  'Metal Roofing Panel':     { price: 4.50,  unit: 'sq ft' },
  'Laminate Flooring':       { price: 3.50,  unit: 'sq ft' },
  'Fiberglass Batt (R-13)':  { price: 0.85,  unit: 'sq ft' },
  'Fiberglass Batt (R-19)':  { price: 1.25,  unit: 'sq ft' },
  'Spray Foam (Closed Cell)':{ price: 1.50,  unit: 'bd ft' },
  'Cellulose (Blown-In)':    { price: 15.00, unit: 'bag' },
  'Cellulose (Dense-Pack)':  { price: 18.00, unit: 'bag' },
  'Vinyl Siding (Sq)':       { price: 180.00,unit: 'sq' },
  'Exterior Paint (Gal)':    { price: 45.00, unit: 'gal' },
  'Screws (5lb Box)':        { price: 28.00, unit: 'box' },
  'Nails (50lb Box)':        { price: 85.00, unit: 'box' },
}

export const PROJECT_PRESETS: Record<string, ProjectPreset> = {
  shed: {
    name: 'Small Shed (8×10)',
    emoji: '🏚️',
    description: 'Foundation, framing, roof',
    budget: [
      { name: 'Concrete (Ready-Mix)', quantity: 1.5 },
      { name: 'Stud (2x4x8)', quantity: 45 },
      { name: 'OSB Sheathing (4x8)', quantity: 12 },
      { name: 'Roof Decking (4x8)', quantity: 4 },
      { name: 'Roofing Shingles', quantity: 6 },
      { name: 'Nails (50lb Box)', quantity: 1 },
    ],
  },
  deck: {
    name: 'Basic Deck (12×12)',
    emoji: '🪵',
    description: 'Footings, framing, decking',
    budget: [
      { name: 'Concrete (80lb Bag)', quantity: 12 },
      { name: 'Stud (2x6x8)', quantity: 20 },
      { name: 'Laminate Flooring', quantity: 165 },
      { name: 'Screws (5lb Box)', quantity: 2 },
    ],
  },
  addition: {
    name: 'Room Addition (15×15)',
    emoji: '🏠',
    description: 'Full addition — slab to roof',
    budget: [
      { name: 'Concrete (Ready-Mix)', quantity: 4.5 },
      { name: 'Stud (2x6x8)', quantity: 80 },
      { name: 'OSB Sheathing (4x8)', quantity: 25 },
      { name: 'Drywall (4x8x1/2)', quantity: 22 },
      { name: 'Roof Decking (4x8)', quantity: 12 },
      { name: 'Roofing Shingles', quantity: 15 },
      { name: 'Fiberglass Batt (R-19)', quantity: 900 },
      { name: 'Vinyl Siding (Sq)', quantity: 5.5 },
      { name: 'Exterior Paint (Gal)', quantity: 3 },
      { name: 'Nails (50lb Box)', quantity: 2 },
    ],
  },
  patio: {
    name: 'Concrete Patio (10×12)',
    emoji: '🧱',
    description: 'Slab and forms',
    budget: [
      { name: 'Concrete (Ready-Mix)', quantity: 2 },
      { name: 'Form Lumber (2x4x8)', quantity: 6 },
    ],
  },
  garage: {
    name: 'Garage Slab (20×20)',
    emoji: '🏗️',
    description: 'Full garage floor slab',
    budget: [
      { name: 'Concrete (Ready-Mix)', quantity: 6 },
      { name: 'Form Lumber (2x4x8)', quantity: 12 },
    ],
  },
  basement: {
    name: 'Basement Wall (20ft)',
    emoji: '🏢',
    description: 'Framing, insulation, drywall',
    budget: [
      { name: 'Stud (2x4x8)', quantity: 18 },
      { name: 'Drywall (4x8x1/2)', quantity: 6 },
      { name: 'Fiberglass Batt (R-13)', quantity: 160 },
      { name: 'Screws (5lb Box)', quantity: 1 },
    ],
  },
}

export const CALCULATORS: Calculator[] = [
  // Concrete
  { id: 'concrete',       label: 'Concrete Slab',       category: 'concrete',    emoji: '🧱', blurb: 'Volume, bags, form boards', seoBlurb: 'Calculate concrete volume in cubic yards and bags needed for slabs, footings, and forms.' },
  // Framing
  { id: 'framing',        label: 'Wall Framing',         category: 'framing',     emoji: '🪚', blurb: 'Studs, sheathing, drywall', seoBlurb: 'Count studs, sheathing sheets, and fasteners for any wall framing project.' },
  { id: 'rafters',        label: 'Rafter Length',        category: 'framing',     emoji: '📐', blurb: 'Rafter length & board feet', seoBlurb: 'Calculate rafter length, buy length, and total board feet from span and pitch.' },
  // Roofing
  { id: 'roofing',        label: 'Roofing Materials',    category: 'roofing',     emoji: '🏠', blurb: 'Shingles, decking, panels', seoBlurb: 'Estimate roofing shingles, bundles, and decking sheets from roof dimensions and pitch.' },
  { id: 'roofPitch',      label: 'Roof Pitch',           category: 'roofing',     emoji: '📏', blurb: 'Pitch, angle, multiplier', seoBlurb: 'Convert rise/run to pitch ratio, angle in degrees, and roof slope multiplier.' },
  { id: 'roofingSquares', label: 'Roofing Squares',      category: 'roofing',     emoji: '⬜', blurb: 'Squares, bundles, ridge cap', seoBlurb: 'Calculate roofing squares, shingle bundles, and ridge cap from roof area and pitch.' },
  // Insulation
  { id: 'insulation',     label: 'Batt Insulation',      category: 'insulation',  emoji: '🌡️', blurb: 'R-value, packs, coverage', seoBlurb: 'Estimate fiberglass batt insulation packs for walls and ceilings by R-value and stud size.' },
  { id: 'sprayfoam',      label: 'Spray Foam',           category: 'insulation',  emoji: '💨', blurb: 'Board feet, R-value, kits', seoBlurb: 'Calculate spray foam insulation board feet, achieved R-value, and kit count.' },
  { id: 'cellulose',      label: 'Cellulose Insulation', category: 'insulation',  emoji: '🌾', blurb: 'Bags, depth, attic & walls', seoBlurb: 'Estimate blown-in or dense-pack cellulose insulation bags needed for any R-value.' },
  // Finishes
  { id: 'flooring',       label: 'Flooring',             category: 'finishes',    emoji: '🪵', blurb: 'Area, waste factor, cost', seoBlurb: 'Calculate flooring square footage with waste factor and material cost estimate.' },
  { id: 'siding',         label: 'Siding',               category: 'finishes',    emoji: '🏘️', blurb: 'Squares, nails, coverage', seoBlurb: 'Estimate vinyl or wood siding squares and fasteners for any wall area.' },
  { id: 'paint',          label: 'Paint',                category: 'finishes',    emoji: '🎨', blurb: 'Gallons, coats, coverage', seoBlurb: 'Calculate paint gallons needed for any number of coats and wall area.' },
  // Electrical
  { id: 'wireGauge',      label: 'Wire Gauge',           category: 'electrical',  emoji: '⚡', blurb: 'AWG, voltage drop, NEC', seoBlurb: 'Find correct wire gauge by amperage with NEC ampacity tables and voltage drop calculation.' },
  // Labor
  { id: 'labor',          label: 'Labor Cost',           category: 'labor',       emoji: '👷', blurb: 'Hours, workers, total cost', seoBlurb: 'Estimate total labor cost from worker count, hours, and hourly wage.' },
  // Budget
  { id: 'budget',         label: 'Budget Tracker',       category: 'labor',       emoji: '💰', blurb: 'Materials, pricing, totals', seoBlurb: 'Track material costs with live pricing and AI project analysis.' },
]

export const CATEGORIES: Category[] = [
  { id: 'concrete',   label: 'Concrete',   emoji: '🧱', calculators: ['concrete'] },
  { id: 'framing',    label: 'Framing',    emoji: '🪚', calculators: ['framing', 'rafters'] },
  { id: 'roofing',    label: 'Roofing',    emoji: '🏠', calculators: ['roofing', 'roofPitch', 'roofingSquares'] },
  { id: 'insulation', label: 'Insulation', emoji: '🌡️', calculators: ['insulation', 'sprayfoam', 'cellulose'] },
  { id: 'finishes',   label: 'Finishes',   emoji: '🎨', calculators: ['flooring', 'siding', 'paint'] },
  { id: 'electrical', label: 'Electrical', emoji: '⚡', calculators: ['wireGauge'] },
  { id: 'labor',      label: 'Labor',      emoji: '👷', calculators: ['labor', 'budget'] },
]

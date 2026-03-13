import type { CalculationResult } from '@/types'

// ─── Concrete ─────────────────────────────────────────────────────────────────

export interface ConcreteInputs {
  type: 'slab' | 'footing' | 'forms'
  length: number
  width: number
  thickness: number // inches
  bagSize: 80 | 60
  waste: number // %
  includeWaste: boolean
}

export function calcConcrete(i: ConcreteInputs): CalculationResult[] {
  const volumeCuFt = i.length * i.width * (i.thickness / 12)
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const withWaste = volumeCuFt * mult
  const cuYd = withWaste / 27
  const yieldPerBag = i.bagSize === 80 ? 0.6 : 0.45
  const bags = Math.ceil(withWaste / yieldPerBag)

  const results: CalculationResult[] = [
    { label: 'Volume', value: cuYd.toFixed(2), unit: 'cu yd', highlight: true },
    { label: 'Volume', value: withWaste.toFixed(2), unit: 'cu ft' },
    { label: 'Bags Needed', value: bags, unit: `${i.bagSize}lb bags`, description: i.includeWaste ? `Includes ${i.waste}% waste` : 'No waste applied' },
  ]

  if (i.type === 'forms') {
    const perimeter = (i.length + i.width) * 2
    results.push({ label: 'Form Boards (2×4×8)', value: Math.ceil(perimeter / 8), unit: 'ea', description: 'Based on perimeter' })
  }
  return results
}

// ─── Framing ──────────────────────────────────────────────────────────────────

export interface FramingInputs {
  wallLength: number
  wallHeight: number
  spacing: 12 | 16 | 24
  hasSheathing: boolean
  hasDrywall: boolean
  waste: number
  includeWaste: boolean
}

export function calcFraming(i: FramingInputs): CalculationResult[] {
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const baseStuds = Math.ceil((i.wallLength * 12) / i.spacing) + 1
  const studs = Math.ceil(baseStuds * mult)

  const results: CalculationResult[] = [
    { label: 'Studs Needed', value: studs, unit: 'studs', highlight: true, description: `${i.spacing}" OC${i.includeWaste ? ` + ${i.waste}% waste` : ''}` },
    { label: 'Framing Nails', value: studs * 6, unit: 'nails', description: 'Approx. 3 per connection' },
  ]

  if (i.hasSheathing) {
    const sheets = Math.ceil((i.wallLength * i.wallHeight * mult) / 32)
    results.push({ label: 'Sheathing Sheets', value: sheets, unit: 'sheets', description: '4×8 sheets' })
    results.push({ label: 'Sheathing Nails', value: sheets * 35, unit: 'nails', description: '8d nails, 6" edge / 12" field' })
  }

  if (i.hasDrywall) {
    const sheets = Math.ceil((i.wallLength * i.wallHeight * mult) / 32)
    results.push({ label: 'Drywall Sheets', value: sheets, unit: 'sheets', description: '4×8 sheets' })
    results.push({ label: 'Drywall Screws', value: sheets * 32, unit: 'screws', description: '1-1/4" screws, 12" spacing' })
  }

  return results
}

// ─── Roofing ──────────────────────────────────────────────────────────────────

export interface RoofingInputs {
  length: number
  width: number
  pitch: number // x/12
  type: 'shingles' | 'metal'
  hasDecking: boolean
  waste: number
  includeWaste: boolean
}

export function calcRoofing(i: RoofingInputs): CalculationResult[] {
  const multiplier = Math.sqrt(1 + Math.pow(i.pitch / 12, 2))
  const actualArea = i.length * i.width * multiplier
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const areaWithWaste = actualArea * mult

  const results: CalculationResult[] = [
    { label: 'Roof Area', value: actualArea.toFixed(1), unit: 'sq ft', highlight: true },
    { label: 'Pitch Multiplier', value: multiplier.toFixed(3), unit: 'x', description: `${i.pitch}/12 pitch` },
  ]

  if (i.hasDecking) {
    results.push({ label: 'Decking Sheets', value: Math.ceil(areaWithWaste / 32), unit: 'sheets', description: '4×8 sheets' })
  }

  if (i.type === 'shingles') {
    const squares = Math.ceil(areaWithWaste / 100)
    results.push({ label: 'Squares', value: squares, unit: 'sq', description: '100 sq ft each' })
    results.push({ label: 'Bundles', value: squares * 3, unit: 'bundles', description: i.includeWaste ? `Includes ${i.waste}% waste` : 'No waste' })
  } else {
    results.push({ label: 'Metal Panels', value: Math.ceil(areaWithWaste / 36), unit: 'panels', description: '3ft wide panels' })
  }

  return results
}

// ─── Roof Pitch ───────────────────────────────────────────────────────────────

export interface RoofPitchInputs {
  rise: number // inches
  run: number  // inches
  spanFt: number
}

export function calcRoofPitch(i: RoofPitchInputs): CalculationResult[] {
  const pitch = (i.rise / i.run) * 12
  const angleDeg = Math.atan(i.rise / i.run) * (180 / Math.PI)
  const multiplier = Math.sqrt(1 + Math.pow(pitch / 12, 2))
  const rafterLength = (i.spanFt / 2) * multiplier

  return [
    { label: 'Pitch', value: `${pitch.toFixed(1)}/12`, unit: '', highlight: true },
    { label: 'Angle', value: angleDeg.toFixed(1), unit: '°' },
    { label: 'Slope Multiplier', value: multiplier.toFixed(4), unit: 'x', description: 'Multiply flat area by this' },
    { label: 'Rafter Length', value: rafterLength.toFixed(2), unit: 'ft', description: `Based on ${i.spanFt}ft span` },
  ]
}

// ─── Roofing Squares ─────────────────────────────────────────────────────────

export interface RoofingSquaresInputs {
  length: number
  width: number
  pitch: number
  waste: number
  includeWaste: boolean
}

export function calcRoofingSquares(i: RoofingSquaresInputs): CalculationResult[] {
  const multiplier = Math.sqrt(1 + Math.pow(i.pitch / 12, 2))
  const actualArea = i.length * i.width * multiplier
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const withWaste = actualArea * mult
  const squares = Math.ceil(withWaste / 100)
  const bundles = squares * 3
  const ridgeCap = Math.ceil((i.length * mult) / 35)

  return [
    { label: 'Roof Squares', value: squares, unit: 'sq', highlight: true },
    { label: 'Shingle Bundles', value: bundles, unit: 'bundles', description: '3 bundles per square' },
    { label: 'Ridge Cap Bundles', value: ridgeCap, unit: 'bundles', description: '35 LF per bundle' },
    { label: 'Total Area', value: withWaste.toFixed(1), unit: 'sq ft' },
  ]
}

// ─── Rafter Length ────────────────────────────────────────────────────────────

export interface RafterInputs {
  span: number     // ft — total building width
  pitch: number    // x/12
  overhang: number // inches
  count: number
}

export function calcRafters(i: RafterInputs): CalculationResult[] {
  const runFt = i.span / 2
  const multiplier = Math.sqrt(1 + Math.pow(i.pitch / 12, 2))
  const rafterRun = runFt * multiplier
  const overhangFt = (i.overhang / 12) * multiplier
  const totalLength = rafterRun + overhangFt
  const boardLength = Math.ceil(totalLength / 2) * 2 // round up to even ft

  return [
    { label: 'Rafter Length', value: totalLength.toFixed(2), unit: 'ft', highlight: true },
    { label: 'Buy Length', value: `${boardLength}ft`, unit: 'boards', description: 'Rounded to standard lumber' },
    { label: 'Total Board Feet', value: (boardLength * i.count * (1.5 / 12)).toFixed(1), unit: 'bd ft', description: `${i.count} rafters` },
    { label: 'Ridge Length', value: i.span.toFixed(1), unit: 'ft' },
  ]
}

// ─── Flooring ─────────────────────────────────────────────────────────────────

export interface FlooringInputs {
  length: number
  width: number
  waste: number
  includeWaste: boolean
  costPerSqFt: number
}

export function calcFlooring(i: FlooringInputs): CalculationResult[] {
  const area = i.length * i.width
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const withWaste = area * mult

  return [
    { label: 'Floor Area', value: area.toFixed(1), unit: 'sq ft', highlight: true },
    { label: 'Order Qty', value: withWaste.toFixed(1), unit: 'sq ft', description: i.includeWaste ? `${i.waste}% waste factor` : 'No waste' },
    { label: 'Estimated Cost', value: (withWaste * i.costPerSqFt).toFixed(2), unit: '$' },
  ]
}

// ─── Insulation (Batt) ────────────────────────────────────────────────────────

export interface InsulationInputs {
  area: number
  type: 'batt' | 'sprayfoam' | 'cellulose-blown' | 'cellulose-dense'
  rValue: number
  studSize: '2x4' | '2x6'
  spacing: 16 | 24
  waste: number
  includeWaste: boolean
}

export function calcInsulation(i: InsulationInputs): CalculationResult[] {
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const area = i.area * mult
  const depth = i.studSize === '2x4' ? 3.5 : 5.5

  const results: CalculationResult[] = [
    { label: 'Coverage Area', value: area.toFixed(1), unit: 'sq ft', highlight: true },
  ]

  if (i.type === 'batt') {
    results.push({ label: 'Packs Needed', value: Math.ceil(area / 40), unit: 'packs', description: `R-${i.rValue} for ${i.studSize} @ ${i.spacing}"OC` })
  } else if (i.type === 'sprayfoam') {
    results.push({ label: 'Board Feet', value: (area * depth).toFixed(0), unit: 'bd ft', description: 'Closed-cell foam volume' })
  } else {
    const density = i.type === 'cellulose-blown' ? 1.5 : 3.5
    const volume = (area * depth) / 12
    results.push({ label: 'Bags Needed', value: Math.ceil((volume * density) / 25), unit: 'bags', description: `${i.type === 'cellulose-blown' ? 'Blown' : 'Dense-pack'} cellulose` })
  }

  return results
}

// ─── Spray Foam ───────────────────────────────────────────────────────────────

export interface SprayFoamInputs {
  area: number
  thickness: number // inches
  type: 'open' | 'closed'
  waste: number
  includeWaste: boolean
}

export function calcSprayFoam(i: SprayFoamInputs): CalculationResult[] {
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const boardFeet = i.area * i.thickness * mult
  const rValuePerInch = i.type === 'closed' ? 6.5 : 3.7
  const totalRValue = rValuePerInch * i.thickness
  // Typical 2-component kit: 600 bd ft for closed, 1000 for open
  const kitSize = i.type === 'closed' ? 600 : 1000
  const kits = Math.ceil(boardFeet / kitSize)

  return [
    { label: 'Board Feet', value: boardFeet.toFixed(0), unit: 'bd ft', highlight: true },
    { label: 'R-Value Achieved', value: `R-${totalRValue.toFixed(1)}`, unit: '', description: `${rValuePerInch}/inch for ${i.type}-cell` },
    { label: 'Kits Needed', value: kits, unit: 'kits', description: `${kitSize} bd ft per kit` },
  ]
}

// ─── Cellulose ────────────────────────────────────────────────────────────────

export interface CelluloseInputs {
  area: number
  rValue: number
  type: 'attic' | 'dense-pack'
  waste: number
  includeWaste: boolean
}

export function calcCellulose(i: CelluloseInputs): CalculationResult[] {
  const depthInches = i.type === 'attic' ? i.rValue / 3.7 : i.rValue / 3.5
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const area = i.area * mult
  const cubicFeet = (area * depthInches) / 12
  const density = i.type === 'attic' ? 1.5 : 3.5
  const lbs = cubicFeet * density
  const bags = Math.ceil(lbs / 30)

  return [
    { label: 'Bags Needed', value: bags, unit: '30lb bags', highlight: true },
    { label: 'Depth Required', value: depthInches.toFixed(1), unit: 'inches', description: `For R-${i.rValue}` },
    { label: 'Total Weight', value: lbs.toFixed(0), unit: 'lbs' },
    { label: 'Coverage Area', value: area.toFixed(0), unit: 'sq ft' },
  ]
}

// ─── Siding ───────────────────────────────────────────────────────────────────

export interface SidingInputs {
  area: number
  waste: number
  includeWaste: boolean
}

export function calcSiding(i: SidingInputs): CalculationResult[] {
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const totalArea = i.area * mult
  const squares = Math.ceil(totalArea / 100)

  return [
    { label: 'Squares Needed', value: squares, unit: 'sq', highlight: true, description: '100 sq ft per square' },
    { label: 'Total Area', value: totalArea.toFixed(0), unit: 'sq ft' },
    { label: 'Siding Nails', value: squares * 250, unit: 'nails', description: 'Approx. 250 per square' },
  ]
}

// ─── Paint ────────────────────────────────────────────────────────────────────

export interface PaintInputs {
  area: number
  coats: number
  waste: number
  includeWaste: boolean
}

export function calcPaint(i: PaintInputs): CalculationResult[] {
  const mult = i.includeWaste ? 1 + i.waste / 100 : 1
  const totalArea = i.area * i.coats * mult
  const gallons = Math.ceil(totalArea / 350)

  return [
    { label: 'Gallons Needed', value: gallons, unit: 'gal', highlight: true },
    { label: 'Coverage Area', value: totalArea.toFixed(0), unit: 'sq ft', description: `${i.coats} coat${i.coats > 1 ? 's' : ''}, 350 sq ft/gal` },
  ]
}

// ─── Wire Gauge ───────────────────────────────────────────────────────────────

export interface WireGaugeInputs {
  amps: number
  voltage: 120 | 240
  distance: number // ft one-way
  material: 'copper' | 'aluminum'
}

export function calcWireGauge(i: WireGaugeInputs): CalculationResult[] {
  // NEC ampacity table (copper, 60°C, simplified)
  const copperTable: Array<{ awg: string; amps: number }> = [
    { awg: '14 AWG', amps: 15 },
    { awg: '12 AWG', amps: 20 },
    { awg: '10 AWG', amps: 30 },
    { awg: '8 AWG', amps: 40 },
    { awg: '6 AWG', amps: 55 },
    { awg: '4 AWG', amps: 70 },
    { awg: '2 AWG', amps: 95 },
    { awg: '1/0 AWG', amps: 125 },
    { awg: '2/0 AWG', amps: 145 },
    { awg: '3/0 AWG', amps: 165 },
    { awg: '4/0 AWG', amps: 195 },
  ]

  // Aluminum runs ~2 gauges larger for same amps
  const table = i.material === 'aluminum'
    ? copperTable.map((r, idx) => ({ ...r, amps: copperTable[Math.max(0, idx - 2)]?.amps ?? r.amps }))
    : copperTable

  const match = table.find(r => r.amps >= i.amps) ?? table[table.length - 1]

  // Voltage drop calc: VD = (2 * K * I * D) / CM
  const K = i.material === 'copper' ? 12.9 : 21.2
  const cmTable: Record<string, number> = {
    '14 AWG': 4110, '12 AWG': 6530, '10 AWG': 10380, '8 AWG': 16510,
    '6 AWG': 26240, '4 AWG': 41740, '2 AWG': 66360, '1/0 AWG': 105600,
    '2/0 AWG': 133100, '3/0 AWG': 167800, '4/0 AWG': 211600,
  }
  const cm = cmTable[match.awg] ?? 10380
  const vDrop = (2 * K * i.amps * i.distance) / cm
  const vDropPct = (vDrop / i.voltage) * 100

  return [
    { label: 'Recommended Gauge', value: match.awg, unit: '', highlight: true, description: `NEC ampacity: ${match.amps}A` },
    { label: 'Voltage Drop', value: vDrop.toFixed(2), unit: 'V', description: `${vDropPct.toFixed(1)}% — NEC max is 3%` },
    { label: 'Wire Length', value: (i.distance * 2).toFixed(0), unit: 'ft', description: 'Round trip' },
  ]
}

// ─── Labor ────────────────────────────────────────────────────────────────────

export interface LaborInputs {
  workers: number
  hours: number
  wage: number
}

export function calcLabor(i: LaborInputs): CalculationResult[] {
  const totalHours = i.workers * i.hours
  const totalCost = totalHours * i.wage

  return [
    { label: 'Total Labor Cost', value: `$${totalCost.toFixed(2)}`, unit: '', highlight: true },
    { label: 'Total Hours', value: totalHours, unit: 'hrs' },
    { label: 'Per Worker', value: `$${(i.hours * i.wage).toFixed(2)}`, unit: '', description: `${i.hours}h × $${i.wage}/hr` },
  ]
}

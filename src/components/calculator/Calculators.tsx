'use client'
import { useStore } from '@/lib/store'
import { CalculatorShell, InputGroup, NumInput, SelectInput, WasteInput, ToggleGroup, Checkbox } from './CalculatorShell'
import {
  calcConcrete, calcFraming, calcRoofing, calcRoofPitch, calcRoofingSquares,
  calcRafters, calcFlooring, calcInsulation, calcSprayFoam, calcCellulose,
  calcSiding, calcPaint, calcWireGauge, calcLabor,
} from '@/calculators'

// ─── Concrete ─────────────────────────────────────────────────────────────────
export function ConcreteCalc() {
  const { concrete, updateConcrete } = useStore()
  const results = calcConcrete(concrete)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Pour Type">
        <ToggleGroup
          value={concrete.type}
          onChange={v => updateConcrete({ type: v })}
          options={[{ value: 'slab', label: 'Slab' }, { value: 'footing', label: 'Footing' }, { value: 'forms', label: '+Forms' }]}
        />
      </InputGroup>
      <InputGroup label="Length" unit="ft">
        <NumInput value={concrete.length} onChange={v => updateConcrete({ length: v })} min={0.1} />
      </InputGroup>
      <InputGroup label="Width" unit="ft">
        <NumInput value={concrete.width} onChange={v => updateConcrete({ width: v })} min={0.1} />
      </InputGroup>
      <InputGroup label="Thickness" unit="inches">
        <NumInput value={concrete.thickness} onChange={v => updateConcrete({ thickness: v })} min={1} max={24} step={0.5} />
      </InputGroup>
      <InputGroup label="Bag Size">
        <ToggleGroup
          value={String(concrete.bagSize) as '80' | '60'}
          onChange={v => updateConcrete({ bagSize: parseInt(v) as 80 | 60 })}
          options={[{ value: '80', label: '80 lb' }, { value: '60', label: '60 lb' }]}
        />
      </InputGroup>
      <WasteInput waste={concrete.waste} includeWaste={concrete.includeWaste} onWasteChange={v => updateConcrete({ waste: v })} onIncludeChange={v => updateConcrete({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Framing ──────────────────────────────────────────────────────────────────
export function FramingCalc() {
  const { framing, updateFraming } = useStore()
  const results = calcFraming(framing)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Wall Length" unit="ft">
        <NumInput value={framing.wallLength} onChange={v => updateFraming({ wallLength: v })} min={1} />
      </InputGroup>
      <InputGroup label="Wall Height" unit="ft">
        <NumInput value={framing.wallHeight} onChange={v => updateFraming({ wallHeight: v })} min={6} max={20} />
      </InputGroup>
      <InputGroup label="Stud Spacing">
        <ToggleGroup
          value={String(framing.spacing) as '12' | '16' | '24'}
          onChange={v => updateFraming({ spacing: parseInt(v) as 12 | 16 | 24 })}
          options={[{ value: '12', label: '12" OC' }, { value: '16', label: '16" OC' }, { value: '24', label: '24" OC' }]}
        />
      </InputGroup>
      <Checkbox label="Include OSB Sheathing" checked={framing.hasSheathing} onChange={v => updateFraming({ hasSheathing: v })} />
      <Checkbox label="Include Drywall" checked={framing.hasDrywall} onChange={v => updateFraming({ hasDrywall: v })} />
      <WasteInput waste={framing.waste} includeWaste={framing.includeWaste} onWasteChange={v => updateFraming({ waste: v })} onIncludeChange={v => updateFraming({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Roofing ──────────────────────────────────────────────────────────────────
export function RoofingCalc() {
  const { roofing, updateRoofing } = useStore()
  const results = calcRoofing(roofing)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Roof Length" unit="ft"><NumInput value={roofing.length} onChange={v => updateRoofing({ length: v })} /></InputGroup>
      <InputGroup label="Roof Width" unit="ft"><NumInput value={roofing.width} onChange={v => updateRoofing({ width: v })} /></InputGroup>
      <InputGroup label="Roof Pitch" unit="x/12" description="e.g. 4 = 4/12 pitch">
        <NumInput value={roofing.pitch} onChange={v => updateRoofing({ pitch: v })} min={0} max={24} step={0.5} />
      </InputGroup>
      <InputGroup label="Material">
        <ToggleGroup value={roofing.type} onChange={v => updateRoofing({ type: v })} options={[{ value: 'shingles', label: 'Shingles' }, { value: 'metal', label: 'Metal' }]} />
      </InputGroup>
      <Checkbox label="Include Roof Decking" checked={roofing.hasDecking} onChange={v => updateRoofing({ hasDecking: v })} />
      <WasteInput waste={roofing.waste} includeWaste={roofing.includeWaste} onWasteChange={v => updateRoofing({ waste: v })} onIncludeChange={v => updateRoofing({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Roof Pitch ───────────────────────────────────────────────────────────────
export function RoofPitchCalc() {
  const { roofPitch, updateRoofPitch } = useStore()
  const results = calcRoofPitch(roofPitch)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Rise" unit="inches" description="Vertical inches per foot of run">
        <NumInput value={roofPitch.rise} onChange={v => updateRoofPitch({ rise: v })} min={0} max={24} step={0.5} />
      </InputGroup>
      <InputGroup label="Run" unit="inches" description="Usually 12 (standard)">
        <NumInput value={roofPitch.run} onChange={v => updateRoofPitch({ run: v })} min={1} max={12} />
      </InputGroup>
      <InputGroup label="Building Span" unit="ft" description="Total width of building">
        <NumInput value={roofPitch.spanFt} onChange={v => updateRoofPitch({ spanFt: v })} min={4} />
      </InputGroup>
    </CalculatorShell>
  )
}

// ─── Roofing Squares ─────────────────────────────────────────────────────────
export function RoofingSquaresCalc() {
  const { roofingSquares, updateRoofingSquares } = useStore()
  const results = calcRoofingSquares(roofingSquares)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Length" unit="ft"><NumInput value={roofingSquares.length} onChange={v => updateRoofingSquares({ length: v })} /></InputGroup>
      <InputGroup label="Width" unit="ft"><NumInput value={roofingSquares.width} onChange={v => updateRoofingSquares({ width: v })} /></InputGroup>
      <InputGroup label="Pitch" unit="x/12"><NumInput value={roofingSquares.pitch} onChange={v => updateRoofingSquares({ pitch: v })} min={0} max={24} step={0.5} /></InputGroup>
      <WasteInput waste={roofingSquares.waste} includeWaste={roofingSquares.includeWaste} onWasteChange={v => updateRoofingSquares({ waste: v })} onIncludeChange={v => updateRoofingSquares({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Rafters ─────────────────────────────────────────────────────────────────
export function RaftersCalc() {
  const { rafters, updateRafters } = useStore()
  const results = calcRafters(rafters)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Building Span" unit="ft" description="Total building width">
        <NumInput value={rafters.span} onChange={v => updateRafters({ span: v })} min={4} />
      </InputGroup>
      <InputGroup label="Roof Pitch" unit="x/12">
        <NumInput value={rafters.pitch} onChange={v => updateRafters({ pitch: v })} min={0} max={24} step={0.5} />
      </InputGroup>
      <InputGroup label="Overhang" unit="inches">
        <NumInput value={rafters.overhang} onChange={v => updateRafters({ overhang: v })} min={0} max={36} />
      </InputGroup>
      <InputGroup label="Rafter Count" unit="total">
        <NumInput value={rafters.count} onChange={v => updateRafters({ count: v })} min={2} step={1} />
      </InputGroup>
    </CalculatorShell>
  )
}

// ─── Flooring ─────────────────────────────────────────────────────────────────
export function FlooringCalc() {
  const { flooring, updateFlooring } = useStore()
  const results = calcFlooring(flooring)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Room Length" unit="ft"><NumInput value={flooring.length} onChange={v => updateFlooring({ length: v })} /></InputGroup>
      <InputGroup label="Room Width" unit="ft"><NumInput value={flooring.width} onChange={v => updateFlooring({ width: v })} /></InputGroup>
      <InputGroup label="Cost Per Sq Ft" unit="$">
        <NumInput value={flooring.costPerSqFt} onChange={v => updateFlooring({ costPerSqFt: v })} min={0} step={0.25} />
      </InputGroup>
      <WasteInput waste={flooring.waste} includeWaste={flooring.includeWaste} onWasteChange={v => updateFlooring({ waste: v })} onIncludeChange={v => updateFlooring({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Insulation ───────────────────────────────────────────────────────────────
export function InsulationCalc() {
  const { insulation, updateInsulation } = useStore()
  const results = calcInsulation(insulation)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Area" unit="sq ft"><NumInput value={insulation.area} onChange={v => updateInsulation({ area: v })} /></InputGroup>
      <InputGroup label="Type">
        <SelectInput value={insulation.type} onChange={v => updateInsulation({ type: v })} options={[{ value: 'batt', label: 'Fiberglass Batt' }, { value: 'sprayfoam', label: 'Spray Foam' }, { value: 'cellulose-blown', label: 'Cellulose Blown-In' }, { value: 'cellulose-dense', label: 'Cellulose Dense-Pack' }]} />
      </InputGroup>
      <InputGroup label="R-Value">
        <SelectInput value={insulation.rValue} onChange={v => updateInsulation({ rValue: Number(v) })} options={[{ value: 11, label: 'R-11' }, { value: 13, label: 'R-13' }, { value: 19, label: 'R-19' }, { value: 21, label: 'R-21' }, { value: 30, label: 'R-30' }, { value: 38, label: 'R-38' }]} />
      </InputGroup>
      <InputGroup label="Stud Size">
        <ToggleGroup value={insulation.studSize} onChange={v => updateInsulation({ studSize: v })} options={[{ value: '2x4', label: '2×4' }, { value: '2x6', label: '2×6' }]} />
      </InputGroup>
      <WasteInput waste={insulation.waste} includeWaste={insulation.includeWaste} onWasteChange={v => updateInsulation({ waste: v })} onIncludeChange={v => updateInsulation({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Spray Foam ───────────────────────────────────────────────────────────────
export function SprayFoamCalc() {
  const { sprayfoam, updateSprayFoam } = useStore()
  const results = calcSprayFoam(sprayfoam)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Area" unit="sq ft"><NumInput value={sprayfoam.area} onChange={v => updateSprayFoam({ area: v })} /></InputGroup>
      <InputGroup label="Thickness" unit="inches">
        <NumInput value={sprayfoam.thickness} onChange={v => updateSprayFoam({ thickness: v })} min={0.5} max={6} step={0.5} />
      </InputGroup>
      <InputGroup label="Type">
        <ToggleGroup value={sprayfoam.type} onChange={v => updateSprayFoam({ type: v })} options={[{ value: 'closed', label: 'Closed-Cell' }, { value: 'open', label: 'Open-Cell' }]} />
      </InputGroup>
      <WasteInput waste={sprayfoam.waste} includeWaste={sprayfoam.includeWaste} onWasteChange={v => updateSprayFoam({ waste: v })} onIncludeChange={v => updateSprayFoam({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Cellulose ────────────────────────────────────────────────────────────────
export function CelluloseCalc() {
  const { cellulose, updateCellulose } = useStore()
  const results = calcCellulose(cellulose)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Area" unit="sq ft"><NumInput value={cellulose.area} onChange={v => updateCellulose({ area: v })} /></InputGroup>
      <InputGroup label="R-Value Target">
        <NumInput value={cellulose.rValue} onChange={v => updateCellulose({ rValue: v })} min={11} max={60} step={1} />
      </InputGroup>
      <InputGroup label="Application">
        <ToggleGroup value={cellulose.type} onChange={v => updateCellulose({ type: v })} options={[{ value: 'attic', label: 'Attic Blown' }, { value: 'dense-pack', label: 'Dense-Pack' }]} />
      </InputGroup>
      <WasteInput waste={cellulose.waste} includeWaste={cellulose.includeWaste} onWasteChange={v => updateCellulose({ waste: v })} onIncludeChange={v => updateCellulose({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Siding ───────────────────────────────────────────────────────────────────
export function SidingCalc() {
  const { siding, updateSiding } = useStore()
  const results = calcSiding(siding)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Wall Area" unit="sq ft" description="Total exterior wall area">
        <NumInput value={siding.area} onChange={v => updateSiding({ area: v })} />
      </InputGroup>
      <WasteInput waste={siding.waste} includeWaste={siding.includeWaste} onWasteChange={v => updateSiding({ waste: v })} onIncludeChange={v => updateSiding({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Paint ────────────────────────────────────────────────────────────────────
export function PaintCalc() {
  const { paint, updatePaint } = useStore()
  const results = calcPaint(paint)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Wall Area" unit="sq ft"><NumInput value={paint.area} onChange={v => updatePaint({ area: v })} /></InputGroup>
      <InputGroup label="Number of Coats">
        <ToggleGroup value={String(paint.coats) as '1' | '2' | '3'} onChange={v => updatePaint({ coats: parseInt(v) })} options={[{ value: '1', label: '1 Coat' }, { value: '2', label: '2 Coats' }, { value: '3', label: '3 Coats' }]} />
      </InputGroup>
      <WasteInput waste={paint.waste} includeWaste={paint.includeWaste} onWasteChange={v => updatePaint({ waste: v })} onIncludeChange={v => updatePaint({ includeWaste: v })} />
    </CalculatorShell>
  )
}

// ─── Wire Gauge ───────────────────────────────────────────────────────────────
export function WireGaugeCalc() {
  const { wireGauge, updateWireGauge } = useStore()
  const results = calcWireGauge(wireGauge)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Load" unit="amps">
        <NumInput value={wireGauge.amps} onChange={v => updateWireGauge({ amps: v })} min={1} max={400} step={1} />
      </InputGroup>
      <InputGroup label="Voltage">
        <ToggleGroup value={String(wireGauge.voltage) as '120' | '240'} onChange={v => updateWireGauge({ voltage: parseInt(v) as 120 | 240 })} options={[{ value: '120', label: '120V' }, { value: '240', label: '240V' }]} />
      </InputGroup>
      <InputGroup label="One-Way Distance" unit="ft">
        <NumInput value={wireGauge.distance} onChange={v => updateWireGauge({ distance: v })} min={1} max={1000} step={5} />
      </InputGroup>
      <InputGroup label="Wire Material">
        <ToggleGroup value={wireGauge.material} onChange={v => updateWireGauge({ material: v })} options={[{ value: 'copper', label: 'Copper' }, { value: 'aluminum', label: 'Aluminum' }]} />
      </InputGroup>
    </CalculatorShell>
  )
}

// ─── Labor ────────────────────────────────────────────────────────────────────
export function LaborCalc() {
  const { labor, updateLabor } = useStore()
  const results = calcLabor(labor)
  return (
    <CalculatorShell results={results}>
      <InputGroup label="Number of Workers">
        <NumInput value={labor.workers} onChange={v => updateLabor({ workers: v })} min={1} max={100} step={1} />
      </InputGroup>
      <InputGroup label="Hours Per Worker" unit="hrs">
        <NumInput value={labor.hours} onChange={v => updateLabor({ hours: v })} min={0.5} max={24} step={0.5} />
      </InputGroup>
      <InputGroup label="Hourly Wage" unit="$/hr">
        <NumInput value={labor.wage} onChange={v => updateLabor({ wage: v })} min={7.25} max={500} step={0.25} />
      </InputGroup>
    </CalculatorShell>
  )
}

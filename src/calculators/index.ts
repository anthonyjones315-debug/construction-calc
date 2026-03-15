import type { CalculationResult } from "@/types";
import {
  sanitizeNum,
  clamp,
  safeDiv,
  round,
  safeCeil,
  validateWaste,
  cents,
} from "@/utils/validate";

// ─── Concrete ─────────────────────────────────────────────────────────────────

export interface ConcreteInputs {
  type: "slab" | "footing" | "forms";
  length: number;
  width: number;
  thickness: number; // inches
  bagSize: 80 | 60;
  waste: number; // %
  includeWaste: boolean;
}

export function calcConcrete(i: ConcreteInputs): CalculationResult[] {
  const length = clamp(sanitizeNum(i.length, 0), 0, 10000);
  const width = clamp(sanitizeNum(i.width, 0), 0, 10000);
  const thickness = clamp(sanitizeNum(i.thickness, 4), 0.5, 120);
  const waste = validateWaste(i.waste);
  const volumeCuFt = round(length * width * (thickness / 12), 6);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const withWaste = round(volumeCuFt * mult, 6);
  const cuYd = safeDiv(withWaste, 27);
  const yieldPerBag = i.bagSize === 80 ? 0.6 : 0.45;
  const bags = safeCeil(safeDiv(withWaste, yieldPerBag));

  const results: CalculationResult[] = [
    { label: "Volume", value: cuYd.toFixed(2), unit: "cu yd", highlight: true },
    { label: "Volume", value: withWaste.toFixed(2), unit: "cu ft" },
    {
      label: "Bags Needed",
      value: bags,
      unit: `${i.bagSize}lb bags`,
      description: i.includeWaste
        ? `Includes ${i.waste}% waste`
        : "No waste applied",
    },
  ];

  if (i.type === "forms") {
    const perimeter = (i.length + i.width) * 2;
    results.push({
      label: "Form Boards (2×4×8)",
      value: Math.ceil(perimeter / 8),
      unit: "ea",
      description: "Based on perimeter",
    });
  }
  return results;
}

// ─── Framing ──────────────────────────────────────────────────────────────────

export interface FramingInputs {
  wallLength: number;
  wallHeight: number;
  spacing: 12 | 16 | 24;
  hasSheathing: boolean;
  hasDrywall: boolean;
  waste: number;
  includeWaste: boolean;
}

export function calcFraming(i: FramingInputs): CalculationResult[] {
  const wallLength = clamp(sanitizeNum(i.wallLength, 0), 0, 10000);
  const wallHeight = clamp(sanitizeNum(i.wallHeight, 0), 0, 1000);
  const spacing = clamp(sanitizeNum(i.spacing, 16), 12, 24);
  const waste = validateWaste(i.waste);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const baseStuds = safeCeil(safeDiv(wallLength * 12, spacing)) + 1;
  const studs = Math.ceil(baseStuds * mult);

  const results: CalculationResult[] = [
    {
      label: "Studs Needed",
      value: studs,
      unit: "studs",
      highlight: true,
      description: `${spacing}" OC${i.includeWaste ? ` + ${waste}% waste` : ""}`,
    },
    {
      label: "Framing Nails",
      value: studs * 6,
      unit: "nails",
      description: "Approx. 3 per connection",
    },
  ];

  if (i.hasSheathing) {
    const sheets = Math.ceil((wallLength * wallHeight * mult) / 32);
    results.push({
      label: "Sheathing Sheets",
      value: sheets,
      unit: "sheets",
      description: "4×8 sheets",
    });
    results.push({
      label: "Sheathing Nails",
      value: sheets * 35,
      unit: "nails",
      description: '8d nails, 6" edge / 12" field',
    });
  }

  if (i.hasDrywall) {
    const sheets = Math.ceil((wallLength * wallHeight * mult) / 32);
    results.push({
      label: "Drywall Sheets",
      value: sheets,
      unit: "sheets",
      description: "4×8 sheets",
    });
    results.push({
      label: "Drywall Screws",
      value: sheets * 32,
      unit: "screws",
      description: '1-1/4" screws, 12" spacing',
    });
  }

  return results;
}

// ─── Roofing ──────────────────────────────────────────────────────────────────

export interface RoofingInputs {
  length: number;
  width: number;
  pitch: number; // x/12
  type: "shingles" | "metal";
  hasDecking: boolean;
  waste: number;
  includeWaste: boolean;
}

export function calcRoofing(i: RoofingInputs): CalculationResult[] {
  const length = clamp(sanitizeNum(i.length, 0), 0, 10000);
  const width = clamp(sanitizeNum(i.width, 0), 0, 10000);
  const pitch = clamp(sanitizeNum(i.pitch, 4), 0, 24);
  const waste = validateWaste(i.waste);
  const multiplier = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const actualArea = round(length * width * multiplier, 6);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const areaWithWaste = round(actualArea * mult, 6);

  const results: CalculationResult[] = [
    {
      label: "Roof Area",
      value: actualArea.toFixed(1),
      unit: "sq ft",
      highlight: true,
    },
    {
      label: "Pitch Multiplier",
      value: multiplier.toFixed(3),
      unit: "x",
      description: `${pitch}/12 pitch`,
    },
  ];

  if (i.hasDecking) {
    results.push({
      label: "Decking Sheets",
      value: Math.ceil(areaWithWaste / 32),
      unit: "sheets",
      description: "4×8 sheets",
    });
  }

  if (i.type === "shingles") {
    const squares = Math.ceil(areaWithWaste / 100);
    results.push({
      label: "Squares",
      value: squares,
      unit: "sq",
      description: "100 sq ft each",
    });
    results.push({
      label: "Bundles",
      value: squares * 3,
      unit: "bundles",
      description: i.includeWaste ? `Includes ${waste}% waste` : "No waste",
    });
  } else {
    results.push({
      label: "Metal Panels",
      value: Math.ceil(areaWithWaste / 36),
      unit: "panels",
      description: "3ft wide panels",
    });
  }

  return results;
}

// ─── Roof Pitch ───────────────────────────────────────────────────────────────

export interface RoofPitchInputs {
  rise: number; // inches
  run: number; // inches
  spanFt: number;
}

export function calcRoofPitch(i: RoofPitchInputs): CalculationResult[] {
  const rise = clamp(sanitizeNum(i.rise, 0), 0, 1200);
  const run = clamp(sanitizeNum(i.run, 12), 0.01, 1200);
  const spanFt = clamp(sanitizeNum(i.spanFt, 0), 0, 10000);
  const slope = safeDiv(rise, run);
  const pitch = slope * 12;
  const angleDeg = Math.atan(slope) * (180 / Math.PI);
  const multiplier = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const rafterLength = (spanFt / 2) * multiplier;

  return [
    {
      label: "Pitch",
      value: `${pitch.toFixed(1)}/12`,
      unit: "",
      highlight: true,
    },
    { label: "Angle", value: angleDeg.toFixed(1), unit: "°" },
    {
      label: "Slope Multiplier",
      value: multiplier.toFixed(4),
      unit: "x",
      description: "Multiply flat area by this",
    },
    {
      label: "Rafter Length",
      value: rafterLength.toFixed(2),
      unit: "ft",
      description: `Based on ${spanFt}ft span`,
    },
  ];
}

// ─── Roofing Squares ─────────────────────────────────────────────────────────

export interface RoofingSquaresInputs {
  length: number;
  width: number;
  pitch: number;
  waste: number;
  includeWaste: boolean;
}

export function calcRoofingSquares(
  i: RoofingSquaresInputs,
): CalculationResult[] {
  const length = clamp(sanitizeNum(i.length, 0), 0, 10000);
  const width = clamp(sanitizeNum(i.width, 0), 0, 10000);
  const pitch = clamp(sanitizeNum(i.pitch, 4), 0, 24);
  const waste = validateWaste(i.waste);
  const multiplier = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const actualArea = round(length * width * multiplier, 6);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const withWaste = round(actualArea * mult, 6);
  const squares = Math.ceil(withWaste / 100);
  const bundles = squares * 3;
  const ridgeCap = Math.ceil((length * mult) / 35);

  return [
    { label: "Roof Squares", value: squares, unit: "sq", highlight: true },
    {
      label: "Shingle Bundles",
      value: bundles,
      unit: "bundles",
      description: "3 bundles per square",
    },
    {
      label: "Ridge Cap Bundles",
      value: ridgeCap,
      unit: "bundles",
      description: "35 LF per bundle",
    },
    { label: "Total Area", value: withWaste.toFixed(1), unit: "sq ft" },
  ];
}

// ─── Rafter Length ────────────────────────────────────────────────────────────

export interface RafterInputs {
  span: number; // ft — total building width
  pitch: number; // x/12
  overhang: number; // inches
  count: number;
}

export function calcRafters(i: RafterInputs): CalculationResult[] {
  const span = clamp(sanitizeNum(i.span, 0), 0, 10000);
  const pitch = clamp(sanitizeNum(i.pitch, 4), 0, 24);
  const overhang = clamp(sanitizeNum(i.overhang, 0), 0, 120);
  const count = safeCeil(clamp(sanitizeNum(i.count, 0), 0, 10000));
  const runFt = span / 2;
  const multiplier = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const rafterRun = runFt * multiplier;
  const overhangFt = (overhang / 12) * multiplier;
  const totalLength = rafterRun + overhangFt;
  const boardLength = Math.ceil(totalLength / 2) * 2; // round up to even ft

  return [
    {
      label: "Rafter Length",
      value: totalLength.toFixed(2),
      unit: "ft",
      highlight: true,
    },
    {
      label: "Buy Length",
      value: `${boardLength}ft`,
      unit: "boards",
      description: "Rounded to standard lumber",
    },
    {
      label: "Total Board Feet",
      value: (boardLength * count * (1.5 / 12)).toFixed(1),
      unit: "bd ft",
      description: `${count} rafters`,
    },
    { label: "Ridge Length", value: span.toFixed(1), unit: "ft" },
  ];
}

// ─── Flooring ─────────────────────────────────────────────────────────────────

export interface FlooringInputs {
  length: number;
  width: number;
  waste: number;
  includeWaste: boolean;
  costPerSqFt: number;
}

export function calcFlooring(i: FlooringInputs): CalculationResult[] {
  const length = clamp(sanitizeNum(i.length, 0), 0, 10000);
  const width = clamp(sanitizeNum(i.width, 0), 0, 10000);
  const waste = validateWaste(i.waste);
  const costPerSqFt = clamp(sanitizeNum(i.costPerSqFt, 0), 0, 10000);
  const area = round(length * width, 6);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const withWaste = round(area * mult, 6);
  const totalCost = cents(withWaste * costPerSqFt) / 100;

  return [
    {
      label: "Floor Area",
      value: area.toFixed(1),
      unit: "sq ft",
      highlight: true,
    },
    {
      label: "Order Qty",
      value: withWaste.toFixed(1),
      unit: "sq ft",
      description: i.includeWaste ? `${waste}% waste factor` : "No waste",
    },
    { label: "Estimated Cost", value: totalCost.toFixed(2), unit: "$" },
  ];
}

// ─── Insulation (Batt) ────────────────────────────────────────────────────────

export interface InsulationInputs {
  area: number;
  type: "batt" | "sprayfoam" | "cellulose-blown" | "cellulose-dense";
  rValue: number;
  studSize: "2x4" | "2x6";
  spacing: 16 | 24;
  waste: number;
  includeWaste: boolean;
}

export function calcInsulation(i: InsulationInputs): CalculationResult[] {
  const areaInput = clamp(sanitizeNum(i.area, 0), 0, 1_000_000);
  const rValue = clamp(sanitizeNum(i.rValue, 0), 0, 100);
  const spacing = clamp(sanitizeNum(i.spacing, 16), 16, 24);
  const waste = validateWaste(i.waste);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const area = round(areaInput * mult, 6);
  const depth = i.studSize === "2x4" ? 3.5 : 5.5;

  const results: CalculationResult[] = [
    {
      label: "Coverage Area",
      value: area.toFixed(1),
      unit: "sq ft",
      highlight: true,
    },
  ];

  if (i.type === "batt") {
    results.push({
      label: "Packs Needed",
      value: Math.ceil(area / 40),
      unit: "packs",
      description: `R-${rValue} for ${i.studSize} @ ${spacing}"OC`,
    });
  } else if (i.type === "sprayfoam") {
    results.push({
      label: "Board Feet",
      value: (area * depth).toFixed(0),
      unit: "bd ft",
      description: "Closed-cell foam volume",
    });
  } else {
    const density = i.type === "cellulose-blown" ? 1.5 : 3.5;
    const volume = (area * depth) / 12;
    results.push({
      label: "Bags Needed",
      value: Math.ceil((volume * density) / 25),
      unit: "bags",
      description: `${i.type === "cellulose-blown" ? "Blown" : "Dense-pack"} cellulose`,
    });
  }

  return results;
}

// ─── Spray Foam ───────────────────────────────────────────────────────────────

export interface SprayFoamInputs {
  area: number;
  thickness: number; // inches
  type: "open" | "closed";
  waste: number;
  includeWaste: boolean;
}

export function calcSprayFoam(i: SprayFoamInputs): CalculationResult[] {
  const area = clamp(sanitizeNum(i.area, 0), 0, 1_000_000);
  const thickness = clamp(sanitizeNum(i.thickness, 1), 0, 24);
  const waste = validateWaste(i.waste);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const boardFeet = round(area * thickness * mult, 6);
  const rValuePerInch = i.type === "closed" ? 6.5 : 3.7;
  const totalRValue = rValuePerInch * thickness;
  // Typical 2-component kit: 600 bd ft for closed, 1000 for open
  const kitSize = i.type === "closed" ? 600 : 1000;
  const kits = Math.ceil(boardFeet / kitSize);

  return [
    {
      label: "Board Feet",
      value: boardFeet.toFixed(0),
      unit: "bd ft",
      highlight: true,
    },
    {
      label: "R-Value Achieved",
      value: `R-${totalRValue.toFixed(1)}`,
      unit: "",
      description: `${rValuePerInch}/inch for ${i.type}-cell`,
    },
    {
      label: "Kits Needed",
      value: kits,
      unit: "kits",
      description: `${kitSize} bd ft per kit`,
    },
  ];
}

// ─── Cellulose ────────────────────────────────────────────────────────────────

export interface CelluloseInputs {
  area: number;
  rValue: number;
  type: "attic" | "dense-pack";
  waste: number;
  includeWaste: boolean;
}

export function calcCellulose(i: CelluloseInputs): CalculationResult[] {
  const areaInput = clamp(sanitizeNum(i.area, 0), 0, 1_000_000);
  const rValue = clamp(sanitizeNum(i.rValue, 0), 0, 100);
  const waste = validateWaste(i.waste);
  const depthInches = i.type === "attic" ? rValue / 3.7 : rValue / 3.5;
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const area = round(areaInput * mult, 6);
  const cubicFeet = (area * depthInches) / 12;
  const density = i.type === "attic" ? 1.5 : 3.5;
  const lbs = cubicFeet * density;
  const bags = Math.ceil(lbs / 30);

  return [
    { label: "Bags Needed", value: bags, unit: "30lb bags", highlight: true },
    {
      label: "Depth Required",
      value: depthInches.toFixed(1),
      unit: "inches",
      description: `For R-${rValue}`,
    },
    { label: "Total Weight", value: lbs.toFixed(0), unit: "lbs" },
    { label: "Coverage Area", value: area.toFixed(0), unit: "sq ft" },
  ];
}

// ─── Siding ───────────────────────────────────────────────────────────────────

export interface SidingInputs {
  area: number;
  waste: number;
  includeWaste: boolean;
}

export function calcSiding(i: SidingInputs): CalculationResult[] {
  const area = clamp(sanitizeNum(i.area, 0), 0, 1_000_000);
  const waste = validateWaste(i.waste);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const totalArea = round(area * mult, 6);
  const squares = Math.ceil(totalArea / 100);

  return [
    {
      label: "Squares Needed",
      value: squares,
      unit: "sq",
      highlight: true,
      description: "100 sq ft per square",
    },
    { label: "Total Area", value: totalArea.toFixed(0), unit: "sq ft" },
    {
      label: "Siding Nails",
      value: squares * 250,
      unit: "nails",
      description: "Approx. 250 per square",
    },
  ];
}

// ─── Paint ────────────────────────────────────────────────────────────────────

export interface PaintInputs {
  area: number;
  coats: number;
  waste: number;
  includeWaste: boolean;
}

export function calcPaint(i: PaintInputs): CalculationResult[] {
  const area = clamp(sanitizeNum(i.area, 0), 0, 1_000_000);
  const coats = safeCeil(clamp(sanitizeNum(i.coats, 1), 1, 10));
  const waste = validateWaste(i.waste);
  const mult = i.includeWaste ? 1 + waste / 100 : 1;
  const totalArea = round(area * coats * mult, 6);
  const gallons = Math.ceil(totalArea / 350);

  return [
    { label: "Gallons Needed", value: gallons, unit: "gal", highlight: true },
    {
      label: "Coverage Area",
      value: totalArea.toFixed(0),
      unit: "sq ft",
      description: `${coats} coat${coats > 1 ? "s" : ""}, 350 sq ft/gal`,
    },
  ];
}

// ─── Labor ────────────────────────────────────────────────────────────────────

export interface LaborInputs {
  workers: number;
  hours: number;
  wage: number;
}

export function calcLabor(i: LaborInputs): CalculationResult[] {
  const workers = clamp(sanitizeNum(i.workers, 0), 0, 10000);
  const hours = clamp(sanitizeNum(i.hours, 0), 0, 1000);
  const wage = clamp(sanitizeNum(i.wage, 0), 0, 10000);
  const totalHours = round(workers * hours, 6);
  const totalCost = cents(totalHours * wage) / 100;

  return [
    {
      label: "Total Labor Cost",
      value: `$${totalCost.toFixed(2)}`,
      unit: "",
      highlight: true,
    },
    { label: "Total Hours", value: totalHours, unit: "hrs" },
    {
      label: "Per Worker",
      value: `$${(cents(hours * wage) / 100).toFixed(2)}`,
      unit: "",
      description: `${hours}h × $${wage}/hr`,
    },
  ];
}

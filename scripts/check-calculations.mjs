import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const calculatorsPath = path.resolve(__dirname, "../dist-calcs/calculators/index.js");
const calculators = await import(calculatorsPath);

const {
  calcConcrete,
  calcFraming,
  calcRoofing,
  calcRoofPitch,
  calcRoofingSquares,
  calcRafters,
  calcFlooring,
  calcInsulation,
  calcSprayFoam,
  calcCellulose,
  calcSiding,
  calcPaint,
  calcWireGauge,
  calcLabor,
} = calculators;

const parse = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const findResult = (results, label, unit) => {
  const match = results.find((item) => item.label === label && (!unit || item.unit === unit));
  assert(match, `Result ${label}${unit ? ` (${unit})` : ""} is missing`);
  return match;
};

const approx = (label, actual, expected, tolerance = 0.1) => {
  const diff = Math.abs(actual - expected);
  assert(
    diff <= tolerance,
    `${label} should be around ${expected} (actual ${actual}, tolerance ${tolerance})`,
  );
};

const roundDecimals = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const check = () => {
  const concrete = calcConcrete({
    type: "slab",
    length: 10,
    width: 10,
    thickness: 6,
    bagSize: 80,
    waste: 10,
    includeWaste: true,
  });
  approx("Concrete volume (cu yd)", parse(findResult(concrete, "Volume", "cu yd").value), 2.04, 0.01);
  approx("Concrete volume (cu ft)", parse(findResult(concrete, "Volume", "cu ft").value), 55.0, 0.01);
  assert.strictEqual(findResult(concrete, "Bags Needed").value, 92);

  const framing = calcFraming({
    wallLength: 30,
    wallHeight: 8,
    spacing: 16,
    hasSheathing: true,
    hasDrywall: true,
    waste: 10,
    includeWaste: true,
  });
  assert.strictEqual(parse(findResult(framing, "Studs Needed").value), 27);
  assert.strictEqual(findResult(framing, "Framing Nails").value, 162);
  assert.strictEqual(findResult(framing, "Sheathing Sheets").value, 9);
  assert.strictEqual(findResult(framing, "Drywall Sheets").value, 9);
  assert.strictEqual(findResult(framing, "Sheathing Nails").value, 315);
  assert.strictEqual(findResult(framing, "Drywall Screws").value, 288);

  const roofing = calcRoofing({
    length: 20,
    width: 12,
    pitch: 6,
    type: "shingles",
    hasDecking: true,
    waste: 5,
    includeWaste: true,
  });
  const pitchMult = Math.sqrt(1 + (6 / 12) ** 2);
  const rawArea = roundDecimals(20 * 12 * pitchMult, 6);
  const areaWithWaste = roundDecimals(rawArea * 1.05, 6);
  approx("Roof area", parse(findResult(roofing, "Roof Area").value), Number(rawArea.toFixed(1)), 0.05);
  approx("Pitch multiplier", parse(findResult(roofing, "Pitch Multiplier").value), Number(pitchMult.toFixed(3)), 0.01);
  assert.strictEqual(findResult(roofing, "Decking Sheets").value, 9);
  assert.strictEqual(findResult(roofing, "Squares").value, 3);
  assert.strictEqual(findResult(roofing, "Bundles").value, 9);

  const roofSquares = calcRoofingSquares({
    length: 30,
    width: 8,
    pitch: 6,
    waste: 5,
    includeWaste: true,
  });
  const roofRawArea = roundDecimals(30 * 8 * pitchMult, 6);
  const roofTotal = roundDecimals(roofRawArea * 1.05, 6);
  assert.strictEqual(findResult(roofSquares, "Roof Squares").value, 3);
  assert.strictEqual(findResult(roofSquares, "Shingle Bundles").value, 9);
  assert.strictEqual(findResult(roofSquares, "Ridge Cap Bundles").value, 1);
  approx("Roof squares total area", parse(findResult(roofSquares, "Total Area").value), Number(roofTotal.toFixed(1)), 0.05);

  const pitch = calcRoofPitch({ rise: 9, run: 12, spanFt: 26 });
  approx("Roof pitch angle", parse(findResult(pitch, "Angle").value), 36.9, 0.1);
  approx("Roof rafter length", parse(findResult(pitch, "Rafter Length").value), 16.25, 0.05);

  const rafters = calcRafters({ span: 24, pitch: 6, overhang: 12, count: 10 });
  approx("Rafter length", parse(findResult(rafters, "Rafter Length").value), 14.53, 0.05);
  assert.strictEqual(findResult(rafters, "Buy Length").value, "16ft");
  assert.strictEqual(parse(findResult(rafters, "Total Board Feet").value), 20);
  assert.strictEqual(parse(findResult(rafters, "Ridge Length").value), 24);

  const flooring = calcFlooring({ length: 12, width: 15, waste: 7, includeWaste: true, costPerSqFt: 3.25 });
  assert.strictEqual(parse(findResult(flooring, "Floor Area").value), 180);
  assert.strictEqual(parse(findResult(flooring, "Order Qty").value), 192.6);
  approx("Flooring cost", parse(findResult(flooring, "Estimated Cost").value), 625.95, 0.01);

  const insulation = calcInsulation({
    area: 1000,
    type: "batt",
    rValue: 13,
    studSize: "2x4",
    spacing: 16,
    waste: 5,
    includeWaste: true,
  });
  assert.strictEqual(findResult(insulation, "Packs Needed").value, 27);

  const spray = calcSprayFoam({ area: 800, thickness: 2, type: "open", waste: 10, includeWaste: true });
  assert.strictEqual(parse(findResult(spray, "Board Feet").value), 1760);
  assert.strictEqual(findResult(spray, "Kits Needed").value, 2);

  const cellulose = calcCellulose({ area: 600, rValue: 20, type: "attic", waste: 5, includeWaste: true });
  assert.strictEqual(findResult(cellulose, "Bags Needed").value, 15);
  approx("Cellulose depth", parse(findResult(cellulose, "Depth Required").value), 5.4, 0.1);
  assert.strictEqual(parse(findResult(cellulose, "Total Weight").value), 426);
  assert.strictEqual(parse(findResult(cellulose, "Coverage Area").value), 630);

  const siding = calcSiding({ area: 2000, waste: 8, includeWaste: true });
  assert.strictEqual(findResult(siding, "Squares Needed").value, 22);
  assert.strictEqual(parse(findResult(siding, "Total Area").value), 2160);
  assert.strictEqual(findResult(siding, "Siding Nails").value, 5500);

  const paint = calcPaint({ area: 1800, coats: 2, waste: 5, includeWaste: true });
  assert.strictEqual(findResult(paint, "Gallons Needed").value, 11);

  const wire = calcWireGauge({ amps: 40, voltage: 120, distance: 50, material: "copper" });
  assert.strictEqual(findResult(wire, "Recommended Gauge").value, "8 AWG");
  approx("Voltage drop", parse(findResult(wire, "Voltage Drop").value), 3.13, 0.05);
  assert.strictEqual(parse(findResult(wire, "Wire Length").value), 100);

  const labor = calcLabor({ workers: 5, hours: 8, wage: 30 });
  approx("Labor cost", parse(findResult(labor, "Total Labor Cost").value), 1200, 0.01);
  assert.strictEqual(findResult(labor, "Total Hours").value, 40);
  approx("Per worker cost", parse(findResult(labor, "Per Worker").value), 240, 0.01);

  const brokenFlooring = calcFlooring({ length: "abc", width: "", waste: 150, includeWaste: true, costPerSqFt: "-" });
  assert.strictEqual(parse(findResult(brokenFlooring, "Order Qty").value), 0);
  assert.strictEqual(parse(findResult(brokenFlooring, "Estimated Cost").value), 0);
};

try {
  check();
  console.log("Calculator sanity checks passed.");
} catch (error) {
  console.error("Calculator sanity checks failed:", error);
  process.exit(1);
}

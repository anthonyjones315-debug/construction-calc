"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

// Unit categories for construction
const CATEGORIES = [
  {
    id: "length",
    label: "Length",
    emoji: "📏",
    units: [
      {
        id: "in",
        label: "Inches (in)",
        toBase: (v: number) => v * 0.0254,
        fromBase: (v: number) => v / 0.0254,
      },
      {
        id: "ft",
        label: "Feet (ft)",
        toBase: (v: number) => v * 0.3048,
        fromBase: (v: number) => v / 0.3048,
      },
      {
        id: "yd",
        label: "Yards (yd)",
        toBase: (v: number) => v * 0.9144,
        fromBase: (v: number) => v / 0.9144,
      },
      {
        id: "m",
        label: "Meters (m)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      {
        id: "cm",
        label: "Centimeters (cm)",
        toBase: (v: number) => v / 100,
        fromBase: (v: number) => v * 100,
      },
      {
        id: "mm",
        label: "Millimeters (mm)",
        toBase: (v: number) => v / 1000,
        fromBase: (v: number) => v * 1000,
      },
    ],
  },
  {
    id: "area",
    label: "Area",
    emoji: "⬛",
    units: [
      {
        id: "in2",
        label: "Sq Inches (in²)",
        toBase: (v: number) => v * 0.00064516,
        fromBase: (v: number) => v / 0.00064516,
      },
      {
        id: "ft2",
        label: "Sq Feet (ft²)",
        toBase: (v: number) => v * 0.092903,
        fromBase: (v: number) => v / 0.092903,
      },
      {
        id: "yd2",
        label: "Sq Yards (yd²)",
        toBase: (v: number) => v * 0.836127,
        fromBase: (v: number) => v / 0.836127,
      },
      {
        id: "m2",
        label: "Sq Meters (m²)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      {
        id: "acre",
        label: "Acres",
        toBase: (v: number) => v * 4046.86,
        fromBase: (v: number) => v / 4046.86,
      },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    emoji: "📦",
    units: [
      {
        id: "in3",
        label: "Cubic Inches (in³)",
        toBase: (v: number) => v * 0.0000163871,
        fromBase: (v: number) => v / 0.0000163871,
      },
      {
        id: "ft3",
        label: "Cubic Feet (ft³)",
        toBase: (v: number) => v * 0.0283168,
        fromBase: (v: number) => v / 0.0283168,
      },
      {
        id: "yd3",
        label: "Cubic Yards (yd³)",
        toBase: (v: number) => v * 0.764555,
        fromBase: (v: number) => v / 0.764555,
      },
      {
        id: "m3",
        label: "Cubic Meters (m³)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      {
        id: "gal",
        label: "Gallons (US)",
        toBase: (v: number) => v * 0.00378541,
        fromBase: (v: number) => v / 0.00378541,
      },
      {
        id: "L",
        label: "Liters (L)",
        toBase: (v: number) => v * 0.001,
        fromBase: (v: number) => v * 1000,
      },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    emoji: "⚖️",
    units: [
      {
        id: "oz",
        label: "Ounces (oz)",
        toBase: (v: number) => v * 0.0283495,
        fromBase: (v: number) => v / 0.0283495,
      },
      {
        id: "lb",
        label: "Pounds (lb)",
        toBase: (v: number) => v * 0.453592,
        fromBase: (v: number) => v / 0.453592,
      },
      {
        id: "ton",
        label: "Tons (short)",
        toBase: (v: number) => v * 907.185,
        fromBase: (v: number) => v / 907.185,
      },
      {
        id: "kg",
        label: "Kilograms (kg)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      {
        id: "g",
        label: "Grams (g)",
        toBase: (v: number) => v / 1000,
        fromBase: (v: number) => v * 1000,
      },
    ],
  },
  {
    id: "temp",
    label: "Temperature",
    emoji: "🌡️",
    units: [
      {
        id: "f",
        label: "Fahrenheit (°F)",
        toBase: (v: number) => ((v - 32) * 5) / 9,
        fromBase: (v: number) => (v * 9) / 5 + 32,
      },
      {
        id: "c",
        label: "Celsius (°C)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
    ],
  },
  {
    id: "pressure",
    label: "Pressure (PSI)",
    emoji: "💪",
    units: [
      {
        id: "psi",
        label: "PSI",
        toBase: (v: number) => v * 6894.76,
        fromBase: (v: number) => v / 6894.76,
      },
      {
        id: "kpa",
        label: "Kilopascals (kPa)",
        toBase: (v: number) => v * 1000,
        fromBase: (v: number) => v / 1000,
      },
      {
        id: "mpa",
        label: "Megapascals (MPa)",
        toBase: (v: number) => v * 1000000,
        fromBase: (v: number) => v / 1000000,
      },
      {
        id: "bar",
        label: "Bar",
        toBase: (v: number) => v * 100000,
        fromBase: (v: number) => v / 100000,
      },
      {
        id: "pa",
        label: "Pascals (Pa)",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
    ],
  },
];

export function UnitConverter() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(activeCat.units[0]);
  const [toUnit, setToUnit] = useState(activeCat.units[1]);
  const [inputVal, setInputVal] = useState("1");

  function changeCategory(catId: string) {
    const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
    setActiveCat(cat);
    setFromUnit(cat.units[0]);
    setToUnit(cat.units[1]);
    setInputVal("1");
  }

  function convert(raw: string): string {
    const v = parseFloat(raw);
    if (!isFinite(v) || isNaN(v) || raw === "") return "—";
    const base = fromUnit.toBase(v);
    const result = toUnit.fromBase(base);
    if (!isFinite(result)) return "—";
    // Smart decimal display
    if (Math.abs(result) >= 1000)
      return result.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (Math.abs(result) >= 1) return result.toFixed(4).replace(/\.?0+$/, "");
    return result.toFixed(8).replace(/\.?0+$/, "");
  }

  function swap() {
    const tmp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tmp);
  }

  const result = convert(inputVal);

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[--color-ink] flex items-center gap-2">
          🔄 Unit Converter
        </h1>
        <p className="text-sm text-[--color-ink-dim] mt-1">
          Construction unit conversions — length, area, volume, weight,
          temperature, pressure
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => changeCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCat.id === cat.id
                ? "bg-[--color-orange-brand] text-white"
                : "bg-white border border-gray-200 text-[--color-ink-mid] hover:border-[--color-orange-brand]"
            }`}
          >
            <span aria-hidden>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Converter card */}
      <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          {/* From */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">
              From
            </label>
            <select
              value={fromUnit.id}
              onChange={(e) =>
                setFromUnit(
                  activeCat.units.find((u) => u.id === e.target.value) ??
                    activeCat.units[0],
                )
              }
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] appearance-none"
            >
              {activeCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              inputMode="decimal"
              placeholder="Enter value"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-xl font-mono font-bold text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
            />
          </div>

          {/* Swap */}
          <button
            onClick={swap}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-full border border-gray-200 bg-white hover:bg-[--color-orange-soft] hover:border-[--color-orange-brand] transition-all"
            aria-label="Swap units"
          >
            <ArrowLeftRight className="w-4 h-4 text-[--color-ink-dim]" />
          </button>

          {/* To */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">
              To
            </label>
            <select
              value={toUnit.id}
              onChange={(e) =>
                setToUnit(
                  activeCat.units.find((u) => u.id === e.target.value) ??
                    activeCat.units[1],
                )
              }
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand] appearance-none"
            >
              {activeCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
            <div className="w-full px-4 py-3 rounded-xl border-2 border-[--color-orange-brand] bg-[--color-orange-soft] min-h-[52px] flex items-center">
              <span className="text-xl font-mono font-bold text-[--color-orange-brand]">
                {result}
              </span>
              <span className="text-sm text-[--color-ink-dim] ml-2">
                {toUnit.label.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Quick reference */}
        {activeCat.id === "length" && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-3">
              Quick Reference
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[--color-ink-dim]">
              {[
                ["1 ft", "12 in"],
                ["1 yd", "3 ft"],
                ["1 m", "3.281 ft"],
                ["1 in", "25.4 mm"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="bg-[--color-surface-alt] rounded-lg px-3 py-2 text-center"
                >
                  <span className="font-bold text-[--color-ink]">{a}</span> ={" "}
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeCat.id === "volume" && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-3">
              Concrete Quick Reference
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[--color-ink-dim]">
              {[
                ["1 yd³", "27 ft³"],
                ["1 yd³", "~40 80lb bags"],
                ["1 ft³", "~1.5 80lb bags"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="bg-[--color-surface-alt] rounded-lg px-3 py-2 text-center"
                >
                  <span className="font-bold text-[--color-ink]">{a}</span> ={" "}
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

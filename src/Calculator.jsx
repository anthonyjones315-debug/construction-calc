import { useState, useCallback, useEffect } from "react";
import { useSEO } from "./seo/useSEO.js";
import { AffiliateSuggestions, LeadGenCTA } from "./monetization.jsx";

// ─── THEME ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#f4f1eb", surface: "#ffffff", surfaceAlt: "#f9f7f3",
  border: "#d9d4c7", borderLight: "#c4bfb4",
  ink: "#1a1a1a", inkMid: "#555248", inkDim: "#8c887f",
  accent: "#e8820c", accentDark: "#c96d08", accentSoft: "rgba(232,130,12,0.10)",
  green: "#1a7a4a", greenSoft: "rgba(26,122,74,0.10)",
  red: "#c0392b", redSoft: "rgba(192,57,43,0.10)",
  blue: "#1d6fa4", blueSoft: "rgba(29,111,164,0.10)",
  purple: "#7c4dab", purpleSoft: "rgba(124,77,171,0.10)",
  navBg: "#1a1a1a", navText: "#c4bfb4", navActive: "#e8820c",
  // legacy aliases so inner components still work
  text: "#1a1a1a", textMid: "#555248", textDim: "#8c887f",
};
const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif";

// ─── PITCH MATERIAL GUIDE ──────────────────────────────────────────────────
const PITCH_MATERIALS = [
  {
    label: "Flat / Low Slope",
    range: [0, 2],
    color: C.blue, colorSoft: C.blueSoft,
    materials: ["TPO Membrane", "EPDM Rubber", "Modified Bitumen", "Built-Up Roofing (BUR)"],
    notes: "Requires special low-slope rated material. Drainage is critical.",
  },
  {
    label: "Conventional Slope",
    range: [2, 4],
    color: C.green, colorSoft: C.greenSoft,
    materials: ["Asphalt Shingles (low-slope rated)", "Metal Panels", "Rolled Roofing"],
    notes: "Most shingles require a minimum of 2/12 with underlayment.",
  },
  {
    label: "Standard Slope",
    range: [4, 9],
    color: C.accent, colorSoft: C.accentSoft,
    materials: ["Asphalt Shingles", "Metal Shingles", "Wood Shakes", "Slate", "Concrete Tile", "Clay Tile"],
    notes: "The most common residential range. All standard materials apply.",
  },
  {
    label: "Steep Slope",
    range: [9, 21],
    color: C.purple, colorSoft: C.purpleSoft,
    materials: ["Wood Shakes", "Slate", "Clay Tile", "Metal Shingles", "Specialty Shingles"],
    notes: "Steep pitches shed water fast but require special fastening techniques. Watch fall protection.",
  },
];

function getPitchCategory(pitch) {
  return PITCH_MATERIALS.find((p) => pitch >= p.range[0] && pitch < p.range[1]) ?? PITCH_MATERIALS[3];
}

// ─── PITCH VISUALIZER ──────────────────────────────────────────────────────
function PitchVisualizer({ pitch }) {
  const p = Math.min(Math.max(pitch, 0), 20);
  const angle = Math.atan(p / 12) * (180 / Math.PI);
  const factor = Math.sqrt(1 + Math.pow(p / 12, 2));
  const cat = getPitchCategory(p);

  // SVG roof shape
  const W = 220, H = 120, base = 180, margin = 20;
  const cx = W / 2;
  const riseH = Math.min((p / 12) * (base / 2), H - 10);
  const peakY = H - riseH;
  const leftX = margin, rightX = W - margin;
  const peakX = cx;

  return (
    <div style={{
      background: C.surfaceAlt, border: "1px solid " + cat.color,
      borderRadius: "12px", padding: "20px", marginBottom: "20px",
    }}>
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* SVG Diagram */}
        <div style={{ flexShrink: 0 }}>
          <svg width={W} height={H + 10} style={{ display: "block" }}>
            {/* Roof outline */}
            <polygon
              points={`${leftX},${H} ${peakX},${peakY} ${rightX},${H}`}
              fill={cat.colorSoft}
              stroke={cat.color}
              strokeWidth="2"
            />
            {/* Rise arrow */}
            <line x1={rightX + 8} y1={H} x2={rightX + 8} y2={peakY} stroke={C.textDim} strokeWidth="1" strokeDasharray="3,3" />
            <text x={rightX + 14} y={(H + peakY) / 2 + 4} fill={C.textMid} fontSize="10" fontFamily={font}>{p}</text>
            {/* Run arrow */}
            <line x1={peakX} y1={H + 6} x2={rightX} y2={H + 6} stroke={C.textDim} strokeWidth="1" strokeDasharray="3,3" />
            <text x={(peakX + rightX) / 2 - 4} y={H + 17} fill={C.textMid} fontSize="10" fontFamily={font}>12</text>
            {/* Pitch label */}
            <text x={peakX} y={peakY - 8} fill={cat.color} fontSize="12" fontFamily={font} fontWeight="700" textAnchor="middle">
              {p}/12
            </text>
          </svg>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, minWidth: "160px" }}>
          <div style={{
            display: "inline-block",
            background: cat.colorSoft, color: cat.color,
            fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px",
            textTransform: "uppercase", padding: "4px 10px", borderRadius: "5px",
            marginBottom: "12px",
          }}>
            {cat.label}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Pitch", value: p + "/12" },
              { label: "Angle", value: angle.toFixed(1) + "°" },
              { label: "Multiplier", value: factor.toFixed(4) },
              { label: "Rise per Foot", value: p + '"' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "10px", color: C.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "3px" }}>{s.label}</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: C.text }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOF PITCH CALCULATOR (special component) ─────────────────────────────
function RoofPitchCalc({ onSendToSquares }) {
  const [mode, setMode] = useState("pitch"); // "pitch" | "rise" | "angle"
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [materialIdx, setMaterialIdx] = useState(null);

  const setVal = (k, v) => { setInputs((p) => ({ ...p, [k]: v })); setResult(null); setError(""); };

  const compute = () => {
    const get = (k) => parseFloat(inputs[k]);
    let pitch;
    if (mode === "pitch") {
      const rise = get("rise"), run = get("run") || 12;
      if (isNaN(rise) || rise < 0) return setError("Enter a valid rise.");
      pitch = rise / (run / 12);
    } else if (mode === "rise") {
      const span = get("span"), rise = get("totalRise");
      if (isNaN(span) || isNaN(rise) || span <= 0) return setError("Enter a valid span and rise.");
      pitch = rise / (span / 2) * 12;
    } else {
      const deg = get("degrees");
      if (isNaN(deg) || deg < 0 || deg >= 90) return setError("Enter a valid angle (0–89°).");
      pitch = Math.tan(deg * Math.PI / 180) * 12;
    }

    const angle = Math.atan(pitch / 12) * (180 / Math.PI);
    const factor = Math.sqrt(1 + Math.pow(pitch / 12, 2));
    const cat = getPitchCategory(pitch);
    setResult({ pitch: parseFloat(pitch.toFixed(2)), angle, factor, cat });
    setError("");
    setMaterialIdx(null);
  };

  const modeFields = {
    pitch: [
      { id: "rise", label: "Rise", unit: "in", placeholder: "e.g. 6" },
      { id: "run", label: "Run", unit: "in", placeholder: "12 (default)", default: 12 },
    ],
    rise: [
      { id: "span", label: "Total Building Span", unit: "ft", placeholder: "e.g. 28" },
      { id: "totalRise", label: "Total Rise", unit: "ft", placeholder: "e.g. 7" },
    ],
    angle: [
      { id: "degrees", label: "Roof Angle", unit: "°", placeholder: "e.g. 26.6" },
    ],
  };

  const MODES = [
    { id: "pitch", label: "Rise & Run" },
    { id: "rise", label: "Span & Rise" },
    { id: "angle", label: "From Angle" },
  ];

  return (
    <div style={{ maxWidth: "620px" }}>
      <div style={{ fontSize: "12px", color: C.textDim, marginBottom: "8px" }}>Roofing / Roof Pitch</div>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Roof Pitch Calculator</h1>
      <p style={{ fontSize: "14px", color: C.textMid, marginBottom: "24px", lineHeight: "1.5" }}>
        Calculate pitch from rise/run, actual measurements, or angle. Results link directly to Roofing Squares.
      </p>

      {/* Mode Selector */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "9px" }}>Calculate From</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {MODES.map((m) => {
            const sel = mode === m.id;
            return (
              <button key={m.id} onClick={() => { setMode(m.id); setInputs({}); setResult(null); setError(""); }} style={{
                padding: "9px 18px",
                border: "1.5px solid " + (sel ? C.accent : C.border),
                borderRadius: "8px",
                background: sel ? C.accentSoft : C.surfaceAlt,
                color: sel ? C.accent : C.textMid,
                fontSize: "13px", fontFamily: font, fontWeight: sel ? "600" : "400",
                cursor: "pointer", transition: "all 0.12s",
              }}>{m.label}</button>
            );
          })}
        </div>
      </div>

      {/* Input Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        {modeFields[mode].map((f) => (
          <div key={f.id}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: C.textDim, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: "7px" }}>
              {f.label} <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>({f.unit})</span>
            </label>
            <input
              type="number" step="any" min="0"
              placeholder={f.placeholder}
              value={inputs[f.id] ?? ""}
              onChange={(e) => setVal(f.id, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compute()}
              style={{
                width: "100%", background: C.surfaceAlt, border: "1.5px solid " + C.border,
                borderRadius: "8px", color: C.text, fontSize: "17px", fontFamily: font,
                fontWeight: "500", padding: "10px 13px", outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px " + C.accentSoft; }}
              onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button onClick={compute} style={{
          background: C.accent, color: "#000", border: "none", borderRadius: "8px",
          padding: "12px 28px", fontSize: "14px", fontFamily: font, fontWeight: "700",
          cursor: "pointer", transition: "background 0.15s, transform 0.1s",
        }}
          onMouseEnter={(e) => e.target.style.background = C.accentDark}
          onMouseLeave={(e) => e.target.style.background = C.accent}
          onMouseDown={(e) => e.target.style.transform = "scale(0.97)"}
          onMouseUp={(e) => e.target.style.transform = "scale(1)"}
        >Calculate</button>
        <button onClick={() => { setInputs({}); setResult(null); setError(""); setMaterialIdx(null); }} style={{
          background: "transparent", border: "1.5px solid " + C.border, borderRadius: "8px",
          color: C.textMid, padding: "12px 20px", fontSize: "14px", fontFamily: font, cursor: "pointer",
        }}
          onMouseEnter={(e) => { e.target.style.borderColor = C.borderLight; e.target.style.color = C.text; }}
          onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.textMid; }}
        >Clear</button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: C.redSoft, border: "1px solid " + C.red, borderRadius: "8px", color: C.red, padding: "11px 16px", fontSize: "14px", marginBottom: "20px" }}>
          ⚠ {error}
        </div>
      )}

      {result && (
        <div style={{ animation: "fadeUp 0.22s ease" }}>
          {/* Visualizer */}
          <PitchVisualizer pitch={result.pitch} />

          {/* Send to Roofing Squares CTA */}
          <div style={{
            background: C.accentSoft, border: "1px solid " + C.accent,
            borderRadius: "10px", padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "12px", flexWrap: "wrap", marginBottom: "20px",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: C.accent, marginBottom: "2px" }}>
                Pitch calculated: {result.pitch}/12
              </div>
              <div style={{ fontSize: "12px", color: C.textMid }}>
                Use this in the Roofing Squares calculator
              </div>
            </div>
            <button
              onClick={() => onSendToSquares(result.pitch)}
              style={{
                background: C.accent, color: "#000", border: "none", borderRadius: "8px",
                padding: "10px 20px", fontSize: "13px", fontFamily: font, fontWeight: "700",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.target.style.background = C.accentDark}
              onMouseLeave={(e) => e.target.style.background = C.accent}
            >
              → Use in Roofing Squares
            </button>
          </div>

          {/* Material Guide */}
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
              Compatible Roofing Materials
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PITCH_MATERIALS.map((cat, i) => {
                const inRange = result.pitch >= cat.range[0] && result.pitch < cat.range[1];
                const expanded = materialIdx === i;
                return (
                  <div key={i} style={{
                    border: "1.5px solid " + (inRange ? cat.color : C.border),
                    borderRadius: "10px",
                    background: inRange ? cat.colorSoft : C.surfaceAlt,
                    overflow: "hidden",
                    transition: "all 0.15s",
                  }}>
                    <button
                      onClick={() => setMaterialIdx(expanded ? null : i)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "12px 16px", background: "transparent", border: "none",
                        cursor: "pointer", fontFamily: font, gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {inRange && <span style={{ fontSize: "11px", background: cat.color, color: "#000", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>YOUR PITCH</span>}
                        <span style={{ fontSize: "14px", fontWeight: inRange ? "700" : "500", color: inRange ? cat.color : C.textMid }}>
                          {cat.label} ({cat.range[0]}/12 – {cat.range[1] === 21 ? "+" : cat.range[1] + "/12"})
                        </span>
                      </div>
                      <span style={{ color: C.textDim, fontSize: "12px", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
                    </button>

                    {expanded && (
                      <div style={{ padding: "0 16px 14px", borderTop: "1px solid " + (inRange ? cat.color + "44" : C.border) }}>
                        <div style={{ paddingTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {cat.materials.map((m, j) => (
                            <span key={j} style={{
                              background: inRange ? cat.color + "22" : C.surface,
                              border: "1px solid " + (inRange ? cat.color + "66" : C.border),
                              color: inRange ? cat.color : C.textMid,
                              borderRadius: "6px", padding: "4px 10px",
                              fontSize: "12px", fontWeight: "500",
                            }}>{m}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: "12px", color: C.textDim, lineHeight: "1.5" }}>{cat.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: "12px", color: C.textDim, marginTop: "14px" }}>
            ℹ Estimates only — always verify with a licensed professional.
          </div>
        <LeadGenCTA calcId="pitch" />
        <AffiliateSuggestions calcId="pitch" />
        </div>
      )}
    </div>
  );
}

// ─── MAIN CALC DATA ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "concrete", label: "Concrete", icon: "▪",
    calcs: [
      {
        id: "slab", label: "Slab Volume", desc: "Concrete needed for a flat slab",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 20" },
          { id: "width", label: "Width", unit: "ft", placeholder: "e.g. 12" },
          { id: "thickness", label: "Thickness", unit: "in", placeholder: "e.g. 4" },
        ],
        formula: (v) => {
          const cuFt = v.length * v.width * (v.thickness / 12);
          const yards = cuFt / 27;
          return {
            main: yards.toFixed(2), mainUnit: "yd³", mainLabel: "Cubic Yards",
            extras: [
              { label: "With 10% Waste", value: (yards * 1.1).toFixed(2) + " yd³" },
              { label: "Cubic Feet", value: cuFt.toFixed(1) + " ft³" },
              { label: "Cubic Meters", value: (cuFt * 0.0283168).toFixed(3) + " m³" },
              { label: "Est. 80 lb Bags", value: Math.ceil(cuFt * 0.45) + " bags" },
            ],
          };
        },
      },
      {
        id: "footing", label: "Footing Volume", desc: "Strip or continuous footing",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 40" },
          { id: "width", label: "Width", unit: "in", placeholder: "e.g. 12" },
          { id: "depth", label: "Depth", unit: "in", placeholder: "e.g. 8" },
        ],
        formula: (v) => {
          const cuFt = v.length * (v.width / 12) * (v.depth / 12);
          const yards = cuFt / 27;
          return {
            main: yards.toFixed(2), mainUnit: "yd³", mainLabel: "Cubic Yards",
            extras: [
              { label: "Cubic Feet", value: cuFt.toFixed(2) + " ft³" },
              { label: "With 10% Waste", value: (yards * 1.1).toFixed(2) + " yd³" },
            ],
          };
        },
      },
    ],
  },
  {
    id: "framing", label: "Framing", icon: "⬜",
    calcs: [
      {
        id: "studs", label: "Wall Studs", desc: "Stud count for a framed wall",
        fields: [
          { id: "length", label: "Wall Length", unit: "ft", placeholder: "e.g. 24" },
          { id: "spacing", label: "Stud Spacing", unit: "in", placeholder: "16 or 24", default: 16 },
          { id: "height", label: "Wall Height", unit: "ft", placeholder: "e.g. 9", default: 8 },
        ],
        formula: (v) => {
          const count = Math.ceil((v.length / (v.spacing / 12)) + 1);
          const bf = count * v.height * (1.5 / 12) * (3.5 / 12) * 12;
          return {
            main: count, mainUnit: "studs", mainLabel: "Studs Required",
            extras: [
              { label: "With 10% Waste", value: Math.ceil(count * 1.1) + " studs" },
              { label: "Board Feet", value: bf.toFixed(1) + " BF" },
              { label: "Est. Plates", value: (v.length * 3).toFixed(1) + " LF" },
            ],
          };
        },
      },
      {
        id: "rafters", label: "Rafter Length", desc: "Rafter length from span & pitch",
        fields: [
          { id: "span", label: "Building Span", unit: "ft", placeholder: "e.g. 28" },
          { id: "pitch", label: "Roof Pitch", unit: "x/12", placeholder: "e.g. 6" },
          { id: "overhang", label: "Overhang", unit: "in", placeholder: "e.g. 12", default: 12 },
        ],
        formula: (v) => {
          const run = v.span / 2;
          const rise = (v.pitch / 12) * run;
          const rafter = Math.sqrt(run * run + rise * rise);
          const total = rafter + v.overhang / 12;
          const angle = Math.atan(v.pitch / 12) * (180 / Math.PI);
          return {
            main: total.toFixed(2), mainUnit: "ft", mainLabel: "Rafter Length",
            extras: [
              { label: "Without Overhang", value: rafter.toFixed(2) + " ft" },
              { label: "Ridge Height", value: rise.toFixed(2) + " ft" },
              { label: "Roof Angle", value: angle.toFixed(1) + "°" },
            ],
          };
        },
      },
    ],
  },
  {
    id: "area", label: "Area & Volume", icon: "◻",
    calcs: [
      {
        id: "room", label: "Room Area", desc: "Floor, wall, and ceiling areas",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 14" },
          { id: "width", label: "Width", unit: "ft", placeholder: "e.g. 12" },
          { id: "height", label: "Ceiling Height", unit: "ft", placeholder: "e.g. 9", default: 8 },
        ],
        formula: (v) => {
          const floor = v.length * v.width;
          const walls = 2 * (v.length + v.width) * v.height;
          return {
            main: floor.toFixed(0), mainUnit: "ft²", mainLabel: "Floor Area",
            extras: [
              { label: "Wall Area", value: walls.toFixed(0) + " ft²" },
              { label: "Volume", value: (floor * v.height).toFixed(0) + " ft³" },
              { label: "Paint (1 coat)", value: Math.ceil(walls / 350) + " gal" },
              { label: "Flooring + 10%", value: (floor * 1.1).toFixed(0) + " ft²" },
            ],
          };
        },
      },
      {
        id: "triangle", label: "Triangle Area", desc: "Gables, hip sections, odd shapes",
        fields: [
          { id: "base", label: "Base", unit: "ft", placeholder: "e.g. 20" },
          { id: "height", label: "Height", unit: "ft", placeholder: "e.g. 8" },
        ],
        formula: (v) => {
          const area = 0.5 * v.base * v.height;
          const hyp = Math.sqrt(v.base * v.base + v.height * v.height);
          return {
            main: area.toFixed(2), mainUnit: "ft²", mainLabel: "Triangle Area",
            extras: [
              { label: "Hypotenuse", value: hyp.toFixed(2) + " ft" },
              { label: "Perimeter", value: (v.base + v.height + hyp).toFixed(2) + " ft" },
            ],
          };
        },
      },
    ],
  },
  {
    id: "materials", label: "Materials", icon: "▦",
    calcs: [
      {
        id: "brick", label: "Brick Calculator", desc: "Bricks needed for a masonry wall",
        fields: [
          { id: "length", label: "Wall Length", unit: "ft", placeholder: "e.g. 30" },
          { id: "height", label: "Wall Height", unit: "ft", placeholder: "e.g. 8" },
          { id: "brickW", label: "Brick Width", unit: "in", placeholder: "3.625", default: 3.625 },
          { id: "brickH", label: "Brick Height", unit: "in", placeholder: "2.25", default: 2.25 },
          { id: "joint", label: "Mortar Joint", unit: "in", placeholder: "0.375", default: 0.375 },
        ],
        formula: (v) => {
          const perSqFt = 144 / ((v.brickW + v.joint) * (v.brickH + v.joint));
          const count = Math.ceil(v.length * v.height * perSqFt);
          return {
            main: count, mainUnit: "bricks", mainLabel: "Bricks Required",
            extras: [
              { label: "Wall Area", value: (v.length * v.height).toFixed(1) + " ft²" },
              { label: "Per Sq Ft", value: perSqFt.toFixed(2) },
              { label: "With 10% Waste", value: Math.ceil(count * 1.1) + " bricks" },
            ],
          };
        },
      },
      {
        id: "drywall", label: "Drywall Sheets", desc: "4×8 or 4×12 sheets needed",
        fields: [
          { id: "area", label: "Total Wall Area", unit: "ft²", placeholder: "e.g. 480" },
          { id: "sheetH", label: "Sheet Length", unit: "ft", placeholder: "8 or 12", default: 8 },
        ],
        formula: (v) => {
          const sheetArea = 4 * v.sheetH;
          const sheets = Math.ceil(v.area / sheetArea);
          return {
            main: sheets, mainUnit: "sheets", mainLabel: "Sheets Required",
            extras: [
              { label: "Sheet Size", value: "4 × " + v.sheetH + " ft" },
              { label: "With 12% Waste", value: Math.ceil(v.area * 1.12 / sheetArea) + " sheets" },
              { label: "Total Coverage", value: (sheets * sheetArea).toFixed(0) + " ft²" },
            ],
          };
        },
      },
    ],
  },
  {
    id: "electrical", label: "Electrical", icon: "⚡",
    calcs: [
      {
        id: "wire", label: "Wire & Ampacity", desc: "Load, amperage, wire gauge & voltage drop",
        fields: [
          { id: "load", label: "Load", unit: "watts", placeholder: "e.g. 1800" },
          { id: "voltage", label: "Voltage", unit: "V", placeholder: "120 or 240", default: 120 },
          { id: "distance", label: "Run Distance (one-way)", unit: "ft", placeholder: "e.g. 50" },
          { id: "pf", label: "Power Factor", unit: "0–1", placeholder: "1.0", default: 1 },
        ],
        formula: (v) => {
          const amps = v.load / (v.voltage * v.pf);
          const gauge = amps <= 15 ? "14 AWG" : amps <= 20 ? "12 AWG" : amps <= 30 ? "10 AWG" : amps <= 50 ? "8 AWG" : "6 AWG";
          const breaker = amps <= 15 ? "15 A" : amps <= 20 ? "20 A" : amps <= 30 ? "30 A" : amps <= 50 ? "50 A" : "60 A";
          const vDrop = 2 * v.distance * amps * 0.00328;
          const vDropPct = vDrop / v.voltage * 100;
          const pass = vDropPct <= 3;
          return {
            main: amps.toFixed(2), mainUnit: "A", mainLabel: "Draw (Amperage)",
            extras: [
              { label: "Wire Gauge", value: gauge },
              { label: "Breaker Size", value: breaker },
              { label: "Voltage Drop", value: vDrop.toFixed(2) + " V (" + vDropPct.toFixed(1) + "%)" },
              { label: "NEC 3% Limit", value: pass ? "✓ Pass" : "✗ Exceeds 3%", status: pass ? "green" : "red" },
            ],
          };
        },
      },
    ],
  },
  {
    id: "insulation", label: "Insulation", icon: "▣",
    calcs: [
      {
        id: "sprayfoam", label: "Spray Foam", desc: "Open-cell or closed-cell spray foam coverage",
        fields: [
          { id: "area", label: "Area to Cover", unit: "ft²", placeholder: "e.g. 800" },
          { id: "thickness", label: "Desired Thickness", unit: "in", placeholder: "e.g. 3" },
        ],
        toggles: [
          { id: "foamType", label: "Foam Type", options: ["Open-Cell (0.5 lb)", "Closed-Cell (2 lb)"] },
        ],
        formula: (v, togs) => {
          const isCC = (togs?.foamType ?? 0) === 1;
          const bf = v.area * v.thickness;
          const rPerInch = isCC ? 6.5 : 3.7;
          return {
            main: bf.toFixed(0), mainUnit: "BF", mainLabel: "Board Feet",
            extras: [
              { label: "R-Value Achieved", value: "R-" + (rPerInch * v.thickness).toFixed(1) + " (" + rPerInch + "/in)" },
              { label: "600 BF Kits", value: Math.ceil(bf / 600) + " kit(s)" },
              { label: "200 BF Kits", value: Math.ceil(bf / 200) + " kit(s)" },
              { label: "Est. Installed Cost", value: "$" + (bf * (isCC ? 1.00 : 0.44)).toFixed(0) + " – $" + (bf * (isCC ? 1.50 : 0.65)).toFixed(0) },
              { label: "Vapor Barrier", value: isCC ? "Not Required" : "Required" },
            ],
          };
        },
      },
      {
        id: "cellulose", label: "Cellulose", desc: "Blown-in cellulose for attics or wall cavities",
        fields: [
          { id: "area", label: "Area to Cover", unit: "ft²", placeholder: "e.g. 1200" },
          { id: "rvalue", label: "Target R-Value", unit: "R-", placeholder: "e.g. 38", default: 38 },
        ],
        toggles: [
          { id: "cellType", label: "Install Method", options: ["Loose-Blow (Attic)", "Dense-Pack (Walls)"] },
        ],
        formula: (v, togs) => {
          const isDense = (togs?.cellType ?? 0) === 1;
          const rPerInch = isDense ? 3.6 : 3.5;
          const depthFt = (v.rvalue / rPerInch) / 12;
          const lbs = v.area * depthFt * (isDense ? 3.5 : 1.5);
          const bags = Math.ceil(lbs / 30);
          return {
            main: bags, mainUnit: "bags", mainLabel: "30 lb Bags Required",
            extras: [
              { label: "Depth Required", value: (depthFt * 12).toFixed(1) + " in" },
              { label: "R-Value / Inch", value: "R-" + rPerInch },
              { label: "Total Weight", value: lbs.toFixed(0) + " lbs" },
              { label: "Est. Material Cost", value: "$" + (lbs * 0.35).toFixed(0) + " – $" + (lbs * 0.55).toFixed(0) },
            ],
          };
        },
      },
    ],
  },
  {
    id: "roofing", label: "Roofing", icon: "△",
    calcs: [
      {
        id: "pitch", label: "Roof Pitch", desc: "Pitch calculator with material guide", isSpecial: true,
      },
      {
        id: "squares", label: "Roofing Squares", desc: "Shingles needed for a pitched roof",
        fields: [
          { id: "length", label: "Building Length", unit: "ft", placeholder: "e.g. 40" },
          { id: "width", label: "Building Width", unit: "ft", placeholder: "e.g. 28" },
          { id: "pitch", label: "Roof Pitch", unit: "x/12", placeholder: "e.g. 6" },
          { id: "overhang", label: "Eave Overhang", unit: "in", placeholder: "e.g. 12", default: 12 },
        ],
        formula: (v) => {
          const factor = Math.sqrt(1 + Math.pow(v.pitch / 12, 2));
          const oh = v.overhang / 12;
          const area = (v.length + oh * 2) * (v.width + oh * 2) * factor;
          const squares = area / 100;
          return {
            main: squares.toFixed(2), mainUnit: "sq", mainLabel: "Roofing Squares",
            extras: [
              { label: "Roof Area", value: area.toFixed(0) + " ft²" },
              { label: "With 15% Waste", value: (squares * 1.15).toFixed(2) + " sq" },
              { label: "Bundles (3/sq)", value: Math.ceil(squares * 1.15 * 3) + " bundles" },
              { label: "Pitch Factor", value: factor.toFixed(4) },
            ],
          };
        },
      },
    ],
  },
];

const QUICK_REFS = [
  { label: "1 Cubic Yard", val: "27 ft³" },
  { label: "1 Roofing Square", val: "100 ft²" },
  { label: "1 Board Foot", val: "144 in³" },
  { label: "Concrete Weight", val: "~150 lb/ft³" },
  { label: "12 AWG Wire", val: "20 A max" },
  { label: "10 AWG Wire", val: "30 A max" },
  { label: "Brick (standard)", val: "~7 per ft²" },
  { label: "Drywall 4×8 Sheet", val: "32 ft²" },
];

const WASTE = [
  { label: "Concrete", val: "+10%" },
  { label: "Framing", val: "+15%" },
  { label: "Drywall", val: "+12%" },
  { label: "Tile / Flooring", val: "+10–15%" },
  { label: "Roofing", val: "+15%" },
  { label: "Spray Foam", val: "+5%" },
];

// ─── APP ───────────────────────────────────────────────────────────────────
export default function ConstructionCalculator() {
  const [activeCat, setActiveCat] = useState(() => localStorage.getItem("bcp_cat") || "concrete");
  const [activeCalc, setActiveCalc] = useState(() => localStorage.getItem("bcp_calc") || "slab");
  const [values, setValues] = useState({});
  const [toggles, setToggles] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showRef, setShowRef] = useState(false);

  const category = CATEGORIES.find((c) => c.id === activeCat);
  const calc = category?.calcs.find((c) => c.id === activeCalc);

  // SEO: update title, meta, and schema on every calc switch
  useSEO(category?.label, activeCalc);

  const switchCat = (id) => {
    const cat = CATEGORIES.find((c) => c.id === id);
    localStorage.setItem("bcp_cat", id);
    localStorage.setItem("bcp_calc", cat.calcs[0].id);
    setActiveCat(id);
    setActiveCalc(cat.calcs[0].id);
    setValues({}); setToggles({}); setResult(null); setError("");
  };

  const switchCalc = (id) => {
    localStorage.setItem("bcp_calc", id);
    setActiveCalc(id);
    setValues({}); setToggles({}); setResult(null); setError("");
  };

  // Called by RoofPitchCalc to pre-fill Roofing Squares
  const handleSendPitchToSquares = (pitch) => {
    setActiveCalc("squares");
    setValues({ pitch: String(pitch) });
    setToggles({}); setResult(null); setError("");
  };

  const handleInput = (id, val) => {
    setValues((p) => ({ ...p, [id]: val }));
    setResult(null); setError("");
  };

  const handleToggle = (id, idx) => {
    setToggles((p) => ({ ...p, [id]: idx }));
    setResult(null); setError("");
  };

  const calculate = useCallback(() => {
    if (!calc || calc.isSpecial) return;
    const parsed = {};
    for (const f of calc.fields) {
      const raw = values[f.id] !== undefined && values[f.id] !== "" ? values[f.id] : f.default;
      const n = parseFloat(raw);
      if (isNaN(n) || n < 0) { setError(`Enter a valid value for "${f.label}"`); return; }
      parsed[f.id] = n;
    }
    try {
      setResult(calc.formula(parsed, toggles));
      setError("");
    } catch { setError("Calculation error — check your inputs."); }
  }, [calc, values, toggles]);

  const reset = () => { setValues({}); setToggles({}); setResult(null); setError(""); };

  const inputStyle = {
    width: "100%", background: C.bg, border: "2px solid " + C.border,
    borderRadius: "8px", color: C.ink, fontSize: "18px", fontFamily: font,
    fontWeight: "600", padding: "10px 13px", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, fontSize: "15px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d9d4c7; border-radius: 4px; }
        button:focus-visible { outline: 2px solid #e8820c; outline-offset: 2px; }
        .calc-input:focus { border-color: #e8820c !important; box-shadow: 0 0 0 3px rgba(232,130,12,0.12) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .cat-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "0 24px", height: "60px",
        background: C.navBg,
        borderBottom: "3px solid " + C.accent,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: C.accent, color: "#fff",
            width: "34px", height: "34px", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "800", lineHeight: 1,
          }}>⚒</div>
          <div>
            <div style={{ fontFamily: fontDisplay, fontWeight: "700", fontSize: "20px", color: "#fff", letterSpacing: "0.5px", lineHeight: 1 }}>BUILD CALC PRO</div>
            <div style={{ fontSize: "10px", color: C.navText, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "1px" }}>Construction Estimating</div>
          </div>
        </div>

        <button onClick={() => setShowRef(!showRef)} style={{
          marginLeft: "auto",
          background: showRef ? C.accent : "transparent",
          border: "1.5px solid " + (showRef ? C.accent : "rgba(255,255,255,0.2)"),
          color: showRef ? "#fff" : C.navText,
          padding: "7px 16px", borderRadius: "6px",
          cursor: "pointer", fontSize: "12px", fontFamily: font, fontWeight: "600",
          letterSpacing: "0.5px", transition: "all 0.15s", textTransform: "uppercase",
        }}>
          {showRef ? "✕ Close" : "📋 Quick Ref"}
        </button>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>

        {/* Sidebar — dark nav */}
        <nav style={{ width: "200px", flexShrink: 0, background: C.navBg, overflowY: "auto", paddingTop: "16px", borderRight: "none" }}>
          <div style={{ padding: "0 16px 10px", fontSize: "10px", color: "rgba(196,191,180,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600" }}>Categories</div>
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCat;
            return (
              <button key={cat.id} onClick={() => switchCat(cat.id)} className="cat-btn" style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", textAlign: "left", padding: "11px 16px",
                background: active ? "rgba(232,130,12,0.15)" : "transparent",
                color: active ? C.accent : C.navText,
                border: "none", borderLeft: "3px solid " + (active ? C.accent : "transparent"),
                cursor: "pointer", fontSize: "13px", fontFamily: font,
                fontWeight: active ? "700" : "400", transition: "all 0.12s",
              }}>
                <span style={{ fontSize: "14px" }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}

          {category?.calcs.length > 1 && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ margin: "0 16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "10px", color: "rgba(196,191,180,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600", paddingBottom: "8px" }}>
                Tools
              </div>
              {category.calcs.map((c) => {
                const active = c.id === activeCalc;
                return (
                  <button key={c.id} onClick={() => switchCalc(c.id)} className="nav-btn" style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    width: "100%", textAlign: "left", padding: "9px 16px 9px 34px",
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "#fff" : "rgba(196,191,180,0.65)",
                    border: "none", borderLeft: "3px solid " + (active ? "rgba(255,255,255,0.3)" : "transparent"),
                    cursor: "pointer", fontSize: "12.5px", fontFamily: font,
                    fontWeight: active ? "600" : "400", transition: "all 0.1s",
                  }}>
                    {c.id === "pitch" && <span style={{ fontSize: "9px", background: C.accent, color: "#fff", padding: "1px 5px", borderRadius: "3px", fontWeight: "700", flexShrink: 0, letterSpacing: "0.5px" }}>NEW</span>}
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", background: C.bg, padding: "32px 36px" }}>

          {/* Special: Roof Pitch Calc */}
          {calc?.isSpecial && calc.id === "pitch" && (
            <RoofPitchCalc onSendToSquares={(pitch) => handleSendPitchToSquares(pitch)} />
          )}

          {/* Standard calcs */}
          {calc && !calc.isSpecial && (
            <div style={{ maxWidth: "620px" }}>

              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", color: C.inkDim, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{category.label}</span>
                <span style={{ fontSize: "11px", color: C.inkDim }}>›</span>
                <span style={{ fontSize: "11px", color: C.accent, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{calc.label}</span>
              </div>

              {/* Title card */}
              <div style={{
                background: C.navBg, borderRadius: "12px",
                padding: "24px 28px", marginBottom: "20px",
                borderLeft: "5px solid " + C.accent,
              }}>
                <h1 style={{ fontFamily: fontDisplay, fontSize: "30px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px", marginBottom: "6px", lineHeight: 1.1 }}>{calc.label.toUpperCase()}</h1>
                <p style={{ fontSize: "13px", color: "rgba(196,191,180,0.8)", lineHeight: "1.5", margin: 0 }}>{calc.desc}</p>
              </div>

              {/* Pitch pre-fill notice */}
              {activeCalc === "squares" && values.pitch && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: C.accentSoft, border: "2px solid " + C.accent, borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", fontSize: "13px" }}>
                  <span>🔗</span>
                  <span style={{ color: C.accentDark, fontWeight: "600" }}>Pitch pre-filled from Roof Pitch Calculator ({values.pitch}/12)</span>
                  <button onClick={() => setValues((p) => ({ ...p, pitch: "" }))} style={{ marginLeft: "auto", background: "transparent", border: "none", color: C.inkDim, cursor: "pointer", fontSize: "13px", fontFamily: font }}>✕ Clear</button>
                </div>
              )}

              {/* Input card */}
              <div style={{
                background: C.surface, border: "2px solid " + C.border,
                borderRadius: "12px", padding: "28px", marginBottom: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                {/* Toggles */}
                {calc.toggles?.map((tog) => (
                  <div key={tog.id} style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", color: C.inkDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "10px" }}>{tog.label}</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {tog.options.map((opt, idx) => {
                        const sel = (toggles[tog.id] ?? 0) === idx;
                        return (
                          <button key={idx} onClick={() => handleToggle(tog.id, idx)} style={{
                            padding: "9px 20px",
                            border: "2px solid " + (sel ? C.accent : C.border),
                            borderRadius: "8px",
                            background: sel ? C.accent : C.bg,
                            color: sel ? "#fff" : C.inkMid,
                            fontSize: "13px", fontFamily: font,
                            fontWeight: "600", cursor: "pointer", transition: "all 0.12s",
                          }}>{opt}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Fields grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "18px", marginBottom: "24px" }}>
                  {calc.fields.map((f) => (
                    <div key={f.id}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: C.inkDim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "7px" }}>
                        {f.label} <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0, color: C.inkDim }}>({f.unit})</span>
                      </label>
                      <input
                        type="number" step="any" min="0" className="calc-input"
                        placeholder={f.placeholder ?? (f.default !== undefined ? String(f.default) : "")}
                        value={values[f.id] ?? ""}
                        onChange={(e) => handleInput(f.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && calculate()}
                        style={{
                          width: "100%", background: C.bg,
                          border: "2px solid " + C.border,
                          borderRadius: "8px", color: C.ink,
                          fontSize: "18px", fontFamily: font,
                          fontWeight: "600", padding: "10px 13px",
                          outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={calculate} style={{
                    background: C.accent, color: "#fff",
                    border: "none", borderRadius: "8px",
                    padding: "13px 32px", fontSize: "14px",
                    fontFamily: fontDisplay, fontWeight: "700",
                    letterSpacing: "1px", textTransform: "uppercase",
                    cursor: "pointer", transition: "background 0.15s, transform 0.1s",
                    flex: 1,
                  }}
                    onMouseEnter={(e) => e.target.style.background = C.accentDark}
                    onMouseLeave={(e) => e.target.style.background = C.accent}
                    onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                    onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                  >Calculate</button>
                  <button onClick={reset} style={{
                    background: "transparent",
                    border: "2px solid " + C.border,
                    borderRadius: "8px", color: C.inkMid,
                    padding: "13px 20px", fontSize: "13px",
                    fontFamily: font, fontWeight: "600",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={(e) => { e.target.style.borderColor = C.ink; e.target.style.color = C.ink; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.inkMid; }}
                  >Clear</button>
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: C.redSoft, border: "2px solid " + C.red, borderRadius: "8px", color: C.red, padding: "12px 16px", fontSize: "14px", marginBottom: "20px", fontWeight: "600" }}>⚠ {error}</div>
              )}

              {/* Results card */}
              {result && (
                <div style={{ animation: "popIn 0.2s ease" }}>
                  {/* Main result */}
                  <div style={{
                    background: C.navBg, borderRadius: "12px",
                    padding: "28px", marginBottom: "12px",
                    borderLeft: "5px solid " + C.accent,
                  }}>
                    <div style={{ fontSize: "10px", color: "rgba(196,191,180,0.6)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>{result.mainLabel}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                      <span style={{ fontFamily: fontDisplay, fontSize: "56px", fontWeight: "700", color: C.accent, letterSpacing: "-1px", lineHeight: "1" }}>{result.main}</span>
                      <span style={{ fontSize: "20px", color: "rgba(196,191,180,0.7)", fontWeight: "500" }}>{result.mainUnit}</span>
                    </div>
                  </div>

                  {/* Extra stats */}
                  {result.extras?.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                      {result.extras.map((ex, i) => {
                        const isG = ex.status === "green", isR = ex.status === "red";
                        return (
                          <div key={i} style={{
                            background: isG ? C.greenSoft : isR ? C.redSoft : C.surface,
                            border: "2px solid " + (isG ? C.green : isR ? C.red : C.border),
                            borderRadius: "10px", padding: "14px 16px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                          }}>
                            <div style={{ fontSize: "10px", color: isG ? C.green : isR ? C.red : C.inkDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>{ex.label}</div>
                            <div style={{ fontSize: "16px", fontWeight: "700", color: isG ? C.green : isR ? C.red : C.ink, lineHeight: "1.3" }}>{ex.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: C.inkDim, marginBottom: "4px" }}>ℹ Estimates only — always verify with a licensed professional.</div>
                  <LeadGenCTA calcId={activeCalc} />
                  <AffiliateSuggestions calcId={activeCalc} />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Quick Ref */}
        {showRef && (
          <aside style={{ width: "220px", flexShrink: 0, background: C.surface, borderLeft: "2px solid " + C.border, padding: "22px 18px", overflowY: "auto", animation: "fadeUp 0.2s ease" }}>
            <div style={{ fontFamily: fontDisplay, fontSize: "14px", fontWeight: "700", color: C.ink, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>Quick Ref</div>
            {QUICK_REFS.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border, gap: "8px" }}>
                <span style={{ fontSize: "12px", color: C.inkDim, lineHeight: "1.3" }}>{r.label}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: C.ink, whiteSpace: "nowrap" }}>{r.val}</span>
              </div>
            ))}
            <div style={{ fontFamily: fontDisplay, fontSize: "14px", fontWeight: "700", color: C.ink, textTransform: "uppercase", letterSpacing: "1.5px", margin: "22px 0 12px" }}>Waste Factors</div>
            {WASTE.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border }}>
                <span style={{ fontSize: "12px", color: C.inkDim }}>{r.label}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: C.accent }}>{r.val}</span>
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

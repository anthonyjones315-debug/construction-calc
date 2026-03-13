import { useState, useCallback, useEffect, useRef } from "react";
import { useSEO } from "./seo/useSEO.js";
import { AffiliateSuggestions, LeadGenCTA } from "./monetization.jsx";
import { C, font, fontDisplay, shadow } from "./theme.js";
import { CATEGORIES, QUICK_REFS, WASTE_FACTORS } from "./calcData.js";

// ─── PITCH MATERIAL GUIDE DATA ─────────────────────────────────────────────
const PITCH_MATERIALS = [
  {
    label: "Flat / Low Slope",
    range: [0, 2],
    color: C.blue,
    colorSoft: C.blueSoft,
    materials: [
      "TPO Membrane",
      "EPDM Rubber",
      "Modified Bitumen",
      "Built-Up Roofing (BUR)",
    ],
    notes: "Requires special low-slope rated material. Drainage is critical.",
  },
  {
    label: "Conventional Slope",
    range: [2, 4],
    color: C.green,
    colorSoft: C.greenSoft,
    materials: [
      "Asphalt Shingles (low-slope rated)",
      "Metal Panels",
      "Rolled Roofing",
    ],
    notes: "Most shingles require a minimum of 2/12 with underlayment.",
  },
  {
    label: "Standard Slope",
    range: [4, 9],
    color: C.accent,
    colorSoft: C.accentSoft,
    materials: [
      "Asphalt Shingles",
      "Metal Shingles",
      "Wood Shakes",
      "Slate",
      "Concrete Tile",
      "Clay Tile",
    ],
    notes: "The most common residential range. All standard materials apply.",
  },
  {
    label: "Steep Slope",
    range: [9, 21],
    color: C.purple,
    colorSoft: C.purpleSoft,
    materials: [
      "Wood Shakes",
      "Slate",
      "Clay Tile",
      "Metal Shingles",
      "Specialty Shingles",
    ],
    notes:
      "Steep pitches shed water fast but require special fastening. Watch fall protection.",
  },
];

function getPitchCategory(pitch) {
  return (
    PITCH_MATERIALS.find((p) => pitch >= p.range[0] && pitch < p.range[1]) ??
    PITCH_MATERIALS[3]
  );
}

// ─── PITCH VISUALIZER ──────────────────────────────────────────────────────
function PitchVisualizer({ pitch }) {
  const p = Math.min(Math.max(pitch, 0), 20);
  const angle = Math.atan(p / 12) * (180 / Math.PI);
  const factor = Math.sqrt(1 + Math.pow(p / 12, 2));
  const cat = getPitchCategory(p);
  const W = 240,
    H = 130,
    margin = 20;
  const cx = W / 2;
  const riseH = Math.min((p / 12) * ((W - margin * 2) / 2), H - 16);
  const peakY = H - riseH;
  const leftX = margin,
    rightX = W - margin;

  return (
    <div
      style={{
        background: C.surfaceAlt,
        border: "1.5px solid " + cat.color,
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flexShrink: 0, maxWidth: "100%" }}>
          <svg
            viewBox={"0 0 " + W + " " + (H + 20)}
            width={W}
            height={H + 20}
            style={{ display: "block", width: "100%", maxWidth: W + "px" }}
            aria-label={
              "Roof pitch diagram: " +
              p +
              "/12 pitch, " +
              angle.toFixed(1) +
              " degree angle"
            }
          >
            <polygon
              points={
                leftX +
                "," +
                H +
                " " +
                cx +
                "," +
                peakY +
                " " +
                rightX +
                "," +
                H
              }
              fill={cat.colorSoft}
              stroke={cat.color}
              strokeWidth="2"
            />
            <line
              x1={rightX + 6}
              y1={H}
              x2={rightX + 6}
              y2={peakY}
              stroke={C.inkDim}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={rightX + 12}
              y={(H + peakY) / 2 + 4}
              fill={C.inkMid}
              fontSize="10"
              fontFamily={font}
            >
              {p}
            </text>
            <line
              x1={cx}
              y1={H + 6}
              x2={rightX}
              y2={H + 6}
              stroke={C.inkDim}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={(cx + rightX) / 2 - 4}
              y={H + 17}
              fill={C.inkMid}
              fontSize="10"
              fontFamily={font}
            >
              12
            </text>
            <text
              x={cx}
              y={peakY - 8}
              fill={cat.color}
              fontSize="12"
              fontFamily={font}
              fontWeight="700"
              textAnchor="middle"
            >
              {p}/12
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <div
            style={{
              display: "inline-block",
              background: cat.colorSoft,
              color: cat.color,
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "5px",
              marginBottom: "12px",
            }}
          >
            {cat.label}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              { label: "Pitch", value: p + "/12" },
              { label: "Angle", value: angle.toFixed(1) + "°" },
              { label: "Multiplier", value: factor.toFixed(4) },
              { label: "Rise per Ft", value: p + '"' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  borderRadius: "8px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: C.inkDim,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    marginBottom: "3px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{ fontSize: "15px", fontWeight: "700", color: C.ink }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED STYLES ──────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: C.bg,
  border: "2px solid " + C.border,
  borderRadius: "8px",
  color: C.ink,
  fontSize: "18px",
  fontFamily: font,
  fontWeight: "600",
  padding: "11px 13px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const calcBtnStyle = {
  background: C.accent,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "14px 0",
  fontSize: "14px",
  fontFamily: fontDisplay,
  fontWeight: "700",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  cursor: "pointer",
  flex: 1,
  transition: "background 0.15s, transform 0.1s",
};

const clearBtnStyle = {
  background: "transparent",
  border: "2px solid " + C.border,
  borderRadius: "8px",
  color: C.inkMid,
  padding: "14px 22px",
  fontSize: "13px",
  fontFamily: font,
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s",
};

// ─── ROOF PITCH SPECIAL CALC ────────────────────────────────────────────────
function RoofPitchCalc({ onSendToSquares, category, liveAnnouncerRef }) {
  const [mode, setMode] = useState("pitch");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [materialIdx, setMatIdx] = useState(null);

  const setVal = (k, v) => {
    setInputs((p) => ({ ...p, [k]: v }));
    setResult(null);
    setError("");
  };

  const compute = () => {
    const get = (k) => parseFloat(inputs[k]);
    let pitch;
    if (mode === "pitch") {
      const rise = get("rise"),
        run = get("run") || 12;
      if (isNaN(rise) || rise < 0) {
        setError("Enter a valid rise.");
        return;
      }
      pitch = rise / (run / 12);
    } else if (mode === "rise") {
      const span = get("span"),
        rise = get("totalRise");
      if (isNaN(span) || isNaN(rise) || span <= 0) {
        setError("Enter a valid span and rise.");
        return;
      }
      pitch = (rise / (span / 2)) * 12;
    } else {
      const deg = get("degrees");
      if (isNaN(deg) || deg < 0 || deg >= 90) {
        setError("Enter a valid angle (0-89).");
        return;
      }
      pitch = Math.tan((deg * Math.PI) / 180) * 12;
    }
    const angle = Math.atan(pitch / 12) * (180 / Math.PI);
    const factor = Math.sqrt(1 + Math.pow(pitch / 12, 2));
    const cat = getPitchCategory(pitch);
    setResult({ pitch: parseFloat(pitch.toFixed(2)), angle, factor, cat });
    setError("");
    setMatIdx(null);
    if (liveAnnouncerRef && liveAnnouncerRef.current) {
      liveAnnouncerRef.current.textContent =
        "Result: " +
        pitch.toFixed(2) +
        " slash 12 pitch, " +
        angle.toFixed(1) +
        " degrees, " +
        cat.label;
    }
  };

  const modeFields = {
    pitch: [
      { id: "rise", label: "Rise", unit: "in", placeholder: "e.g. 6" },
      {
        id: "run",
        label: "Run",
        unit: "in",
        placeholder: "12 (default)",
        default: 12,
      },
    ],
    rise: [
      {
        id: "span",
        label: "Total Building Span",
        unit: "ft",
        placeholder: "e.g. 28",
      },
      {
        id: "totalRise",
        label: "Total Rise",
        unit: "ft",
        placeholder: "e.g. 7",
      },
    ],
    angle: [
      {
        id: "degrees",
        label: "Roof Angle",
        unit: "deg",
        placeholder: "e.g. 26.6",
      },
    ],
  };

  const MODES = [
    { id: "pitch", label: "Rise & Run" },
    { id: "rise", label: "Span & Rise" },
    { id: "angle", label: "From Angle" },
  ];

  return (
    <div style={{ maxWidth: "640px" }}>
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: C.inkDim,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {category ? category.label : "Roofing"}
        </span>
        <span style={{ fontSize: "11px", color: C.inkDim }}>›</span>
        <span
          style={{
            fontSize: "11px",
            color: C.accentDark,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
          aria-current="page"
        >
          Roof Pitch
        </span>
      </nav>

      <div
        style={{
          background: C.navBg,
          borderRadius: "14px",
          padding: "24px 28px",
          marginBottom: "24px",
          borderLeft: "5px solid " + C.accent,
        }}
      >
        <h1
          style={{
            fontFamily: fontDisplay,
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            lineHeight: 1.1,
          }}
        >
          ROOF PITCH
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(196,191,180,0.85)",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          Calculate pitch from rise/run, actual measurements, or angle. Includes
          material compatibility guide and links directly to Roofing Squares.
        </p>
      </div>

      <p
        style={{
          fontSize: "14px",
          color: C.inkMid,
          lineHeight: "1.65",
          marginBottom: "24px",
          padding: "0 2px",
        }}
      >
        Whether you're bidding a re-roof, ordering materials, or checking code
        compliance — knowing your exact pitch matters. Enter your rise and run,
        total span measurements, or angle and get pitch ratio, degree angle,
        multiplier factor, and a full compatibility guide for shingles, metal,
        tile, and membrane systems.
      </p>

      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "11px",
            color: C.inkDim,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "9px",
          }}
        >
          Calculate From
        </div>
        <div
          role="group"
          aria-label="Calculation mode"
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          {MODES.map((m) => {
            const sel = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setInputs({});
                  setResult(null);
                  setError("");
                }}
                aria-pressed={sel}
                style={{
                  padding: "10px 18px",
                  border: "2px solid " + (sel ? C.accent : C.border),
                  borderRadius: "8px",
                  background: sel ? C.accentSoft : C.surfaceAlt,
                  color: sel ? C.accentDark : C.inkMid,
                  fontSize: "13px",
                  fontFamily: font,
                  fontWeight: sel ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: C.surface,
          border: "2px solid " + C.border,
          borderRadius: "12px",
          padding: "28px",
          marginBottom: "20px",
          boxShadow: shadow.sm,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {modeFields[mode].map((f) => (
            <div key={f.id}>
              <label
                htmlFor={"pitch-" + f.id}
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: C.inkDim,
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                  marginBottom: "7px",
                }}
              >
                {f.label}{" "}
                <span
                  style={{
                    fontWeight: "400",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  ({f.unit})
                </span>
              </label>
              <input
                id={"pitch-" + f.id}
                type="number"
                step="any"
                min="0"
                placeholder={f.placeholder}
                value={inputs[f.id] ?? ""}
                onChange={(e) => setVal(f.id, e.target.value)}
                onKeyDown={(e) => {
                  if (["e", "E", "-", "+"].includes(e.key)) e.preventDefault();
                  if (e.key === "Enter") compute();
                }}
                className="calc-input"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={compute}
            style={calcBtnStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = C.accentDeep)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = C.accent)}
          >
            CALCULATE
          </button>
          <button
            onClick={() => {
              setInputs({});
              setResult(null);
              setError("");
              setMatIdx(null);
            }}
            style={clearBtnStyle}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: C.redSoft,
            border: "2px solid " + C.red,
            borderRadius: "8px",
            color: C.red,
            padding: "12px 16px",
            fontSize: "14px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {result && (
        <div style={{ animation: "fadeUp 0.22s ease" }}>
          <PitchVisualizer pitch={result.pitch} />
          <div
            style={{
              background: C.accentSoft,
              border: "2px solid " + C.accent,
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: C.accentDark,
                  marginBottom: "2px",
                }}
              >
                Pitch calculated: {result.pitch}/12
              </div>
              <div style={{ fontSize: "12px", color: C.inkMid }}>
                Use this in the Roofing Squares calculator
              </div>
            </div>
            <button
              onClick={() => onSendToSquares(result.pitch)}
              style={{
                background: C.accent,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "13px",
                fontFamily: font,
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              → Use in Roofing Squares
            </button>
          </div>
          <div>
            <div
              style={{
                fontSize: "11px",
                color: C.inkDim,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Compatible Roofing Materials
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {PITCH_MATERIALS.map((cat, i) => {
                const inRange =
                  result.pitch >= cat.range[0] && result.pitch < cat.range[1];
                const expanded = materialIdx === i;
                return (
                  <div
                    key={i}
                    style={{
                      border: "2px solid " + (inRange ? cat.color : C.border),
                      borderRadius: "10px",
                      background: inRange ? cat.colorSoft : C.surfaceAlt,
                      overflow: "hidden",
                      transition: "all 0.15s",
                    }}
                  >
                    <button
                      onClick={() => setMatIdx(expanded ? null : i)}
                      aria-expanded={expanded}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: font,
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {inRange && (
                          <span
                            style={{
                              fontSize: "11px",
                              background: cat.color,
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: "700",
                            }}
                          >
                            YOUR PITCH
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: inRange ? "700" : "500",
                            color: inRange ? cat.color : C.inkMid,
                          }}
                        >
                          {cat.label} ({cat.range[0]}/12 –{" "}
                          {cat.range[1] === 21 ? "+" : cat.range[1] + "/12"})
                        </span>
                      </div>
                      <span
                        style={{ color: C.inkDim, fontSize: "12px" }}
                        aria-hidden="true"
                      >
                        {expanded ? "▲" : "▼"}
                      </span>
                    </button>
                    {expanded && (
                      <div
                        style={{
                          padding: "0 16px 14px",
                          borderTop:
                            "1px solid " +
                            (inRange ? cat.color + "44" : C.border),
                        }}
                      >
                        <div
                          style={{
                            paddingTop: "12px",
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                          }}
                        >
                          {cat.materials.map((m, j) => (
                            <span
                              key={j}
                              style={{
                                background: inRange
                                  ? cat.color + "22"
                                  : C.surface,
                                border:
                                  "1px solid " +
                                  (inRange ? cat.color + "66" : C.border),
                                color: inRange ? cat.color : C.inkMid,
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: C.inkDim,
                            lineHeight: "1.5",
                          }}
                        >
                          {cat.notes}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: "12px", color: C.inkDim, marginTop: "14px" }}>
            ℹ Estimates only — always verify with a licensed professional.
          </div>
          <LeadGenCTA calcId="pitch" />
          <AffiliateSuggestions calcId="pitch" />
        </div>
      )}
    </div>
  );
}

// ─── DROPDOWN NAV ───────────────────────────────────────────────────────────
function TopNav({
  activeCatId,
  activeCalcId,
  onSelectCalc,
  onSelectCat,
  onToggleRef,
  showRef,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showSiteMenu, setShowSiteMenu] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
        setShowSiteMenu(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setShowSiteMenu(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Calculator categories"
      style={{
        background: C.navBg,
        borderBottom: "3px solid " + C.accent,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      {/* Main header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "60px",
          padding: "0 20px",
          gap: "2px",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            marginRight: "10px",
            flexShrink: 0,
          }}
          aria-label="Build Calc Pro home"
        >
          <div
            style={{
              background: C.accent,
              color: "#fff",
              width: "34px",
              height: "34px",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "800",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ⚒
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: fontDisplay,
                fontWeight: "700",
                fontSize: "19px",
                color: "#fff",
                letterSpacing: "0.5px",
                lineHeight: 1,
              }}
            >
              BUILD CALC PRO
            </span>
            <span
              style={{
                fontSize: "9px",
                color: C.navText,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginTop: "1px",
              }}
            >
              Construction Estimating
            </span>
          </div>
        </a>

        {/* Site Menu */}
        <div style={{ position: "relative", marginLeft: "10px" }}>
          <button
            onClick={() => setShowSiteMenu(!showSiteMenu)}
            aria-expanded={showSiteMenu}
            aria-haspopup="true"
            style={{
              background: "transparent",
              border: "none",
              color: C.navText,
              cursor: "pointer",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "16px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            ☰
          </button>
          {showSiteMenu && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: 0,
                background: C.surface,
                border: "2px solid " + C.border,
                borderRadius: "8px",
                padding: "8px 0",
                boxShadow: shadow.xl,
                zIndex: 300,
                minWidth: "120px",
              }}
            >
              <a
                href="/about"
                style={{
                  display: "block",
                  padding: "8px 16px",
                  color: C.text,
                  textDecoration: "none",
                  fontFamily: font,
                  fontSize: "14px",
                }}
              >
                About
              </a>
              <a
                href="/blog"
                style={{
                  display: "block",
                  padding: "8px 16px",
                  color: C.text,
                  textDecoration: "none",
                  fontFamily: font,
                  fontSize: "14px",
                }}
              >
                Resources
              </a>
              <a
                href="/faq"
                style={{
                  display: "block",
                  padding: "8px 16px",
                  color: C.text,
                  textDecoration: "none",
                  fontFamily: font,
                  fontSize: "14px",
                }}
              >
                FAQ
              </a>
            </div>
          )}
        </div>

        {/* Category tab buttons */}
        <div
          className="nav-tabs"
          style={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            height: "100%",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCatId;
            const isOpen = openMenu === cat.id;
            return (
              <div
                key={cat.id}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                <button
                  onClick={() => setOpenMenu(isOpen ? null : cat.id)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    height: "100%",
                    padding: "0 11px",
                    background:
                      isActive || isOpen
                        ? "rgba(232,130,12,0.15)"
                        : "transparent",
                    border: "none",
                    borderBottom:
                      "3px solid " + (isActive ? C.accent : "transparent"),
                    color: isActive ? "#fff" : C.navText,
                    fontSize: "12px",
                    fontFamily: font,
                    fontWeight: isActive ? "700" : "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.12s",
                    marginBottom: "-3px",
                  }}
                >
                  <span>{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                  <span
                    style={{ fontSize: "9px", opacity: 0.6, marginLeft: "1px" }}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "63px",
                      left: 0,
                      background: C.surface,
                      border: "2px solid " + C.border,
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: shadow.xl,
                      zIndex: 300,
                      minWidth: "520px",
                      display: "grid",
                      gridTemplateColumns:
                        cat.calcs.length === 1 ? "1fr" : "repeat(2, 1fr)",
                      gap: "12px",
                      animation: "dropIn 0.15s ease",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        paddingBottom: "12px",
                        borderBottom: "1px solid " + C.border,
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: fontDisplay,
                          fontSize: "16px",
                          fontWeight: "800",
                          color: cat.accentColor,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        {cat.label}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: C.inkMid,
                          lineHeight: "1.5",
                        }}
                      >
                        {cat.blurb}
                      </div>
                    </div>

                    {/* Calc cards */}
                    {cat.calcs.map((calc) => {
                      const isCalcActive = calc.id === activeCalcId && isActive;
                      return (
                        <button
                          key={calc.id}
                          onClick={() => {
                            onSelectCalc(cat.id, calc.id);
                            setOpenMenu(null);
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left",
                            cursor: "pointer",
                            background: isCalcActive
                              ? C.accentSoft
                              : C.surfaceAlt,
                            border:
                              "2px solid " +
                              (isCalcActive ? C.accent : C.border),
                            borderRadius: "10px",
                            padding: "0",
                            fontFamily: font,
                            overflow: "hidden",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isCalcActive) {
                              e.currentTarget.style.borderColor =
                                cat.accentColor;
                              e.currentTarget.style.background = C.surface;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCalcActive) {
                              e.currentTarget.style.borderColor = C.border;
                              e.currentTarget.style.background = C.surfaceAlt;
                            }
                          }}
                        >
                          {/* Emoji photo area */}
                          <div
                            style={{
                              height: "80px",
                              background: C.navBg,
                              overflow: "hidden",
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(135deg, " +
                                  cat.accentColor +
                                  "25 0%, " +
                                  cat.accentColor +
                                  "08 100%)",
                              }}
                            />
                            <img
                              src={calc.photo}
                              alt={calc.label}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                zIndex: 1,
                                filter:
                                  "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                              }}
                            />
                            {isCalcActive && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  background: C.accent,
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                ACTIVE
                              </div>
                            )}
                          </div>
                          {/* Text */}
                          <div style={{ padding: "12px 14px" }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: isCalcActive ? C.accentDark : C.ink,
                                marginBottom: "5px",
                                fontFamily: fontDisplay,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              {calc.label}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: C.inkMid,
                                lineHeight: "1.5",
                              }}
                            >
                              {calc.blurb}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Ref */}
        <button
          onClick={onToggleRef}
          aria-pressed={showRef}
          style={{
            flexShrink: 0,
            marginLeft: "8px",
            background: showRef ? C.accent : "transparent",
            border:
              "1.5px solid " + (showRef ? C.accent : "rgba(255,255,255,0.2)"),
            color: showRef ? "#fff" : C.navText,
            padding: "7px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: font,
            fontWeight: "600",
            letterSpacing: "0.5px",
            transition: "all 0.15s",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {showRef ? "✕ Ref" : "📋 Quick Ref"}
        </button>
      </div>

      {/* Mobile pill scroll nav */}
      <div
        className="mobile-pill-nav"
        style={{
          display: "none",
          overflowX: "auto",
          padding: "8px 16px",
          gap: "8px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCat(cat.id)}
            aria-label={cat.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              background:
                cat.id === activeCatId ? C.accent : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "20px",
              color: cat.id === activeCatId ? "#fff" : C.navText,
              fontSize: "12px",
              fontFamily: font,
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── MOBILE BOTTOM NAV ──────────────────────────────────────────────────────
function MobileBottomNav({ activeCatId, onSelectCat }) {
  return (
    <nav
      aria-label="Mobile category navigation"
      className="mobile-bottom-nav"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.navBg,
        borderTop: "2px solid " + C.accent,
        padding: "4px 0",
        zIndex: 150,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {CATEGORIES.map((cat) => {
        const active = cat.id === activeCatId;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCat(cat.id)}
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "6px 4px",
              background: "none",
              border: "none",
              color: active ? C.accent : "rgba(196,191,180,0.5)",
              fontSize: "8px",
              fontFamily: font,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "color 0.12s",
              minWidth: "44px",
              minHeight: "44px",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>{cat.icon}</span>
            <span>{cat.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function ConstructionCalculator() {
  const [activeCatId, setActiveCatId] = useState(() => {
    const stored = localStorage.getItem("bcp_cat");
    return CATEGORIES.some((c) => c.id === stored) ? stored : "concrete";
  });
  const [activeCalcId, setActiveCalcId] = useState(() => {
    const stored = localStorage.getItem("bcp_calc");
    const cat = CATEGORIES.find((c) => c.id === activeCatId);
    return cat && cat.calcs.some((c) => c.id === stored)
      ? stored
      : cat
        ? cat.calcs[0].id
        : "slab";
  });
  const [values, setValues] = useState({});
  const [toggles, setToggles] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showRef, setShowRef] = useState(false);
  const h1Ref = useRef(null);
  const liveAnnouncerRef = useRef(null);

  const category = CATEGORIES.find((c) => c.id === activeCatId);
  const calc = category?.calcs.find((c) => c.id === activeCalcId);

  useSEO(category?.label, activeCalcId);

  const selectCalc = (catId, calcId) => {
    localStorage.setItem("bcp_cat", catId);
    localStorage.setItem("bcp_calc", calcId);
    setActiveCatId(catId);
    setActiveCalcId(calcId);
    setValues({});
    setToggles({});
    setResult(null);
    setError("");
    setTimeout(() => {
      if (h1Ref.current) {
        h1Ref.current.focus();
      }
    }, 60);
  };

  const selectCat = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    selectCalc(catId, cat.calcs[0].id);
  };

  const handleSendPitchToSquares = (pitch) => {
    selectCalc("roofing", "squares");
    setTimeout(() => setValues({ pitch: String(pitch) }), 20);
  };

  const handleInput = (id, val) => {
    setValues((p) => ({ ...p, [id]: val }));
    setResult(null);
    setError("");
  };
  const handleToggle = (id, idx) => {
    setToggles((p) => ({ ...p, [id]: idx }));
    setResult(null);
    setError("");
  };

  const calculate = useCallback(() => {
    if (!calc || calc.isSpecial) return;
    const parsed = {};
    for (const f of calc.fields) {
      const raw =
        values[f.id] !== undefined && values[f.id] !== ""
          ? values[f.id]
          : f.default;
      const n = parseFloat(raw);
      if (isNaN(n) || n < 0) {
        setError('Enter a valid value for "' + f.label + '"');
        return;
      }
      parsed[f.id] = n;
    }
    try {
      const r = calc.formula(parsed, toggles);
      setResult(r);
      setError("");
      if (liveAnnouncerRef.current) {
        liveAnnouncerRef.current.textContent =
          "Result: " + r.main + " " + r.mainUnit + " — " + r.mainLabel;
      }
    } catch {
      setError("Calculation error — check your inputs.");
    }
  }, [calc, values, toggles]);

  const reset = () => {
    setValues({});
    setToggles({});
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: font,
        color: C.ink,
        fontSize: "15px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn  { from { opacity:0; transform:scale(0.97); }     to { opacity:1; transform:scale(1); } }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #9a9389; border-radius: 4px; }
        button:focus-visible { outline: 3px solid #e8820c; outline-offset: 2px; }
        a:focus-visible     { outline: 3px solid #e8820c; outline-offset: 2px; }
        .calc-input:focus   { border-color: #e8820c !important; box-shadow: 0 0 0 3px rgba(232,130,12,0.12) !important; }

        @media (max-width: 700px) {
          .nav-tabs         { display: none !important; }
          .mobile-pill-nav  { display: flex !important; }
          .mobile-bottom-nav{ display: flex !important; }
          .main-scroll      { padding: 20px 16px 90px 16px !important; }
        }
        @media (max-width: 1050px) and (min-width: 701px) {
          .cat-label { display: none !important; }
        }
      `}</style>

      {/* Live announcer for screen readers */}
      <div
        ref={liveAnnouncerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />

      {/* Skip link */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          top: "-100px",
          left: "16px",
          zIndex: 9999,
          background: C.accent,
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
          fontWeight: "700",
          fontSize: "14px",
          textDecoration: "none",
          fontFamily: font,
          transition: "top 0.2s",
        }}
        onFocus={(e) => (e.target.style.top = "8px")}
        onBlur={(e) => (e.target.style.top = "-100px")}
      >
        Skip to main content
      </a>

      <TopNav
        activeCatId={activeCatId}
        activeCalcId={activeCalcId}
        onSelectCalc={selectCalc}
        onSelectCat={selectCat}
        onToggleRef={() => setShowRef((r) => !r)}
        showRef={showRef}
      />

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* Main */}
        <main
          id="main-content"
          tabIndex="-1"
          className="main-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            background: C.bg,
            padding: "32px 36px",
            minWidth: 0,
          }}
        >
          {/* Roof Pitch special */}
          {calc && calc.isSpecial && calc.id === "pitch" && (
            <RoofPitchCalc
              onSendToSquares={handleSendPitchToSquares}
              category={category}
              liveAnnouncerRef={liveAnnouncerRef}
            />
          )}

          {/* Standard calcs */}
          {calc && !calc.isSpecial && (
            <div style={{ maxWidth: "660px" }}>
              {/* Breadcrumb */}
              <nav
                aria-label="Breadcrumb"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: C.inkDim,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {category.label}
                </span>
                <span style={{ fontSize: "11px", color: C.inkDim }}>›</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: C.accentDark,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                  aria-current="page"
                >
                  {calc.label}
                </span>
              </nav>

              {/* Title card */}
              <div
                style={{
                  background: C.navBg,
                  borderRadius: "14px",
                  padding: "24px 28px",
                  marginBottom: "20px",
                  borderLeft: "5px solid " + C.accent,
                }}
              >
                <h1
                  ref={h1Ref}
                  tabIndex="-1"
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                    lineHeight: 1.1,
                    outline: "none",
                  }}
                >
                  {calc.label.toUpperCase()}
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(196,191,180,0.85)",
                    lineHeight: "1.5",
                    margin: 0,
                  }}
                >
                  {calc.blurb}
                </p>
              </div>

              {/* SEO blurb */}
              {calc.seoBlurb && (
                <p
                  style={{
                    fontSize: "14px",
                    color: C.inkMid,
                    lineHeight: "1.65",
                    marginBottom: "24px",
                    padding: "0 2px",
                  }}
                >
                  {calc.seoBlurb}
                </p>
              )}

              {/* Pitch pre-fill notice */}
              {activeCalcId === "squares" && values.pitch && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: C.accentSoft,
                    border: "2px solid " + C.accent,
                    borderRadius: "8px",
                    padding: "10px 16px",
                    marginBottom: "20px",
                    fontSize: "13px",
                  }}
                >
                  <span>🔗</span>
                  <span style={{ color: C.accentDark, fontWeight: "600" }}>
                    Pitch pre-filled from Roof Pitch Calculator ({values.pitch}
                    /12)
                  </span>
                  <button
                    onClick={() => setValues((p) => ({ ...p, pitch: "" }))}
                    aria-label="Clear pre-filled pitch"
                    style={{
                      marginLeft: "auto",
                      background: "transparent",
                      border: "none",
                      color: C.inkDim,
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: font,
                    }}
                  >
                    ✕ Clear
                  </button>
                </div>
              )}

              {/* Input card */}
              <div
                style={{
                  background: C.surface,
                  border: "2px solid " + C.border,
                  borderRadius: "14px",
                  padding: "28px",
                  marginBottom: "20px",
                  boxShadow: shadow.sm,
                }}
              >
                {/* Toggles */}
                {calc.toggles &&
                  calc.toggles.map((tog) => (
                    <div key={tog.id} style={{ marginBottom: "24px" }}>
                      <div
                        id={"tog-" + tog.id}
                        style={{
                          fontSize: "11px",
                          color: C.inkDim,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "1.2px",
                          marginBottom: "10px",
                        }}
                      >
                        {tog.label}
                      </div>
                      <div
                        role="group"
                        aria-labelledby={"tog-" + tog.id}
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {tog.options.map((opt, idx) => {
                          const sel = (toggles[tog.id] ?? 0) === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleToggle(tog.id, idx)}
                              aria-pressed={sel}
                              style={{
                                padding: "10px 20px",
                                border:
                                  "2px solid " + (sel ? C.accent : C.border),
                                borderRadius: "8px",
                                background: sel ? C.accent : C.bg,
                                color: sel ? "#fff" : C.inkMid,
                                fontSize: "13px",
                                fontFamily: font,
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.12s",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "18px",
                    marginBottom: "24px",
                  }}
                >
                  {calc.fields.map((f) => (
                    <div key={f.id}>
                      <label
                        htmlFor={calc.id + "-" + f.id}
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: C.inkDim,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "7px",
                        }}
                      >
                        {f.label}{" "}
                        <span
                          style={{
                            fontWeight: "400",
                            textTransform: "none",
                            letterSpacing: 0,
                            color: C.inkDim,
                          }}
                        >
                          ({f.unit})
                        </span>
                      </label>
                      <input
                        id={calc.id + "-" + f.id}
                        type="number"
                        step="any"
                        min="0"
                        className="calc-input"
                        placeholder={
                          f.placeholder ??
                          (f.default !== undefined ? String(f.default) : "")
                        }
                        value={values[f.id] ?? ""}
                        onChange={(e) => handleInput(f.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (["e", "E", "-", "+"].includes(e.key))
                            e.preventDefault();
                          if (e.key === "Enter") calculate();
                        }}
                        style={inputStyle}
                        aria-describedby={error ? "calc-error" : undefined}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={calculate}
                    style={calcBtnStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.accentDeep)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = C.accent)
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.98)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    Calculate
                  </button>
                  <button
                    onClick={reset}
                    style={clearBtnStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.ink;
                      e.currentTarget.style.color = C.ink;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.inkMid;
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {error && (
                <div
                  id="calc-error"
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: C.redSoft,
                    border: "2px solid " + C.red,
                    borderRadius: "8px",
                    color: C.red,
                    padding: "12px 16px",
                    fontSize: "14px",
                    marginBottom: "20px",
                    fontWeight: "600",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {result && (
                <section
                  aria-label="Calculation results"
                  style={{ animation: "popIn 0.2s ease" }}
                >
                  {/* Main result */}
                  <div
                    style={{
                      background: C.navBg,
                      borderRadius: "14px",
                      padding: "28px",
                      marginBottom: "12px",
                      borderLeft: "5px solid " + C.accent,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(196,191,180,0.6)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        marginBottom: "12px",
                      }}
                    >
                      {result.mainLabel}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fontDisplay,
                          fontSize: "60px",
                          fontWeight: "700",
                          color: C.accent,
                          letterSpacing: "-1px",
                          lineHeight: "1",
                        }}
                      >
                        {result.main}
                      </span>
                      <span
                        style={{
                          fontSize: "22px",
                          color: "rgba(196,191,180,0.7)",
                          fontWeight: "500",
                        }}
                      >
                        {result.mainUnit}
                      </span>
                    </div>
                  </div>

                  {/* Extra stats */}
                  {result.extras && result.extras.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      {result.extras.map((ex, i) => {
                        const isG = ex.status === "green",
                          isR = ex.status === "red";
                        return (
                          <div
                            key={i}
                            style={{
                              background: isG
                                ? C.greenSoft
                                : isR
                                  ? C.redSoft
                                  : C.surface,
                              border:
                                "2px solid " +
                                (isG ? C.green : isR ? C.red : C.border),
                              borderRadius: "10px",
                              padding: "14px 16px",
                              boxShadow: shadow.sm,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "10px",
                                color: isG ? C.green : isR ? C.red : C.inkDim,
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                marginBottom: "6px",
                              }}
                            >
                              {ex.label}
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: isG ? C.green : isR ? C.red : C.ink,
                                lineHeight: "1.3",
                              }}
                            >
                              {ex.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.inkDim,
                      marginBottom: "4px",
                    }}
                  >
                    ℹ Estimates only — always verify with a licensed
                    professional.
                  </div>
                  <LeadGenCTA calcId={activeCalcId} />
                  <AffiliateSuggestions calcId={activeCalcId} />
                </section>
              )}
            </div>
          )}
        </main>

        {/* Quick Ref sidebar */}
        {showRef && (
          <aside
            aria-label="Quick reference values"
            style={{
              width: "230px",
              flexShrink: 0,
              background: C.surface,
              borderLeft: "2px solid " + C.border,
              padding: "22px 18px",
              overflowY: "auto",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: "14px",
                fontWeight: "700",
                color: C.ink,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "14px",
              }}
            >
              Quick Ref
            </div>
            {QUICK_REFS.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid " + C.border,
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: C.inkDim,
                    lineHeight: "1.3",
                  }}
                >
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: C.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.val}
                </span>
              </div>
            ))}
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: "14px",
                fontWeight: "700",
                color: C.ink,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                margin: "22px 0 12px",
              }}
            >
              Waste Factors
            </div>
            {WASTE_FACTORS.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid " + C.border,
                }}
              >
                <span style={{ fontSize: "12px", color: C.inkDim }}>
                  {r.label}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: C.accentDark,
                  }}
                >
                  {r.val}
                </span>
              </div>
            ))}
          </aside>
        )}
      </div>

      <MobileBottomNav activeCatId={activeCatId} onSelectCat={selectCat} />
    </div>
  );
}

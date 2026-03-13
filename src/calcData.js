// ─── CALCULATOR DATA ────────────────────────────────────────────────────────
// All categories, calculators, fields, and formulas.
// Also includes dropdown display metadata: blurb (80-100 chars), emoji icon.

export const CATEGORIES = [
  {
    id: "concrete",
    label: "Concrete",
    icon: "▪",
    accentColor: "#e8820c",
    photo:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Slab volume, footing quantities, cubic yards, bag counts — everything before the truck rolls.",
    calcs: [
      {
        id: "slab",
        label: "Slab Volume",
        emoji: "🧱",
        blurb:
          "Cubic yards + 80 lb bag count for any flat slab. Includes 10% waste and metric conversion.",
        photo:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=280&q=75&auto=format&fit=crop",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 20" },
          { id: "width", label: "Width", unit: "ft", placeholder: "e.g. 12" },
          {
            id: "thickness",
            label: "Thickness",
            unit: "in",
            placeholder: "e.g. 4",
          },
        ],
        formula: (v) => {
          const cuFt = v.length * v.width * (v.thickness / 12);
          const yards = cuFt / 27;
          return {
            main: yards.toFixed(2),
            mainUnit: "yd³",
            mainLabel: "Cubic Yards",
            extras: [
              {
                label: "With 10% Waste",
                value: (yards * 1.1).toFixed(2) + " yd³",
              },
              { label: "Cubic Feet", value: cuFt.toFixed(1) + " ft³" },
              {
                label: "Cubic Meters",
                value: (cuFt * 0.0283168).toFixed(3) + " m³",
              },
              {
                label: "Est. 80 lb Bags",
                value: Math.ceil(cuFt * 0.45) + " bags",
              },
            ],
          };
        },
        seoBlurb:
          "Calculate how much concrete you need for any flat slab. Enter length, width, and thickness to get cubic yards, cubic feet, bag count, and metric equivalents — all with a built-in 10% waste factor.",
      },
      {
        id: "footing",
        label: "Footing Volume",
        emoji: "🏗️",
        blurb:
          "Strip or continuous footing concrete volume in cubic yards. Add waste with one click.",
        photo:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=280&q=75&auto=format&fit=crop",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 40" },
          { id: "width", label: "Width", unit: "in", placeholder: "e.g. 12" },
          { id: "depth", label: "Depth", unit: "in", placeholder: "e.g. 8" },
        ],
        formula: (v) => {
          const cuFt = v.length * (v.width / 12) * (v.depth / 12);
          const yards = cuFt / 27;
          return {
            main: yards.toFixed(2),
            mainUnit: "yd³",
            mainLabel: "Cubic Yards",
            extras: [
              { label: "Cubic Feet", value: cuFt.toFixed(2) + " ft³" },
              {
                label: "With 10% Waste",
                value: (yards * 1.1).toFixed(2) + " yd³",
              },
            ],
          };
        },
        seoBlurb:
          "Estimate concrete volume for strip footings and continuous footings. Enter length, width, and depth in feet or inches — get cubic yards with optional waste factor.",
      },
    ],
  },

  {
    id: "framing",
    label: "Framing",
    icon: "⬜",
    accentColor: "#1a6e3f",
    photo:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Stud counts, rafter lengths, and plate material for any wall or roof frame.",
    calcs: [
      {
        id: "studs",
        label: "Wall Studs",
        emoji: "🔩",
        blurb:
          'Stud count for any wall at 16" or 24" OC. Includes plates and board-foot estimate.',
        photo:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "length",
            label: "Wall Length",
            unit: "ft",
            placeholder: "e.g. 24",
          },
          {
            id: "spacing",
            label: "Stud Spacing",
            unit: "in",
            placeholder: "16 or 24",
            default: 16,
          },
          {
            id: "height",
            label: "Wall Height",
            unit: "ft",
            placeholder: "e.g. 9",
            default: 8,
          },
        ],
        formula: (v) => {
          const count = Math.ceil(v.length / (v.spacing / 12) + 1);
          const bf = count * v.height * (1.5 / 12) * (3.5 / 12) * 12;
          return {
            main: count,
            mainUnit: "studs",
            mainLabel: "Studs Required",
            extras: [
              {
                label: "With 10% Waste",
                value: Math.ceil(count * 1.1) + " studs",
              },
              { label: "Board Feet", value: bf.toFixed(1) + " BF" },
              {
                label: "Est. Plates",
                value: (v.length * 3).toFixed(1) + " LF",
              },
            ],
          };
        },
        seoBlurb:
          'Calculate studs for a framed wall at 16" or 24" on-center spacing. Returns total count, 10% waste buffer, board feet of lumber, and plate linear footage.',
      },
      {
        id: "rafters",
        label: "Rafter Length",
        emoji: "📐",
        blurb:
          "True rafter length from span and pitch. Returns ridge height and roof angle too.",
        photo:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "span",
            label: "Building Span",
            unit: "ft",
            placeholder: "e.g. 28",
          },
          {
            id: "pitch",
            label: "Roof Pitch",
            unit: "x/12",
            placeholder: "e.g. 6",
          },
          {
            id: "overhang",
            label: "Overhang",
            unit: "in",
            placeholder: "e.g. 12",
            default: 12,
          },
        ],
        formula: (v) => {
          const run = v.span / 2;
          const rise = (v.pitch / 12) * run;
          const rafter = Math.sqrt(run * run + rise * rise);
          const total = rafter + v.overhang / 12;
          const angle = Math.atan(v.pitch / 12) * (180 / Math.PI);
          return {
            main: total.toFixed(2),
            mainUnit: "ft",
            mainLabel: "Rafter Length",
            extras: [
              { label: "Without Overhang", value: rafter.toFixed(2) + " ft" },
              { label: "Ridge Height", value: rise.toFixed(2) + " ft" },
              { label: "Roof Angle", value: angle.toFixed(1) + "°" },
            ],
          };
        },
        seoBlurb:
          "Get exact rafter length from building span, roof pitch, and overhang. Also returns ridge height and roof angle — all in one calculation.",
      },
    ],
  },

  {
    id: "area",
    label: "Area & Volume",
    icon: "◻",
    accentColor: "#1a5f8a",
    photo:
      "https://images.unsplash.com/photo-1558618047-f4e90d8b0e2c?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Floor area, wall area, room volume, paint gallons, and triangular sections.",
    calcs: [
      {
        id: "room",
        label: "Room Area",
        emoji: "📏",
        blurb:
          "Floor area, all-wall square footage, room volume, paint gallons, and flooring estimate.",
        photo:
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=280&q=75&auto=format&fit=crop",
        fields: [
          { id: "length", label: "Length", unit: "ft", placeholder: "e.g. 14" },
          { id: "width", label: "Width", unit: "ft", placeholder: "e.g. 12" },
          {
            id: "height",
            label: "Ceiling Height",
            unit: "ft",
            placeholder: "e.g. 9",
            default: 8,
          },
        ],
        formula: (v) => {
          const floor = v.length * v.width;
          const walls = 2 * (v.length + v.width) * v.height;
          return {
            main: floor.toFixed(0),
            mainUnit: "ft²",
            mainLabel: "Floor Area",
            extras: [
              { label: "Wall Area", value: walls.toFixed(0) + " ft²" },
              {
                label: "Volume",
                value: (floor * v.height).toFixed(0) + " ft³",
              },
              {
                label: "Paint (1 coat)",
                value: Math.ceil(walls / 350) + " gal",
              },
              {
                label: "Flooring + 10%",
                value: (floor * 1.1).toFixed(0) + " ft²",
              },
            ],
          };
        },
        seoBlurb:
          "Calculate floor area, total wall area, room volume, paint gallons needed, and flooring square footage with 10% waste — all from three dimensions.",
      },
      {
        id: "triangle",
        label: "Triangle Area",
        emoji: "📐",
        blurb:
          "Area of any triangular surface — gable ends, hip roof sections, odd-shaped lots.",
        photo:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&q=75&auto=format&fit=crop",
        fields: [
          { id: "base", label: "Base", unit: "ft", placeholder: "e.g. 20" },
          { id: "height", label: "Height", unit: "ft", placeholder: "e.g. 8" },
        ],
        formula: (v) => {
          const area = 0.5 * v.base * v.height;
          const hyp = Math.sqrt(v.base * v.base + v.height * v.height);
          return {
            main: area.toFixed(2),
            mainUnit: "ft²",
            mainLabel: "Triangle Area",
            extras: [
              { label: "Hypotenuse", value: hyp.toFixed(2) + " ft" },
              {
                label: "Perimeter",
                value: (v.base + v.height + hyp).toFixed(2) + " ft",
              },
            ],
          };
        },
        seoBlurb:
          "Find area, hypotenuse, and perimeter of any right triangle. Perfect for gable ends, hip sections, and angled lot calculations.",
      },
    ],
  },

  {
    id: "materials",
    label: "Materials",
    icon: "▦",
    accentColor: "#6b3d9a",
    photo:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Brick counts, drywall sheets, and masonry estimates with mortar and waste built in.",
    calcs: [
      {
        id: "brick",
        label: "Brick Calculator",
        emoji: "🧱",
        blurb:
          "Bricks and mortar for any wall. Accounts for joint size and standard waste factor.",
        photo:
          "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "length",
            label: "Wall Length",
            unit: "ft",
            placeholder: "e.g. 30",
          },
          {
            id: "height",
            label: "Wall Height",
            unit: "ft",
            placeholder: "e.g. 8",
          },
          {
            id: "brickW",
            label: "Brick Width",
            unit: "in",
            placeholder: "3.625",
            default: 3.625,
          },
          {
            id: "brickH",
            label: "Brick Height",
            unit: "in",
            placeholder: "2.25",
            default: 2.25,
          },
          {
            id: "joint",
            label: "Mortar Joint",
            unit: "in",
            placeholder: "0.375",
            default: 0.375,
          },
        ],
        formula: (v) => {
          const perSqFt = 144 / ((v.brickW + v.joint) * (v.brickH + v.joint));
          const count = Math.ceil(v.length * v.height * perSqFt);
          return {
            main: count,
            mainUnit: "bricks",
            mainLabel: "Bricks Required",
            extras: [
              {
                label: "Wall Area",
                value: (v.length * v.height).toFixed(1) + " ft²",
              },
              { label: "Per Sq Ft", value: perSqFt.toFixed(2) },
              {
                label: "With 10% Waste",
                value: Math.ceil(count * 1.1) + " bricks",
              },
            ],
          };
        },
        seoBlurb:
          "Enter wall dimensions and brick size to get exact brick count, wall area, and per-square-foot rate — with joint size and 10% waste factored in.",
      },
      {
        id: "drywall",
        label: "Drywall Sheets",
        emoji: "🪵",
        blurb:
          "4×8 or 4×12 sheet count for any wall area. Includes 12% waste for cuts and seams.",
        photo:
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "area",
            label: "Total Wall Area",
            unit: "ft²",
            placeholder: "e.g. 480",
          },
          {
            id: "sheetH",
            label: "Sheet Length",
            unit: "ft",
            placeholder: "8 or 12",
            default: 8,
          },
        ],
        formula: (v) => {
          const sheetArea = 4 * v.sheetH;
          const sheets = Math.ceil(v.area / sheetArea);
          return {
            main: sheets,
            mainUnit: "sheets",
            mainLabel: "Sheets Required",
            extras: [
              { label: "Sheet Size", value: "4 × " + v.sheetH + " ft" },
              {
                label: "With 12% Waste",
                value: Math.ceil((v.area * 1.12) / sheetArea) + " sheets",
              },
              {
                label: "Total Coverage",
                value: (sheets * sheetArea).toFixed(0) + " ft²",
              },
            ],
          };
        },
        seoBlurb:
          "Calculate how many drywall sheets you need for any wall or ceiling area. Supports 4×8 and 4×12 sheets with 12% waste for cuts and waste.",
      },
    ],
  },

  {
    id: "electrical",
    label: "Electrical",
    icon: "⚡",
    accentColor: "#c49a00",
    photo:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Wire gauge, ampacity, and voltage drop — NEC-based results for any circuit.",
    calcs: [
      {
        id: "wire",
        label: "Wire & Ampacity",
        emoji: "⚡",
        blurb:
          "Load to amperage, wire gauge, breaker size, and NEC 3% voltage drop check in one shot.",
        photo:
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "load",
            label: "Load",
            unit: "watts",
            placeholder: "e.g. 1800",
          },
          {
            id: "voltage",
            label: "Voltage",
            unit: "V",
            placeholder: "120 or 240",
            default: 120,
          },
          {
            id: "distance",
            label: "Run Distance (1-way)",
            unit: "ft",
            placeholder: "e.g. 50",
          },
          {
            id: "pf",
            label: "Power Factor",
            unit: "0–1",
            placeholder: "1.0",
            default: 1,
          },
        ],
        formula: (v) => {
          const amps = v.load / (v.voltage * v.pf);
          const gauge =
            amps <= 15
              ? "14 AWG"
              : amps <= 20
                ? "12 AWG"
                : amps <= 30
                  ? "10 AWG"
                  : amps <= 50
                    ? "8 AWG"
                    : "6 AWG";
          const breaker =
            amps <= 15
              ? "15 A"
              : amps <= 20
                ? "20 A"
                : amps <= 30
                  ? "30 A"
                  : amps <= 50
                    ? "50 A"
                    : "60 A";
          const vDrop = 2 * v.distance * amps * 0.00328;
          const vPct = (vDrop / v.voltage) * 100;
          const pass = vPct <= 3;
          return {
            main: amps.toFixed(2),
            mainUnit: "A",
            mainLabel: "Draw (Amperage)",
            extras: [
              { label: "Wire Gauge", value: gauge },
              { label: "Breaker Size", value: breaker },
              {
                label: "Voltage Drop",
                value: vDrop.toFixed(2) + " V (" + vPct.toFixed(1) + "%)",
              },
              {
                label: "NEC 3% Limit",
                value: pass ? "✓ Pass" : "✗ Exceeds 3%",
                status: pass ? "green" : "red",
              },
            ],
          };
        },
        seoBlurb:
          "Enter watts, voltage, run distance, and power factor. Get amperage draw, wire gauge, breaker size, and an NEC 3% voltage drop pass/fail check.",
      },
    ],
  },

  {
    id: "insulation",
    label: "Insulation",
    icon: "▣",
    accentColor: "#c45000",
    photo:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Spray foam board feet, R-value, kit count, and blown-in cellulose bag estimates.",
    calcs: [
      {
        id: "sprayfoam",
        label: "Spray Foam",
        emoji: "💨",
        blurb:
          "Board feet, R-value, kit count, and installed cost for open-cell or closed-cell foam.",
        photo:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "area",
            label: "Area to Cover",
            unit: "ft²",
            placeholder: "e.g. 800",
          },
          {
            id: "thickness",
            label: "Desired Thickness",
            unit: "in",
            placeholder: "e.g. 3",
          },
        ],
        toggles: [
          {
            id: "foamType",
            label: "Foam Type",
            options: ["Open-Cell (0.5 lb)", "Closed-Cell (2 lb)"],
          },
        ],
        formula: (v, togs) => {
          const isCC = (togs?.foamType ?? 0) === 1;
          const bf = v.area * v.thickness;
          const rPerInch = isCC ? 6.5 : 3.7;
          return {
            main: bf.toFixed(0),
            mainUnit: "BF",
            mainLabel: "Board Feet",
            extras: [
              {
                label: "R-Value Achieved",
                value:
                  "R-" +
                  (rPerInch * v.thickness).toFixed(1) +
                  " (" +
                  rPerInch +
                  "/in)",
              },
              { label: "600 BF Kits", value: Math.ceil(bf / 600) + " kit(s)" },
              { label: "200 BF Kits", value: Math.ceil(bf / 200) + " kit(s)" },
              {
                label: "Est. Installed",
                value:
                  "$" +
                  (bf * (isCC ? 1.0 : 0.44)).toFixed(0) +
                  " – $" +
                  (bf * (isCC ? 1.5 : 0.65)).toFixed(0),
              },
              {
                label: "Vapor Barrier",
                value: isCC ? "Not Required" : "Required",
              },
            ],
          };
        },
        seoBlurb:
          "Calculate board feet, R-value achieved, 200 and 600 BF kit count, and installed cost range for open-cell or closed-cell spray foam insulation.",
      },
      {
        id: "cellulose",
        label: "Cellulose",
        emoji: "🌿",
        blurb:
          "30 lb bag count for blown-in attic or dense-pack wall cellulose. Targets any R-value.",
        photo:
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "area",
            label: "Area to Cover",
            unit: "ft²",
            placeholder: "e.g. 1200",
          },
          {
            id: "rvalue",
            label: "Target R-Value",
            unit: "R-",
            placeholder: "e.g. 38",
            default: 38,
          },
        ],
        toggles: [
          {
            id: "cellType",
            label: "Install Method",
            options: ["Loose-Blow (Attic)", "Dense-Pack (Walls)"],
          },
        ],
        formula: (v, togs) => {
          const isDense = (togs?.cellType ?? 0) === 1;
          const rPerInch = isDense ? 3.6 : 3.5;
          const depthFt = v.rvalue / rPerInch / 12;
          const lbs = v.area * depthFt * (isDense ? 3.5 : 1.5);
          const bags = Math.ceil(lbs / 30);
          return {
            main: bags,
            mainUnit: "bags",
            mainLabel: "30 lb Bags Required",
            extras: [
              {
                label: "Depth Required",
                value: (depthFt * 12).toFixed(1) + " in",
              },
              { label: "R-Value / Inch", value: "R-" + rPerInch },
              { label: "Total Weight", value: lbs.toFixed(0) + " lbs" },
              {
                label: "Est. Material",
                value:
                  "$" +
                  (lbs * 0.35).toFixed(0) +
                  " – $" +
                  (lbs * 0.55).toFixed(0),
              },
            ],
          };
        },
        seoBlurb:
          "Calculate 30 lb bags of blown-in cellulose for loose-blow attic or dense-pack wall installation. Enter area and target R-value — depth and weight auto-calculated.",
      },
    ],
  },

  {
    id: "roofing",
    label: "Roofing",
    icon: "△",
    accentColor: "#b83232",
    photo:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=320&q=75&auto=format&fit=crop",
    blurb:
      "Roof pitch with material guide, roofing squares, shingle bundles, and pitch factor.",
    calcs: [
      {
        id: "pitch",
        label: "Roof Pitch",
        emoji: "🏠",
        blurb:
          "Pitch from rise/run, span, or angle. Includes material compatibility guide and pitch factor.",
        photo:
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=280&q=75&auto=format&fit=crop",
        isSpecial: true,
        seoBlurb:
          "Calculate roof pitch from rise & run, total span & rise, or angle in degrees. Get pitch factor, angle, compatible materials, and a link to the roofing squares calculator.",
      },
      {
        id: "squares",
        label: "Roofing Squares",
        emoji: "📦",
        blurb:
          "Squares, bundles, and total roof area for any pitched roof with overhang and waste.",
        photo:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=280&q=75&auto=format&fit=crop",
        fields: [
          {
            id: "length",
            label: "Building Length",
            unit: "ft",
            placeholder: "e.g. 40",
          },
          {
            id: "width",
            label: "Building Width",
            unit: "ft",
            placeholder: "e.g. 28",
          },
          {
            id: "pitch",
            label: "Roof Pitch",
            unit: "x/12",
            placeholder: "e.g. 6",
          },
          {
            id: "overhang",
            label: "Eave Overhang",
            unit: "in",
            placeholder: "e.g. 12",
            default: 12,
          },
        ],
        formula: (v) => {
          const factor = Math.sqrt(1 + Math.pow(v.pitch / 12, 2));
          const oh = v.overhang / 12;
          const area = (v.length + oh * 2) * (v.width + oh * 2) * factor;
          const squares = area / 100;
          return {
            main: squares.toFixed(2),
            mainUnit: "sq",
            mainLabel: "Roofing Squares",
            extras: [
              { label: "Roof Area", value: area.toFixed(0) + " ft²" },
              {
                label: "With 15% Waste",
                value: (squares * 1.15).toFixed(2) + " sq",
              },
              {
                label: "Bundles (3/sq)",
                value: Math.ceil(squares * 1.15 * 3) + " bundles",
              },
              { label: "Pitch Factor", value: factor.toFixed(4) },
            ],
          };
        },
        seoBlurb:
          "Calculate roofing squares, total roof area, bundle count, and pitch factor for any pitched roof. Accounts for overhang on all sides with 15% waste.",
      },
    ],
  },
];

export const QUICK_REFS = [
  { label: "1 Cubic Yard", val: "27 ft³" },
  { label: "1 Roofing Square", val: "100 ft²" },
  { label: "1 Board Foot", val: "144 in³" },
  { label: "Concrete Weight", val: "~150 lb/ft³" },
  { label: "12 AWG Wire", val: "20 A max" },
  { label: "10 AWG Wire", val: "30 A max" },
  { label: "Brick (standard)", val: "~7 per ft²" },
  { label: "Drywall 4×8", val: "32 ft²" },
  { label: "R-Value / in OC", val: "R-3.7 open, R-6.5 CC" },
];

export const WASTE_FACTORS = [
  { label: "Concrete", val: "+10%" },
  { label: "Framing", val: "+15%" },
  { label: "Drywall", val: "+12%" },
  { label: "Tile / Flooring", val: "+10–15%" },
  { label: "Roofing", val: "+15%" },
  { label: "Spray Foam", val: "+5%" },
  { label: "Brick", val: "+10%" },
];

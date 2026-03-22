import type { TradePageDefinition } from "./trade-pages";

type TileBullets = {
  inputs: string;
  outputs: string;
  compliance: string;
};

export type TileCopy = {
  summary: string;
  bullets: TileBullets;
};

const TILE_COPY: Record<string, TileCopy> = {
  // Concrete & Masonry
  "concrete-slab": {
    summary: "Fast slab yardage with waste baked in for mixed pours.",
    bullets: {
      inputs: "Inputs: Slab length, width, thickness, waste %.",
      outputs: "Outputs: Cubic yards plus overage and mix note.",
      compliance: "Compliance: Freeze-line buffer + 10% waste guard.",
    },
  },
  "concrete-footing": {
    summary: "Footing trench volume and pour plan for foundations.",
    bullets: {
      inputs: "Inputs: Trench width, depth, run length, waste %.",
      outputs: "Outputs: Cubic yards and linear pour schedule.",
      compliance: "Compliance: NY frost depth and overdig cushion.",
    },
  },
  "concrete-block": {
    summary: "Block and brick counts with mortar and breakage baked in.",
    bullets: {
      inputs: "Inputs: Wall height, length, block size, openings.",
      outputs: "Outputs: Block count plus mortar bag estimate.",
      compliance: "Compliance: Adds 5–8% breakage for masonry waste.",
    },
  },
  "concrete-block-wall": {
    summary: "CMU wall count with rebar and bond beam allowances.",
    bullets: {
      inputs: "Inputs: Course height, wall length, openings, spacing.",
      outputs: "Outputs: CMU units, mortar, fill, bar counts.",
      compliance: "Compliance: Bond beam/rebar prompts for field QA.",
    },
  },

  // Framing & Lumber
  "framing-wall": {
    summary: "Wall framing studs, plates, and sheet needs in one pass.",
    bullets: {
      inputs: "Inputs: Wall length, stud spacing, plate runs, openings.",
      outputs: "Outputs: Stud count, plate footage, sheet area.",
      compliance: "Compliance: Opening deductions + OC spacing guard.",
    },
  },
  "framing-rafters": {
    summary: "Rafter length and count from run/rise geometry.",
    bullets: {
      inputs: "Inputs: Run, rise, span, spacing, overhang.",
      outputs: "Outputs: Rafter length, seat cut, quantity.",
      compliance: "Compliance: Snow-load pitch reminder before cuts.",
    },
  },
  "framing-floor": {
    summary: "Floor joist counts tied to span-aware spacing.",
    bullets: {
      inputs: "Inputs: Room length, width, joist spacing choice.",
      outputs: "Outputs: Joist count, total footage, waste.",
      compliance: "Compliance: Span-table spacing cue before order.",
    },
  },
  "framing-roof": {
    summary: "Roof rafter quantities with steep-slope waste baked in.",
    bullets: {
      inputs: "Inputs: Roof width, span, pitch, spacing.",
      outputs: "Outputs: Rafter count plus cut length target.",
      compliance: "Compliance: Steep-slope waste guard for Upstate.",
    },
  },
  "framing-headers": {
    summary: "Header sizing helper for openings and load categories.",
    bullets: {
      inputs: "Inputs: Opening width, span type, load assumption.",
      outputs: "Outputs: Suggested header size and lumber set.",
      compliance: "Compliance: Prompts local span-table verification.",
    },
  },
  "framing-wall-studs": {
    summary: "Stud counts for straight walls with opening deductions.",
    bullets: {
      inputs: "Inputs: Wall length, height, stud spacing, openings.",
      outputs: "Outputs: Studs, plates, blocking allowances.",
      compliance: "Compliance: Opening adjustments baked into count.",
    },
  },
  "framing-rafter-length": {
    summary: "Exact rafter length math with plumb and seat cuts.",
    bullets: {
      inputs: "Inputs: Rise, run, overhang, pitch mode.",
      outputs: "Outputs: Rafter length plus cut sheet snapshot.",
      compliance: "Compliance: Snow-region pitch check reminder.",
    },
  },
  "framing-deck-joists": {
    summary: "Deck joist layout tied to spacing and hanger counts.",
    bullets: {
      inputs: "Inputs: Deck length, width, joist spacing, ledger.",
      outputs: "Outputs: Joist count, hanger count, beam calls.",
      compliance: "Compliance: Spacing cross-check vs decking spec.",
    },
  },
  decking: {
    summary: "Deck board and joist quantities with cut waste baked in.",
    bullets: {
      inputs: "Inputs: Deck dims, board width, joist spacing.",
      outputs: "Outputs: Board count, joists, fastener volume.",
      compliance: "Compliance: Moisture/wet-weather waste guard.",
    },
  },

  // Roofing & Siding
  "roofing-shingles": {
    summary: "Bundle counts from squares with starter and ridge baked in.",
    bullets: {
      inputs: "Inputs: Roof area, pitch, waste %, plane count.",
      outputs: "Outputs: Bundles, ridge/hip, starter allowances.",
      compliance: "Compliance: Adds storm-season waste buffer.",
    },
  },
  "roofing-pitch": {
    summary: "Rise/run to pitch and slope factors for quick checks.",
    bullets: {
      inputs: "Inputs: Rise and run or slope angle entry.",
      outputs: "Outputs: Pitch ratio, slope %, multiplier.",
      compliance: "Compliance: Per-plane pitch reminder for QA.",
    },
  },
  "roofing-siding": {
    summary: "Exterior siding squares plus drip edge and flashing runs.",
    bullets: {
      inputs: "Inputs: Facade height/width, openings, edges.",
      outputs: "Outputs: Squares, drip edge, flashing lengths.",
      compliance: "Compliance: Wind exposure buffer for trim metal.",
    },
  },
  "roofing-shingle-bundles": {
    summary: "Rapid shingle bundle math with ridge/hip coverage.",
    bullets: {
      inputs: "Inputs: Roof squares, pitch, waste %, planes.",
      outputs: "Outputs: Bundle count plus accessory split.",
      compliance: "Compliance: Starter/hip waste baked into total.",
    },
  },
  "roofing-pitch-slope": {
    summary: "Pitch and slope converter for material multipliers.",
    bullets: {
      inputs: "Inputs: Rise/run, angle, or pitch fraction.",
      outputs: "Outputs: Pitch, slope %, roof factor.",
      compliance: "Compliance: Mixed-pitch alert across planes.",
    },
  },
  "roofing-siding-squares": {
    summary: "Siding square counts with cut-heavy gable awareness.",
    bullets: {
      inputs: "Inputs: Wall width/height, gable shape, waste %.",
      outputs: "Outputs: Squares plus trim/soffit accessory list.",
      compliance: "Compliance: Gable and cut waste baked in.",
    },
  },

  // HVAC, Site, Mechanical
  "mechanical-btu-estimator": {
    summary: "Temporary heat BTU check tuned for GC field use.",
    bullets: {
      inputs: "Inputs: Area, delta-T, insulation/door status.",
      outputs: "Outputs: BTU target and heater size guidance.",
      compliance: "Compliance: Upstate cold-snap safety margin.",
    },
  },
  "mechanical-ventilation-calc": {
    summary: "Square-foot ventilation baseline with CFM targets.",
    bullets: {
      inputs: "Inputs: Area, occupancy, air-change goal.",
      outputs: "Outputs: Target CFM and ACH guidance.",
      compliance: "Compliance: Baseline only—verify code per job.",
    },
  },
  "mechanical-drywall-sheets": {
    summary: "Drywall sheet counts for GC sequencing checks.",
    bullets: {
      inputs: "Inputs: Room dims, ceiling height, board size.",
      outputs: "Outputs: Sheet counts plus waste buffer.",
      compliance: "Compliance: Notes inspection order before hang.",
    },
  },

  // Finish Carpentry
  "finish-trim": {
    summary: "Trim/baseboard linear footage with stock length picks.",
    bullets: {
      inputs: "Inputs: Perimeter by room, profile, stock length.",
      outputs: "Outputs: LF per profile and piece counts.",
      compliance: "Compliance: Cut/splice waste baked into totals.",
    },
  },
  "finish-flooring": {
    summary: "Flooring waste math for tile, LVP, and hardwood runs.",
    bullets: {
      inputs: "Inputs: Room area, layout angle, waste %.",
      outputs: "Outputs: Material SF plus waste-adjusted order.",
      compliance: "Compliance: Diagonal/pattern waste bump noted.",
    },
  },
  "finish-stairs": {
    summary: "Stair stringer layout with tread and riser counts.",
    bullets: {
      inputs: "Inputs: Total rise/run, tread depth, stringers.",
      outputs: "Outputs: Tread count, stringer cuts, angles.",
      compliance: "Compliance: IRC rise/run envelope reminder.",
    },
  },

  // Business & Estimating
  "business-profit-margin": {
    summary: "Profit margin model that mirrors bid math quickly.",
    bullets: {
      inputs: "Inputs: Revenue, direct costs, overhead, burden.",
      outputs: "Outputs: Gross and net margin with alerts.",
      compliance: "Compliance: Flags margin floor by trade.",
    },
  },
  "business-labor-rate": {
    summary: "Burdened labor rate builder for clean crew pricing.",
    bullets: {
      inputs: "Inputs: Wages, taxes, insurance, overhead %.",
      outputs: "Outputs: Hourly burdened rate and markup.",
      compliance: "Compliance: Prompts quarterly burden refresh.",
    },
  },
  "business-lead-estimator": {
    summary: "Lead cost math with close-rate and budget guardrails.",
    bullets: {
      inputs: "Inputs: Lead volume, CPL, close %, avg ticket.",
      outputs: "Outputs: Cost per sale, budget ceiling, ROI.",
      compliance: "Compliance: Seasonality toggle for tri-county crews.",
    },
  },
  "business-tax-save": {
    summary: "Tax-impact sandbox to protect net margin on bids.",
    bullets: {
      inputs: "Inputs: Revenue mix, expense mix, tax rate/region.",
      outputs: "Outputs: Estimated tax hit and net margin view.",
      compliance: "Compliance: NY capital improvement flag baked in.",
    },
  },

  // Insulation & Interior
  "insulation-r-value": {
    summary: "Effective R-value tracker by assembly zone.",
    bullets: {
      inputs: "Inputs: Cavity depth, material R, continuous layer.",
      outputs: "Outputs: Effective R per assembly and layer.",
      compliance: "Compliance: Thermal bridge check surfaced inline.",
    },
  },
  "insulation-drywall": {
    summary: "Drywall sheet counts with waste tuned for interiors.",
    bullets: {
      inputs: "Inputs: Room dims, ceiling height, board size.",
      outputs: "Outputs: Sheet counts plus waste percentage.",
      compliance: "Compliance: Staggered seam reminder before hang.",
    },
  },
  "insulation-r-value-tracker": {
    summary: "Zone-by-zone R tracking for HVAC and envelope prep.",
    bullets: {
      inputs: "Inputs: Assembly type, cavity R, continuous R.",
      outputs: "Outputs: Effective R per zone and average.",
      compliance: "Compliance: Notes NY frost-line considerations.",
    },
  },
  "insulation-drywall-sheets": {
    summary: "Drywall sheet calculator with waste and delivery cues.",
    bullets: {
      inputs: "Inputs: Room dims, board size, ceiling height.",
      outputs: "Outputs: Sheet count, waste, board mix.",
      compliance: "Compliance: Mentions inspection order timing.",
    },
  },
  "insulation-duct-sizing": {
    summary: "Baseline duct sizing from target airflow needs.",
    bullets: {
      inputs: "Inputs: Room CFM target, length, friction rate.",
      outputs: "Outputs: Suggested duct size and velocity.",
      compliance: "Compliance: Verify against Manual D before buy.",
    },
  },
  "interior-trim-baseboard": {
    summary: "Interior trim and baseboard counts with room grouping.",
    bullets: {
      inputs: "Inputs: Perimeter by room, profile, stock length.",
      outputs: "Outputs: LF per profile and piece counts.",
      compliance: "Compliance: Accounts for corners and openings.",
    },
  },
  "interior-flooring-waste": {
    summary: "Interior flooring waste guard for cut-heavy rooms.",
    bullets: {
      inputs: "Inputs: Room area, pattern, waste %, board size.",
      outputs: "Outputs: Material SF plus waste-adjusted order.",
      compliance: "Compliance: Diagonal/herringbone bump ready.",
    },
  },
  "interior-stair-stringers": {
    summary: "Interior stair stringer layout and cut list helper.",
    bullets: {
      inputs: "Inputs: Rise, run, tread depth, stringer count.",
      outputs: "Outputs: Tread/riser counts and cut angles.",
      compliance: "Compliance: IRC rise/run reminder for remodels.",
    },
  },
  "interior-paint-gal": {
    summary: "Paint gallon math with coats and coverage per room.",
    bullets: {
      inputs: "Inputs: Wall area, coats, coverage, primer flag.",
      outputs: "Outputs: Gallons per color plus touch-up buffer.",
      compliance: "Compliance: Occupied-home touch-up allowance.",
    },
  },

  // Lawn & Landscape
  "landscape-mulch": {
    summary: "Bulk mulch volume for beds, rings, and landscape areas.",
    bullets: {
      inputs: "Inputs: Area length, width, depth, waste %.",
      outputs: "Outputs: Cubic yards, 2 cu ft bag count.",
      compliance: "Compliance: 10% settling allowance recommended.",
    },
  },
  "landscape-topsoil": {
    summary: "Topsoil volume and tonnage for grading and lawn prep.",
    bullets: {
      inputs: "Inputs: Area length, width, depth, waste %.",
      outputs: "Outputs: Cubic yards, approximate tons.",
      compliance: "Compliance: Moisture variance note on tonnage.",
    },
  },
  "landscape-sod": {
    summary: "Sod rolls, pallets, and seed alternative for new lawns.",
    bullets: {
      inputs: "Inputs: Area length, width, waste %.",
      outputs: "Outputs: Rolls, pallets, seed lbs alternative.",
      compliance: "Compliance: Cool-season blend rate default.",
    },
  },
  "landscape-gravel": {
    summary: "Gravel and crushed stone in cubic yards and tons.",
    bullets: {
      inputs: "Inputs: Area length, width, depth, waste %.",
      outputs: "Outputs: Cubic yards, tons (at 1.4 tons/cu yd).",
      compliance: "Compliance: Supplier ton-based ordering.",
    },
  },

  // Fences, Driveways & Patios
  "outdoor-fence": {
    summary: "Posts, rails, and pickets for wood fence runs.",
    bullets: {
      inputs: "Inputs: Linear feet, height, post spacing.",
      outputs: "Outputs: Post count, rails, pickets with waste.",
      compliance: "Compliance: NYS 48 in frost line depth.",
    },
  },
  "outdoor-paver-patio": {
    summary: "Paver count, sand bedding, and gravel base for patios.",
    bullets: {
      inputs: "Inputs: Area length, width, base depth, waste %.",
      outputs: "Outputs: Pavers, tons of gravel, tons of sand.",
      compliance: "Compliance: 4 in min base for freeze-thaw.",
    },
  },
  "outdoor-asphalt-driveway": {
    summary: "Hot mix asphalt tonnage for driveways and parking.",
    bullets: {
      inputs: "Inputs: Area length, width, thickness.",
      outputs: "Outputs: Tons of asphalt.",
      compliance: "Compliance: 2–3 in compacted residential standard.",
    },
  },
};

export function getTileCopy(key: string, page?: TradePageDefinition): TileCopy {
  const fallbackSummary = page?.description ?? "Calculator details.";
  const fallback: TileCopy = {
    summary: fallbackSummary,
    bullets: {
      inputs: "Inputs: Primary dimensions and waste settings.",
      outputs: "Outputs: Core calculator results plus waste.",
      compliance: "Compliance: Localized guidance noted inline.",
    },
  };

  const match = TILE_COPY[key];
  if (!match) return fallback;

  return match;
}

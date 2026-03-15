import type { Metadata } from "next";

const SITE_URL = "https://proconstructioncalc.com";
const LOCAL_MARKET_LABEL = "Mohawk Valley, including Rome and Utica, NY";

type RelatedLink = {
  href: string;
  label: string;
};

export type TradePageDefinition = {
  key: string;
  type: "category" | "calculator";
  category:
    | "concrete"
    | "framing"
    | "roofing"
    | "mechanical"
    | "insulation"
    | "finish"
    | "management"
    | "interior"
    | "business";
  title: string;
  description: string;
  heroKicker: string;
  proTip: string;
  localFocus: string;
  canonicalPath: string;
  keywords: string[];
  relatedLinks: RelatedLink[];
};

const categoryLinks: Record<TradePageDefinition["category"], RelatedLink[]> = {
  concrete: [
    { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
    {
      href: "/calculators/concrete/footing",
      label: "Footing Volume Calculator",
    },
    {
      href: "/calculators/concrete/block-wall",
      label: "Block-Wall Calculator",
    },
  ],
  framing: [
    {
      href: "/calculators/framing/wall-studs",
      label: "Wall Studs Calculator",
    },
    {
      href: "/calculators/framing/rafter-length",
      label: "Rafter Length Calculator",
    },
    { href: "/calculators/framing/headers", label: "Header Sizing Estimator" },
    { href: "/calculators/framing/deck-joists", label: "Deck Joists Calculator" },
  ],
  roofing: [
    {
      href: "/calculators/roofing/shingle-bundles",
      label: "Shingle Bundles Calculator",
    },
    {
      href: "/calculators/roofing/pitch-slope",
      label: "Pitch & Slope Calculator",
    },
    {
      href: "/calculators/roofing/siding-squares",
      label: "Siding Squares Calculator",
    },
  ],
  mechanical: [
    {
      href: "/calculators/mechanical/btu-estimator",
      label: "Basic BTU Estimator",
    },
    {
      href: "/calculators/mechanical/ventilation-calc",
      label: "Ventilation Calculator",
    },
    {
      href: "/calculators/mechanical/drywall-sheets",
      label: "Drywall Sheets Calculator",
    },
  ],
  insulation: [
    {
      href: "/calculators/insulation/r-value-tracker",
      label: "R-Value Tracker",
    },
    {
      href: "/calculators/insulation/drywall-sheets",
      label: "Drywall Sheets Calculator",
    },
    { href: "/calculators/insulation/duct-sizing", label: "Duct Sizing Calculator" },
  ],
  finish: [
    { href: "/calculators/finish/trim", label: "Trim & Baseboard Calculator" },
    {
      href: "/calculators/finish/flooring",
      label: "Flooring Waste Calculator",
    },
    { href: "/calculators/finish/stairs", label: "Stair Stringer Calculator" },
  ],
  management: [
    {
      href: "/calculators/management/margin",
      label: "Profit Margin Calculator",
    },
    {
      href: "/calculators/management/labor",
      label: "Labor Overhead Calculator",
    },
    {
      href: "/calculators/management/leads",
      label: "Tax & Lead Cost Estimator",
    },
  ],
  interior: [
    { href: "/calculators/interior/trim-baseboard", label: "Trim & Baseboard Calculator" },
    { href: "/calculators/interior/flooring-waste", label: "Flooring Waste Calculator" },
    { href: "/calculators/interior/stair-stringers", label: "Stair Stringers Calculator" },
    { href: "/calculators/interior/paint-gal", label: "Paint Gallons Calculator" },
  ],
  business: [
    { href: "/calculators/business/profit-margin", label: "Profit Margin Calculator" },
    { href: "/calculators/business/labor-rate", label: "Labor Rate Calculator" },
    { href: "/calculators/business/lead-estimator", label: "Lead Estimator" },
    { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
  ],
};

export const tradePages: Record<string, TradePageDefinition> = {
  concrete: {
    key: "concrete",
    type: "category",
    category: "concrete",
    title: "Concrete & Masonry Calculators",
    description:
      "Field-ready concrete and masonry planning tools for slabs, footings, and block count takeoffs with production-friendly assumptions.",
    heroKicker: "Concrete & Masonry",
    proTip:
      "Always add at least 10% concrete waste when scheduling mixed pours to account for form irregularities and spill loss.",
    localFocus:
      "Configured for crews working in Mohawk Valley freeze/thaw conditions where over-ordering by one short load can save a second cold-weather dispatch.",
    canonicalPath: "/calculators/concrete",
    keywords: [
      "concrete calculator",
      "masonry calculator",
      "Rome NY concrete estimate",
    ],
    relatedLinks: categoryLinks.concrete,
  },
  framing: {
    key: "framing",
    type: "category",
    category: "framing",
    title: "Framing & Lumber Calculators",
    description:
      "Stud, rafter, and header planning tools designed for fast field estimates and repeatable framing takeoffs.",
    heroKicker: "Framing & Lumber",
    proTip:
      "Verify stud counts against actual opening schedules before ordering packages so headers and cripples don’t wipe out your labor margin.",
    localFocus:
      "Built for framing crews in Rome and Utica balancing snow-load framing standards with practical cut-list planning.",
    canonicalPath: "/calculators/framing",
    keywords: ["framing calculator", "stud calculator", "header estimator"],
    relatedLinks: categoryLinks.framing,
  },
  roofing: {
    key: "roofing",
    type: "category",
    category: "roofing",
    title: "Roofing & Siding Calculators",
    description:
      "Roof pitch, shingle, and siding calculators optimized for accurate square counts and weather-ready material orders.",
    heroKicker: "Roofing & Siding",
    proTip:
      "For steep-slope roofs, add an extra bundle per plane to prevent downtime from damaged ridge and valley pieces.",
    localFocus:
      "Calibrated for Upstate New York weather swings so your flashing and roof-edge quantities stay practical in the field.",
    canonicalPath: "/calculators/roofing",
    keywords: [
      "roofing calculator",
      "shingle bundle calculator",
      "siding estimator",
    ],
    relatedLinks: categoryLinks.roofing,
  },
  mechanical: {
    key: "mechanical",
    type: "category",
    category: "mechanical",
    title: "Mechanical & Site Essentials Calculators",
    description:
      "GC-focused site essentials for temporary heat BTU checks, ventilation square-foot planning, and drywall sheet count takeoffs.",
    heroKicker: "Mechanical & Site",
    proTip:
      "Use temporary heat sizing as a site-check baseline, not a full HVAC design—then verify conditions on each enclosed phase.",
    localFocus:
      "Built for Rome/Utica jobsite realities including Oneida County cold-weather envelope checks and practical temporary heat planning.",
    canonicalPath: "/calculators/mechanical",
    keywords: [
      "GC mechanical calculator",
      "btu estimator temporary heat",
      "Oneida County site ventilation",
    ],
    relatedLinks: categoryLinks.mechanical,
  },
  insulation: {
    key: "insulation",
    type: "category",
    category: "insulation",
    title: "HVAC & Insulation Calculators",
    description:
      "R-value and drywall planning tools for insulation takeoffs, envelope quality checks, and interior finish prep.",
    heroKicker: "HVAC & Insulation",
    proTip:
      "Track cavity depth and thermal bridging separately so nominal R-values don’t overstate real-world performance.",
    localFocus:
      "Focused on Mohawk Valley winter performance where envelope misses are expensive and callback rates climb fast.",
    canonicalPath: "/calculators/insulation",
    keywords: [
      "insulation calculator",
      "r-value calculator",
      "drywall estimator",
    ],
    relatedLinks: categoryLinks.insulation,
  },
  finish: {
    key: "finish",
    type: "category",
    category: "finish",
    title: "Finish Carpentry Calculators",
    description:
      "Trim, flooring, and stair layout calculators that support cleaner finish takeoffs and reduced material overrun.",
    heroKicker: "Finish Carpentry",
    proTip:
      "Round trim lengths to full stock pieces before finalizing bids so waste is visible before purchase orders go out.",
    localFocus:
      "Built for local remodel teams around Rome and Utica handling mixed stock lengths and fast-turn punch lists.",
    canonicalPath: "/calculators/finish",
    keywords: [
      "finish carpentry calculator",
      "trim estimator",
      "stair stringer calculator",
    ],
    relatedLinks: categoryLinks.finish,
  },
  management: {
    key: "management",
    type: "category",
    category: "management",
    title: "Construction Management Calculators",
    description:
      "Profit, labor, and lead-cost calculators for estimating cashflow, overhead, and close-rate driven marketing spend.",
    heroKicker: "Management",
    proTip:
      "Set margin targets after labor burden and permit admin time are applied, or your bid profit will look better than reality.",
    localFocus:
      "Tailored for contractor pricing pressure in the Mohawk Valley where lead quality and overhead control decide job profitability.",
    canonicalPath: "/calculators/management",
    keywords: [
      "contractor margin calculator",
      "labor overhead calculator",
      "lead cost estimator",
    ],
    relatedLinks: categoryLinks.management,
  },
  interior: {
    key: "interior",
    type: "category",
    category: "interior",
    title: "Interior Finish Calculators",
    description:
      "Interior trim, flooring, stairs, and paint calculators for cleaner finish takeoffs and tighter material control.",
    heroKicker: "Interior",
    proTip:
      "For interior scopes in older homes, verify room-to-room transitions first so trim and flooring waste is planned before purchase.",
    localFocus:
      "Built for Rome and Utica interior work where mixed room geometry can throw off finish-stage quantities.",
    canonicalPath: "/calculators/interior",
    keywords: [
      "interior calculator",
      "finish takeoff",
      "Utica interior contractor",
    ],
    relatedLinks: categoryLinks.interior,
  },
  business: {
    key: "business",
    type: "category",
    category: "business",
    title: "Business & Estimating Calculators",
    description:
      "Business-focused calculators for margin, labor rates, lead math, and tax-aware estimating decisions.",
    heroKicker: "Business",
    proTip:
      "Review margin and lead acquisition cost together before final pricing, or profitable jobs can still lose cash.",
    localFocus:
      "Designed for Mohawk Valley contractors balancing competitive bids with local operating costs and seasonality.",
    canonicalPath: "/calculators/business",
    keywords: [
      "contractor business calculator",
      "profit labor lead tax",
      "Rome NY estimator",
    ],
    relatedLinks: categoryLinks.business,
  },
  "concrete-slab": {
    key: "concrete-slab",
    type: "calculator",
    category: "concrete",
    title: "Professional Concrete Slab Calculator - 3000 PSI Optimized",
    description:
      "Estimate slab concrete volume, order quantity, and waste allowance for 3000 PSI pours with field-ready assumptions.",
    heroKicker: "Concrete / Slab-on-Grade",
    proTip:
      "Always add 10% for slab waste and uneven grade correction before sending your batch order.",
    localFocus:
      "Useful for Mohawk Valley slab planning where subgrade moisture and temperature shifts can increase waste.",
    canonicalPath: "/calculators/concrete/slab",
    keywords: ["slab calculator", "3000 psi slab", "concrete slab Rome NY"],
    relatedLinks: categoryLinks.concrete,
  },
  "concrete-footing": {
    key: "concrete-footing",
    type: "calculator",
    category: "concrete",
    title: "Concrete Footing Volume Calculator for Foundation Work",
    description:
      "Calculate footing concrete volume and total cubic yards for foundation trenches and continuous perimeter runs.",
    heroKicker: "Concrete / Footings",
    proTip:
      "Measure trench depth at several points and bid off the deepest average zone to avoid short-pour delays.",
    localFocus:
      "Designed for local freeze-line footing jobs across Rome and Utica where depth variance is common.",
    canonicalPath: "/calculators/concrete/footing",
    keywords: [
      "footing volume calculator",
      "foundation concrete",
      "concrete footing estimator",
    ],
    relatedLinks: categoryLinks.concrete,
  },
  "concrete-block": {
    key: "concrete-block",
    type: "calculator",
    category: "concrete",
    title: "Block & Brick Count Calculator for Masonry Layouts",
    description:
      "Estimate block and brick quantities, wall coverage, and practical overage for masonry takeoffs.",
    heroKicker: "Concrete / Block & Brick",
    proTip:
      "Add 5–8% overage for cuts and breakage, especially on patterned brickwork and corner-heavy walls.",
    localFocus:
      "Built for Mohawk Valley masonry crews dealing with mixed restoration and new-build wall sections.",
    canonicalPath: "/calculators/concrete/block",
    keywords: [
      "block calculator",
      "brick count calculator",
      "masonry estimator",
    ],
    relatedLinks: categoryLinks.concrete,
  },
  "framing-wall": {
    key: "framing-wall",
    type: "calculator",
    category: "framing",
    title: "Wall Framing Stud Calculator for Fast Lumber Takeoffs",
    description:
      "Calculate stud counts, plate lengths, and framing quantities for residential and light commercial wall layouts.",
    heroKicker: "Framing / Wall",
    proTip:
      "Verify on-center spacing and opening schedule together; separate checks catch most framing quantity misses.",
    localFocus:
      "Practical for framing jobs in the Rome/Utica market where additions and retrofits change stud spacing assumptions.",
    canonicalPath: "/calculators/framing/wall",
    keywords: ["wall framing calculator", "stud count", "lumber takeoff"],
    relatedLinks: categoryLinks.framing,
  },
  "framing-rafters": {
    key: "framing-rafters",
    type: "calculator",
    category: "framing",
    title: "Rafter Length Calculator for Roof Framing",
    description:
      "Compute rafter run-to-rise geometry and cut lengths for reliable roof framing prep.",
    heroKicker: "Framing / Rafters",
    proTip:
      "Test one complete rafter pair before full production cutting to catch slope and seat-cut errors.",
    localFocus:
      "Created for Mohawk Valley snow-load framing where pitch precision impacts sheathing and ventilation details.",
    canonicalPath: "/calculators/framing/rafters",
    keywords: ["rafter calculator", "roof framing", "rafter length"],
    relatedLinks: categoryLinks.framing,
  },
  "framing-headers": {
    key: "framing-headers",
    type: "calculator",
    category: "framing",
    title: "Header Sizing Estimator for Door and Window Openings",
    description:
      "Plan header dimensions by opening width and framing assumptions for faster rough carpentry estimates.",
    heroKicker: "Framing / Headers",
    proTip:
      "Confirm local span and load rules before final lumber order so field swaps don’t erode schedule.",
    localFocus:
      "Helpful for local crews balancing older-home remodel conditions with current code-driven framing choices.",
    canonicalPath: "/calculators/framing/headers",
    keywords: [
      "header size calculator",
      "opening framing",
      "window door header",
    ],
    relatedLinks: categoryLinks.framing,
  },
  "roofing-shingles": {
    key: "roofing-shingles",
    type: "calculator",
    category: "roofing",
    title: "Shingle Bundle Calculator for Roofing Squares",
    description:
      "Estimate roofing squares, bundle count, and overage for asphalt shingle jobs.",
    heroKicker: "Roofing / Shingles",
    proTip:
      "Add extra bundles for starter and hip/ridge zones before the first delivery to avoid same-day reruns.",
    localFocus:
      "Configured for Rome and Utica roof replacement conditions with storm-season scheduling pressure.",
    canonicalPath: "/calculators/roofing/shingles",
    keywords: ["shingle bundle calculator", "roofing squares", "roof estimate"],
    relatedLinks: categoryLinks.roofing,
  },
  "roofing-pitch": {
    key: "roofing-pitch",
    type: "calculator",
    category: "roofing",
    title: "Roof Pitch Calculator for Slope and Material Planning",
    description:
      "Convert roof rise and run into pitch and slope factors for better roofing and framing estimates.",
    heroKicker: "Roofing / Pitch",
    proTip:
      "Double-check pitch on each roof plane; mixed slopes can skew total material and labor assumptions.",
    localFocus:
      "Built for Upstate roof systems where older structures often include non-uniform slope transitions.",
    canonicalPath: "/calculators/roofing/pitch",
    keywords: ["roof pitch calculator", "slope calculator", "roof rise run"],
    relatedLinks: categoryLinks.roofing,
  },
  "roofing-siding": {
    key: "roofing-siding",
    type: "calculator",
    category: "roofing",
    title: "Siding, Drip Edge & Flashing Estimator",
    description:
      "Estimate siding square footage and roof-edge accessory lengths for complete exterior material planning.",
    heroKicker: "Roofing / Siding",
    proTip:
      "Order accessory metal by perimeter plus contingency so crew flow is not blocked by short trim stock.",
    localFocus:
      "Made for Mohawk Valley exteriors where wind exposure and weatherproofing details are critical.",
    canonicalPath: "/calculators/roofing/siding",
    keywords: [
      "siding calculator",
      "drip edge estimator",
      "flashing calculator",
    ],
    relatedLinks: categoryLinks.roofing,
  },
  "insulation-r-value": {
    key: "insulation-r-value",
    type: "calculator",
    category: "insulation",
    title: "R-Value Tracking Calculator for Envelope Performance",
    description:
      "Track effective R-value by assembly zone for clearer insulation bids and performance planning.",
    heroKicker: "Insulation / R-Value",
    proTip:
      "Use cavity and continuous insulation values separately so thermal bridging risk is visible in your estimate.",
    localFocus:
      "Optimized for cold-weather Mohawk Valley envelope planning where underinsulation drives callbacks.",
    canonicalPath: "/calculators/insulation/r-value",
    keywords: [
      "r-value calculator",
      "insulation performance",
      "thermal envelope",
    ],
    relatedLinks: categoryLinks.insulation,
  },
  "insulation-drywall": {
    key: "insulation-drywall",
    type: "calculator",
    category: "insulation",
    title: "Drywall Sheet & Waste Calculator",
    description:
      "Estimate drywall board count, coverage, and waste factors for interior wall and ceiling scopes.",
    heroKicker: "Insulation / Drywall",
    proTip:
      "Stage board lengths by room group first; mixed lengths reduce waste and speed up install flow.",
    localFocus:
      "Built for interior crews in Rome and Utica managing tight delivery windows and mixed remodel layouts.",
    canonicalPath: "/calculators/insulation/drywall",
    keywords: ["drywall calculator", "sheet count", "drywall waste"],
    relatedLinks: categoryLinks.insulation,
  },
  "finish-trim": {
    key: "finish-trim",
    type: "calculator",
    category: "finish",
    title: "Trim & Baseboard Calculator for Finish Carpentry",
    description:
      "Estimate linear footage and stock-piece requirements for trim and baseboard installation.",
    heroKicker: "Finish / Trim",
    proTip:
      "Group rooms by trim profile and stock length before ordering to minimize mismatched leftover pieces.",
    localFocus:
      "Suited for Mohawk Valley remodeling work where room transitions and legacy walls affect trim cuts.",
    canonicalPath: "/calculators/finish/trim",
    keywords: ["trim calculator", "baseboard estimator", "finish carpentry"],
    relatedLinks: categoryLinks.finish,
  },
  "finish-flooring": {
    key: "finish-flooring",
    type: "calculator",
    category: "finish",
    title: "Flooring Waste Calculator for Material Ordering",
    description:
      "Calculate flooring square footage, order quantity, and waste allowance for tile, LVP, and hardwood installs.",
    heroKicker: "Finish / Flooring",
    proTip:
      "Increase waste percentage for diagonal and herringbone layouts before committing purchase orders.",
    localFocus:
      "Useful for Rome/Utica flooring jobs where older footprints and out-of-square rooms raise cut waste.",
    canonicalPath: "/calculators/finish/flooring",
    keywords: ["flooring calculator", "flooring waste", "material takeoff"],
    relatedLinks: categoryLinks.finish,
  },
  "finish-stairs": {
    key: "finish-stairs",
    type: "calculator",
    category: "finish",
    title: "Stair Stringer Calculator for Rise/Run Layout",
    description:
      "Estimate stair stringer dimensions and count with practical rise/run planning for field execution.",
    heroKicker: "Finish / Stairs",
    proTip:
      "Dry-fit first tread and riser dimensions before cutting all stringers to avoid compounding tolerance errors.",
    localFocus:
      "Tailored for regional renovation sites where existing floor elevations vary more than plan assumptions.",
    canonicalPath: "/calculators/finish/stairs",
    keywords: ["stair stringer calculator", "rise run", "stair layout"],
    relatedLinks: categoryLinks.finish,
  },
  "management-margin": {
    key: "management-margin",
    type: "calculator",
    category: "management",
    title: "Contractor Profit Margin Calculator",
    description:
      "Model gross and net margin against cost inputs so bids reflect true production and overhead realities.",
    heroKicker: "Management / Margin",
    proTip:
      "Set a minimum margin floor per job type and reject scopes that cannot clear it after burdened labor.",
    localFocus:
      "Built for Mohawk Valley bid environments where price sensitivity is high and margin discipline matters.",
    canonicalPath: "/calculators/management/margin",
    keywords: ["profit margin calculator", "contractor pricing", "bid margin"],
    relatedLinks: categoryLinks.management,
  },
  "management-labor": {
    key: "management-labor",
    type: "calculator",
    category: "management",
    title: "Labor Overhead Calculator for Crew Cost Control",
    description:
      "Estimate burdened labor rates with payroll tax and overhead assumptions for cleaner estimate math.",
    heroKicker: "Management / Labor",
    proTip:
      "Review labor burden quarterly; insurance and payroll changes can quietly erase your expected profit.",
    localFocus:
      "Structured for local contractors balancing labor availability and overhead pressure in Rome and Utica.",
    canonicalPath: "/calculators/management/labor",
    keywords: [
      "labor overhead calculator",
      "crew cost estimator",
      "burdened labor",
    ],
    relatedLinks: categoryLinks.management,
  },
  "management-leads": {
    key: "management-leads",
    type: "calculator",
    category: "management",
    title: "Tax & Lead Cost Estimator for Bid Planning",
    description:
      "Project lead acquisition and tax impact so each estimate reflects true close-cost economics.",
    heroKicker: "Management / Leads",
    proTip:
      "Track close-rate by lead source monthly so marketing spend shifts toward the channels that actually convert.",
    localFocus:
      "Designed for Mohawk Valley service contractors where seasonality affects both tax timing and lead quality.",
    canonicalPath: "/calculators/management/leads",
    keywords: [
      "lead cost calculator",
      "contractor tax estimator",
      "marketing roi",
    ],
    relatedLinks: categoryLinks.management,
  },
  "concrete-block-wall": {
    key: "concrete-block-wall",
    type: "calculator",
    category: "concrete",
    title: "Concrete Block-Wall Calculator",
    description:
      "Estimate CMU block-wall unit counts, mortar assumptions, and overage for practical masonry ordering.",
    heroKicker: "Concrete / Block-Wall",
    proTip:
      "3000 PSI is typically recommended for many exterior slabs and driveways—confirm spec and local code before ordering.",
    localFocus:
      "Useful for Mohawk Valley wall builds where weather and renovation conditions can increase unit waste.",
    canonicalPath: "/calculators/concrete/block-wall",
    keywords: ["block wall calculator", "CMU estimator", "masonry wall count"],
    relatedLinks: categoryLinks.concrete,
  },
  "framing-wall-studs": {
    key: "framing-wall-studs",
    type: "calculator",
    category: "framing",
    title: "Wall Studs Calculator",
    description:
      "Calculate wall stud quantities and framing stock assumptions for quick rough framing takeoffs.",
    heroKicker: "Framing / Wall Studs",
    proTip:
      "Adjust counts for all rough openings before ordering so header and cripple material is captured.",
    localFocus:
      "Built for Rome and Utica framing crews dealing with remodel openings and mixed stud spacing.",
    canonicalPath: "/calculators/framing/wall-studs",
    keywords: ["wall studs calculator", "stud spacing", "framing takeoff"],
    relatedLinks: categoryLinks.framing,
  },
  "framing-rafter-length": {
    key: "framing-rafter-length",
    type: "calculator",
    category: "framing",
    title: "Rafter Length Calculator",
    description:
      "Estimate accurate rafter lengths from roof geometry for cleaner framing cuts and reduced waste.",
    heroKicker: "Framing / Rafter Length",
    proTip:
      "Test one complete rafter pair before full production cutting to catch slope and seat-cut errors.",
    localFocus:
      "Useful for Upstate framing conditions where snow-load roof details require tighter pitch planning.",
    canonicalPath: "/calculators/framing/rafter-length",
    keywords: ["rafter length calculator", "roof framing math", "cut list"],
    relatedLinks: categoryLinks.framing,
  },
  "framing-deck-joists": {
    key: "framing-deck-joists",
    type: "calculator",
    category: "framing",
    title: "Deck Joists Calculator",
    description:
      "Plan joist counts and spacing assumptions for deck framing material takeoffs.",
    heroKicker: "Framing / Deck Joists",
    proTip:
      "Confirm joist spacing against decking material specs before locking order quantities.",
    localFocus:
      "Tailored for Mohawk Valley deck projects where seasonal moisture and structure age affect framing choices.",
    canonicalPath: "/calculators/framing/deck-joists",
    keywords: ["deck joist calculator", "deck framing", "joist spacing"],
    relatedLinks: categoryLinks.framing,
  },
  "roofing-shingle-bundles": {
    key: "roofing-shingle-bundles",
    type: "calculator",
    category: "roofing",
    title: "Shingle Bundles Calculator",
    description:
      "Estimate roofing shingle bundles from roof area and waste assumptions for faster ordering.",
    heroKicker: "Roofing / Shingle Bundles",
    proTip:
      "Include starter, hip, and ridge accessory waste before final bundle counts are sent.",
    localFocus:
      "Designed for Rome and Utica reroof jobs where weather windows are tight and return trips are costly.",
    canonicalPath: "/calculators/roofing/shingle-bundles",
    keywords: ["shingle bundles calculator", "roof bundles", "asphalt roof estimate"],
    relatedLinks: categoryLinks.roofing,
  },
  "roofing-pitch-slope": {
    key: "roofing-pitch-slope",
    type: "calculator",
    category: "roofing",
    title: "Pitch & Slope Calculator",
    description:
      "Convert rise and run into roof pitch and slope values for better material and labor projections.",
    heroKicker: "Roofing / Pitch & Slope",
    proTip:
      "Measure each roof plane independently—mixed pitches can materially change labor and waste planning.",
    localFocus:
      "Helpful for Upstate roof replacements where additions often create multiple slope transitions.",
    canonicalPath: "/calculators/roofing/pitch-slope",
    keywords: ["pitch slope calculator", "roof rise run", "roof slope"],
    relatedLinks: categoryLinks.roofing,
  },
  "roofing-siding-squares": {
    key: "roofing-siding-squares",
    type: "calculator",
    category: "roofing",
    title: "Siding Squares Calculator",
    description:
      "Estimate siding squares and accessory quantities for complete exterior scopes.",
    heroKicker: "Roofing / Siding Squares",
    proTip:
      "Add overage for gables and cut-heavy elevations to prevent siding shortfalls late in install.",
    localFocus:
      "Built for Mohawk Valley exteriors where weatherproofing details and layout waste are high impact.",
    canonicalPath: "/calculators/roofing/siding-squares",
    keywords: ["siding squares calculator", "siding estimate", "exterior takeoff"],
    relatedLinks: categoryLinks.roofing,
  },
  "insulation-r-value-tracker": {
    key: "insulation-r-value-tracker",
    type: "calculator",
    category: "insulation",
    title: "R-Value Tracker",
    description:
      "Track effective insulation values across assemblies for better HVAC and envelope estimates.",
    heroKicker: "HVAC / R-Value Tracker",
    proTip:
      "Account for NY frost lines and thermal bridging when calculating final assembly performance.",
    localFocus:
      "Optimized for Mohawk Valley winter envelope planning where missed R-value targets cause callbacks.",
    canonicalPath: "/calculators/insulation/r-value-tracker",
    keywords: ["r-value tracker", "insulation calculator", "NY frost line insulation"],
    relatedLinks: categoryLinks.insulation,
  },
  "insulation-drywall-sheets": {
    key: "insulation-drywall-sheets",
    type: "calculator",
    category: "insulation",
    title: "Drywall Sheets Calculator",
    description:
      "Estimate drywall sheet counts and waste factors for walls and ceilings.",
    heroKicker: "HVAC / Drywall Sheets",
    proTip:
      "Stage board lengths by room group first to reduce cuts and handling waste on install day.",
    localFocus:
      "Designed for Rome and Utica interior crews navigating mixed room sizes and renovation geometry.",
    canonicalPath: "/calculators/insulation/drywall-sheets",
    keywords: ["drywall sheets calculator", "drywall waste", "sheet count"],
    relatedLinks: categoryLinks.insulation,
  },
  "insulation-duct-sizing": {
    key: "insulation-duct-sizing",
    type: "calculator",
    category: "insulation",
    title: "Duct Sizing Calculator",
    description:
      "Estimate practical duct sizing targets for airflow planning and HVAC scoping.",
    heroKicker: "HVAC / Duct Sizing",
    proTip:
      "Validate airflow assumptions room-by-room before final fabrication quantities are approved.",
    localFocus:
      "Built for Mohawk Valley HVAC installs where retrofits often force non-standard routing.",
    canonicalPath: "/calculators/insulation/duct-sizing",
    keywords: ["duct sizing calculator", "hvac airflow", "ductwork estimate"],
    relatedLinks: categoryLinks.insulation,
  },
  "interior-trim-baseboard": {
    key: "interior-trim-baseboard",
    type: "calculator",
    category: "interior",
    title: "Trim & Baseboard Calculator",
    description:
      "Estimate trim and baseboard linear footage with cleaner stock-length planning.",
    heroKicker: "Interior / Trim & Baseboard",
    proTip:
      "Order by stock lengths after room grouping so offcuts are minimized across the full project.",
    localFocus:
      "Useful for local interior crews handling older homes with uneven corners and transitions.",
    canonicalPath: "/calculators/interior/trim-baseboard",
    keywords: ["trim baseboard calculator", "interior trim takeoff", "finish carpentry"],
    relatedLinks: categoryLinks.interior,
  },
  "interior-flooring-waste": {
    key: "interior-flooring-waste",
    type: "calculator",
    category: "interior",
    title: "Flooring Waste Calculator",
    description:
      "Calculate flooring waste allowances for tile, LVP, and hardwood installations.",
    heroKicker: "Interior / Flooring Waste",
    proTip:
      "Bump waste percentage for diagonal or pattern layouts before purchase orders are finalized.",
    localFocus:
      "Built for Rome/Utica flooring projects where non-square rooms can increase cut waste.",
    canonicalPath: "/calculators/interior/flooring-waste",
    keywords: ["flooring waste calculator", "flooring takeoff", "tile waste"],
    relatedLinks: categoryLinks.interior,
  },
  "interior-stair-stringers": {
    key: "interior-stair-stringers",
    type: "calculator",
    category: "interior",
    title: "Stair Stringers Calculator",
    description:
      "Estimate stair stringer rise/run geometry for framing and finish stair work.",
    heroKicker: "Interior / Stair Stringers",
    proTip:
      "Cut a single test stringer first to confirm tread/riser fit before batching all cuts.",
    localFocus:
      "Designed for renovation work where floor height variance often impacts final stair layout.",
    canonicalPath: "/calculators/interior/stair-stringers",
    keywords: ["stair stringers calculator", "rise run stairs", "stair layout"],
    relatedLinks: categoryLinks.interior,
  },
  "interior-paint-gal": {
    key: "interior-paint-gal",
    type: "calculator",
    category: "interior",
    title: "Paint Gallon Calculator",
    description:
      "Estimate paint gallons by area, coats, and coverage assumptions for cleaner material buys.",
    heroKicker: "Interior / Paint Gallons",
    proTip:
      "Add extra gallon allowance for color transitions and touch-up pass work on occupied homes.",
    localFocus:
      "Built for interior repaint scopes around Utica and Rome where finish quality drives callbacks.",
    canonicalPath: "/calculators/interior/paint-gal",
    keywords: ["paint gallon calculator", "paint estimate", "coats coverage"],
    relatedLinks: categoryLinks.interior,
  },
  "business-profit-margin": {
    key: "business-profit-margin",
    type: "calculator",
    category: "business",
    title: "Profit Margin Calculator",
    description:
      "Model target profit margin from cost and price assumptions for stronger bid decisions.",
    heroKicker: "Business / Profit Margin",
    proTip:
      "Set a minimum acceptable margin per trade so discounting never undercuts production reality.",
    localFocus:
      "Useful for Mohawk Valley bids where pricing pressure is high and margin discipline is critical.",
    canonicalPath: "/calculators/business/profit-margin",
    keywords: ["profit margin calculator", "contractor margin", "bid profitability"],
    relatedLinks: categoryLinks.business,
  },
  "business-labor-rate": {
    key: "business-labor-rate",
    type: "calculator",
    category: "business",
    title: "Labor Rate Calculator",
    description:
      "Estimate burdened labor rates to capture true crew cost in your estimate math.",
    heroKicker: "Business / Labor Rate",
    proTip:
      "Recalculate labor burden quarterly to reflect payroll tax and insurance changes.",
    localFocus:
      "Built for Rome/Utica contractors balancing labor availability against overhead pressure.",
    canonicalPath: "/calculators/business/labor-rate",
    keywords: ["labor rate calculator", "burdened labor", "crew cost"],
    relatedLinks: categoryLinks.business,
  },
  "business-lead-estimator": {
    key: "business-lead-estimator",
    type: "calculator",
    category: "business",
    title: "Lead Estimator",
    description:
      "Estimate lead cost and close-rate economics to improve marketing ROI decisions.",
    heroKicker: "Business / Lead Estimator",
    proTip:
      "Track source-level close rates so paid lead spend follows conversion, not just volume.",
    localFocus:
      "Designed for Mohawk Valley contractors where seasonal demand changes lead quality.",
    canonicalPath: "/calculators/business/lead-estimator",
    keywords: ["lead estimator", "contractor lead cost", "marketing roi contractor"],
    relatedLinks: categoryLinks.business,
  },
  "business-tax-save": {
    key: "business-tax-save",
    type: "calculator",
    category: "business",
    title: "Tax Save Calculator",
    description:
      "Project tax-impact scenarios during estimating to protect net margin and cash planning.",
    heroKicker: "Business / Tax Save",
    proTip:
      "Model tax impact before final quote approval so projected net aligns with actual cash outcomes.",
    localFocus:
      "Built for local contractor operations in the Rome/Utica area with seasonal revenue shifts.",
    canonicalPath: "/calculators/business/tax-save",
    keywords: ["tax save calculator", "contractor tax estimator", "net margin planning"],
    relatedLinks: categoryLinks.business,
  },
  "mechanical-btu-estimator": {
    key: "mechanical-btu-estimator",
    type: "calculator",
    category: "mechanical",
    title: "Basic BTU Estimator for Temporary Site Heat",
    description:
      "Quick BTU site-check calculator for temporary heating/cooling unit planning on active construction projects.",
    heroKicker: "Mechanical / BTU Estimator",
    proTip:
      "For Upstate NY cold snaps, round temporary heat capacity up after envelope status is reviewed to avoid overnight temperature drops.",
    localFocus:
      "Tailored for Mohawk Valley GC site planning where enclosed-phase heat checks are needed before finish work.",
    canonicalPath: "/calculators/mechanical/btu-estimator",
    keywords: [
      "btu estimator",
      "temporary site heat calculator",
      "GC heating check",
    ],
    relatedLinks: categoryLinks.mechanical,
  },
  "mechanical-ventilation-calc": {
    key: "mechanical-ventilation-calc",
    type: "calculator",
    category: "mechanical",
    title: "Ventilation Calculator (Square-Foot Site Check)",
    description:
      "Estimate baseline ventilation requirements from square footage for practical jobsite planning.",
    heroKicker: "Mechanical / Ventilation",
    proTip:
      "Use ventilation results as a field planning baseline, then verify final airflow requirements with applicable code references.",
    localFocus:
      "Built for Rome and Utica general contractors coordinating enclosed work and temporary occupancy transitions.",
    canonicalPath: "/calculators/mechanical/ventilation-calc",
    keywords: [
      "ventilation calculator",
      "square foot venting",
      "construction site ventilation",
    ],
    relatedLinks: categoryLinks.mechanical,
  },
  "mechanical-drywall-sheets": {
    key: "mechanical-drywall-sheets",
    type: "calculator",
    category: "mechanical",
    title: "Drywall Sheets Calculator",
    description:
      "Calculate drywall sheet count and waste for practical room-by-room GC estimating.",
    heroKicker: "Mechanical / Drywall Sheets",
    proTip:
      "Account for basic Oneida County insulation stage requirements before drywall scheduling to reduce rework risk.",
    localFocus:
      "Made for Mohawk Valley interior sequencing where framing, insulation, and board delivery windows overlap.",
    canonicalPath: "/calculators/mechanical/drywall-sheets",
    keywords: [
      "drywall sheets calculator",
      "gc drywall takeoff",
      "site board count",
    ],
    relatedLinks: categoryLinks.mechanical,
  },
};

export type TradePageKey = keyof typeof tradePages;

export function getTradePage(key: TradePageKey): TradePageDefinition {
  return tradePages[key];
}

export function getTradePageMetadata(page: TradePageDefinition): Metadata {
  const canonicalUrl = `${SITE_URL}${page.canonicalPath}`;
  const localDescription = `${page.description} Serving Oneida County, NY and the Mohawk Valley contractor market.`;
  const mergedKeywords = Array.from(
    new Set([
      ...page.keywords,
      "Oneida County NY",
      "Mohawk Valley",
      "Rome NY contractor calculator",
      "Utica NY contractor estimator",
    ]),
  );

  return {
    title: `${page.title} | Pro Construction Calc`,
    description: localDescription,
    keywords: mergedKeywords,
    alternates: { canonical: canonicalUrl },
    other: {
      "geo.region": "US-NY",
      "geo.placename": "Oneida County, NY",
    },
    openGraph: {
      title: page.title,
      description: localDescription,
      url: canonicalUrl,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
  };
}

export function getTradePageSchema(page: TradePageDefinition) {
  const url = `${SITE_URL}${page.canonicalPath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url,
        isPartOf: {
          "@type": "WebSite",
          name: "Pro Construction Calc",
          url: SITE_URL,
        },
      },
      {
        "@type": "Service",
        name: `${page.title} Planning Service`,
        description: `${page.description} Field standards tuned for ${LOCAL_MARKET_LABEL}.`,
        areaServed: {
          "@type": "Place",
          name: LOCAL_MARKET_LABEL,
        },
        provider: {
          "@type": "Organization",
          name: "Pro Construction Calc",
          url: SITE_URL,
        },
      },
    ],
  };
}


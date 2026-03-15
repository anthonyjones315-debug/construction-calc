/**
 * Native Field Notes articles — regional authority content.
 * No external Blogspot dependency; all content stays on-site.
 */

export type FieldNoteToolLink = {
  href: string;
  label: string;
};

export interface FieldNote {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  /** Calculator/tool links for "Use This Tool" sidebar */
  relatedToolLinks: FieldNoteToolLink[];
  content: string;
}

export const FIELD_NOTES: FieldNote[] = [
  {
    slug: "oneida-county-freeze-lines",
    title: "Oneida County Freeze-Lines: Rome vs. Utica Requirements",
    description:
      "Frost depth requirements for footings and slabs in Rome, Utica, and surrounding Oneida County — and why they’re not always the same.",
    category: "Concrete & Foundations",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/concrete", label: "Concrete & Masonry Calculators" },
      { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
    ],
    content: `
## Why Frost Depth Varies in Oneida County

Oneida County spans a mix of microclimates and soil types. **Rome** and **Utica** often get different frost-depth guidance from local inspectors and engineers, even though both are in the same county. Basing your footing depth on a single “county” number can lead to failed inspections or frost heave.

## Rome vs. Utica: What to Plan For

| Location | Typical frost depth (design) | Notes |
|----------|-----------------------------|--------|
| Rome, NY | 42"–48" | Often specified 48" for new construction; confirm with Rome Building Department. |
| Utica, NY | 42"–48" | Similar range; some zones allow 42" with approved insulation or site-specific soils report. |
| Outlying towns | 42"–52" | Higher elevations and open farmland can push design depth to 48"–52". |

**Rule of thumb:** Plan for **48 inches** minimum below finished grade for footings in Oneida County unless you have a signed soils report or variance. For slabs-on-grade, subgrade prep and perimeter insulation matter as much as depth.

## Code and Inspection

New York State Building Code adopts ICC with state amendments. Local jurisdictions can be more conservative. Always confirm with:

- **City of Rome Building Department** — for work inside Rome city limits.
- **City of Utica** — for Utica permits.
- **Oneida County** — for unincorporated areas and some towns.

Getting the depth wrong means rework, delayed inspections, and unhappy clients. When in doubt, dig deeper and pour once.

## Use the Calculators

Our concrete calculators assume standard waste and thickness. For freeze-line work, set your footing depth to your **design frost depth** (e.g., 48") and use the footing volume calculator so your ready-mix order matches the trench.
    `,
  },
  {
    slug: "nys-retainage-laws",
    title: "NYS Retainage Laws: Payment Protections for Local GCs",
    description:
      "A concise summary of New York retainage rules and what Mohawk Valley contractors should know before signing the next contract.",
    category: "Business & Legal",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/business", label: "Business & Estimating Calculators" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin Calculator" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate Calculator" },
    ],
    content: `
## What Is Retainage?

**Retainage** is the share of progress payments that an owner or general contractor holds back until the job is substantially complete (and sometimes until after final punch and warranty). In New York, public and private jobs are treated differently.

## New York Retainage at a Glance

- **Public work (state, municipal, school, etc.):** New York General Municipal Law and State Finance Law cap retainage and set timing for release. Typical caps are **5%** of the contract; release is tied to substantial completion and often to receipt of final waivers and closeout documents.
- **Private work:** No statewide cap. Retainage is whatever the contract says — 5%, 10%, or more. That’s why **reading the contract** and negotiating retainage before you sign is critical for GCs and subs in the Mohawk Valley.

## Protections That Matter for Local GCs

1. **Lien rights** — In New York, filing a mechanic’s lien can protect you when payments are late or retainage is held too long. Deadlines and notice rules are strict; missing them can cost you leverage.
2. **Prompt payment** — On public jobs, statutes and contracts often require payment within a set number of days after an approved invoice. Late payment can trigger interest or penalties if the contract allows.
3. **Release of retainage** — Know when retainage is due: at substantial completion, at final completion, or after a warranty period. Get it in writing so you can plan cash flow.

## Practical Takeaway

Before you sign, know: (1) how much is retained, (2) when it’s released, and (3) what paperwork (waivers, as-builts, O&M) is required. Use your margin and labor calculators to model cash flow *including* retainage so you’re not financing the job out of pocket.
    `,
  },
  {
    slug: "insulation-r-values",
    title: "Spray Foam vs. Fiber: Insulation R-Values for Mohawk Valley Winters",
    description:
      "Spray foam vs. fiber: R-value targets and assembly specs for attics, walls, and rim joists in the Mohawk Valley — winter performance and cost tradeoffs.",
    category: "Insulation",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/insulation", label: "HVAC & Insulation Calculators" },
      { href: "/calculators/insulation/r-value-tracker", label: "R-Value Tracker" },
      { href: "/calculators/insulation/drywall-sheets", label: "Drywall Sheets Calculator" },
    ],
    content: `
## Spray Foam vs. Fiber: The Short Version

- **Spray foam** gives you **R-value plus an air barrier** in one step. Closed-cell adds rigidity and moisture resistance; open-cell is cheaper and still seals well. In cold Upstate winters, that seal often matters more than a few extra R-points from fiber.
- **Fiber** (batts or blown cellulose/fiberglass) is **cheaper per R** but does not air-seal. Gaps, rim joists, and penetrations stay leaky unless you add a separate air barrier and careful installation.

For **Mohawk Valley retrofits** — older homes, mixed assemblies, and cold winters — the math often favors spray foam in rim joists, crawlspaces, and hard-to-detail zones, and fiber (blown or batt) in straightforward attics where you can get depth and coverage.

## R-Value and Depth

| Assembly | Typical fiber target (Zone 5/6) | Spray foam equivalent (approx.) |
|----------|----------------------------------|----------------------------------|
| Attic | R-49–R-60 (blown or batt) | Open-cell 6"–8" (R-21–R-28) or closed-cell 4"–5" (R-26–R-32) — often combined with fiber on top. |
| Walls (retrofit) | R-13–R-21 in cavity | Closed-cell 2"–3" (R-13–R-20) or dense-pack cellulose. |
| Rim joist | R-19 batt (often poorly installed) | Closed-cell 2"–3" (R-13–R-20) — much better air seal. |

Fiber is usually **lower cost per square foot** at high R-values in open attics. Spray foam wins where **air sealing and limited depth** matter: rim joists, band joists, and irregular cavities.

## Cost Rule of Thumb (Mohawk Valley)

- **Blown cellulose (attic):** roughly **$1.00–$2.00/sq ft** installed, depending on depth and access.
- **Fiberglass batt:** **$0.75–$1.25/sq ft** for walls/attic.
- **Closed-cell spray foam:** **$1.50–$3.00/board foot** (depth-dependent).
- **Open-cell spray foam:** **$0.75–$1.50/board foot.**

Use our **R-Value Tracker** to target assembly R-values and the **drywall/insulation** calculators to size materials so your bids reflect real thickness and coverage.
    `,
  },
  {
    slug: "all-electric-2026",
    title: "All-Electric 2026: What Mohawk Valley Contractors Need to Know",
    description:
      "New York's push toward all-electric buildings affects Rome, Utica, and Oneida County. Heat pumps, panel sizing, and what to spec in the Mohawk Valley in 2026.",
    category: "Energy",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/mechanical/btu-estimator", label: "BTU Estimator" },
      { href: "/calculators/mechanical", label: "Mechanical Calculators" },
    ],
    content: `
## Why All-Electric Matters in Oneida County

New York State's climate and energy goals are pushing new construction and major renovations toward **all-electric** or electric-ready design. For contractors and builders in **Rome, NY**, **Utica, NY**, and **Oneida County**, that means more heat-pump specs, larger electrical panels, and different sizing rules than the gas-fired norm.

Staying ahead of code and client expectations in the **Mohawk Valley** means understanding what "all-electric 2026" actually requires and how to estimate and bid it.

## Heat Pumps and Load in the Mohawk Valley

Cold-climate heat pumps are the default for new all-electric homes. In **Oneida County** and the broader **Mohawk Valley**, heating loads drive the equipment size more than cooling. Proper sizing avoids overspend and undersized equipment that struggles in deep winter.

- **Manual J (or equivalent)** remains the right way to size. Don't rely on rule-of-thumb "per square foot" for heat pumps.
- **Design temperature** for the region is typically in the single digits (e.g., 5°F to 10°F). Equipment must be rated for that.
- **Electrical service:** All-electric homes often need **200 A** panels; larger homes or all-electric with EV charging may need more. Plan for panel and service upgrades in bids.

## What to Spec for 2026

- **Ducted or ductless heat pumps** sized to a proper load calc.
- **Electric resistance backup** or dual-fuel only where explicitly allowed or grandfathered.
- **Water heating:** Heat-pump water heaters are the preferred all-electric option; size for occupancy and recovery.
- **Cooking and drying:** Electric ranges and heat-pump dryers are standard in all-electric specs.

For **Rome** and **Utica** permits, confirm with the local building department whether all-electric or electric-ready is required for your project type and whether any exemptions apply.

## Use the Calculators

Size heating loads and equipment with our **BTU Estimator** so your bids reflect realistic capacities for **Mohawk Valley** winters. Run the numbers before you spec — stay on-site, no external links.

**[Use the BTU Estimator](/calculators/mechanical/btu-estimator)** — Free, instant heating-load guidance for Oneida County and the Mohawk Valley.
    `,
  },
  {
    slug: "frost-heave",
    title: "Frost Heave in Oneida County: How Deep to Dig in Rome and Utica",
    description:
      "Why frost heave happens, how Oneida County and Mohawk Valley soils react, and footing depth best practices for Rome, NY and Utica, NY.",
    category: "Concrete & Foundations",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
      { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
      { href: "/calculators/concrete", label: "Concrete Calculators" },
    ],
    content: `
## What Is Frost Heave?

**Frost heave** occurs when water in the soil freezes and expands, lifting footings, slabs, and pavements. In **Oneida County** and the **Mohawk Valley**, winter freeze-thaw cycles make it a real risk for shallow foundations. The fix is to place footings **below the frost line** so they sit in soil that doesn't freeze in a typical winter.

## Rome, Utica, and Oneida County Depths

Design frost depth in our region is typically **42" to 48"** below grade. Some **Rome** and **Utica** projects specify **48"** minimum; outlying towns and higher elevations in **Oneida County** can push that to **48"–52"**. Never assume a single number — confirm with the local building department or a site-specific soils report.

| Area | Typical design frost depth | Notes |
|------|----------------------------|--------|
| Rome, NY | 42"–48" | Often 48" for new construction; confirm with Rome Building Department. |
| Utica, NY | 42"–48" | Similar; some zones allow 42" with insulation or soils report. |
| Mohawk Valley towns | 42"–52" | Elevation and open ground can require deeper footings. |

## Soils and Drainage

Silty and clay soils in the **Mohawk Valley** hold water and are more prone to frost heave than well-drained gravel. Good drainage and subgrade prep reduce water under footings; they don't replace the need for adequate depth. For slabs-on-grade, perimeter insulation and a solid base are part of the system.

## Use the Calculators

Set your **footing depth** to your design frost depth (e.g., 48") and use our **Footing Volume Calculator** so your ready-mix order matches the trench. No guesswork — stay on-site.

**[Footing Volume Calculator](/calculators/concrete/footing)** — Size footings for Oneida County frost depth. Rome, Utica, and the Mohawk Valley.
    `,
  },
  {
    slug: "snow-loads",
    title: "Snow Loads in the Mohawk Valley: Roof Design for Rome and Utica",
    description:
      "Ground and roof snow loads for Oneida County, Rome, NY, and Utica, NY. How to check design loads and size framing in the Mohawk Valley.",
    category: "Roofing",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/roofing/shingles", label: "Shingles Calculator" },
      { href: "/calculators/roofing/pitch-slope", label: "Pitch & Slope Calculator" },
      { href: "/calculators/roofing", label: "Roofing Calculators" },
    ],
    content: `
## Why Snow Loads Matter in Oneida County

Heavy lake-effect and nor'easter snow is normal in the **Mohawk Valley**. **Rome, NY** and **Utica, NY** see significant accumulation most winters. Roof and rafter design must account for **ground snow load** and **roof snow load** so structures don't fail under weight or drift. Building departments in **Oneida County** will expect design values from ASCE 7 or the current New York State code.

## Typical Design Values (Check Your Jurisdiction)

- **Ground snow load** in the **Mohawk Valley** is often in the **40–50 psf** range; some elevated or exposed sites are higher. Always confirm with the authority having jurisdiction (Rome, Utica, or county).
- **Roof snow load** depends on pitch, exposure, and whether the roof is warm or cold. Lower slopes and sheltered sites can retain more snow; steeper slopes shed it. Engineers use these to set rafter and truss specs.

Don't guess — get the number from your local building department or a stamped design.

## Rafters, Trusses, and Shingles

Once you have the design load, size rafters and trusses accordingly. Shingle quantity is driven by **area and pitch**, not snow load; use our roofing calculators for squares and bundles. For pitch and slope conversions, the **Pitch & Slope** tool keeps you on the same page as your supplier and crew.

## Use the Calculators

Run **roof area**, **pitch**, and **shingle squares** with our tools so estimates match the job. Stay on-site — no external links.

**[Shingles Calculator](/calculators/roofing/shingles)** — Squares and bundles for Mohawk Valley roofs. Oneida County, Rome, and Utica.
    `,
  },
  {
    slug: "permit-timelines",
    title: "Permit Timelines in Oneida County: Rome, Utica, and the Mohawk Valley",
    description:
      "How long permits take in Rome, NY, Utica, NY, and Oneida County. What to submit and how to plan your schedule in the Mohawk Valley.",
    category: "Business & Legal",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/business/lead-estimator", label: "Lead Estimator" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate Calculator" },
      { href: "/calculators/business", label: "Business Calculators" },
    ],
    content: `
## Why Permit Timing Matters in the Mohawk Valley

Delays at the building department can push start dates, tie up labor, and blow project timelines. In **Oneida County**, **Rome**, and **Utica**, permit turnaround varies by project type, season, and workload. Building in buffer time and knowing what each jurisdiction expects keeps bids realistic and clients informed.

## Rome, Utica, and Oneida County: What to Expect

- **City of Rome Building Department** — Residential and small commercial permits often process in **2–6 weeks**; plan for longer for larger or more complex jobs. Incomplete applications add time.
- **City of Utica** — Similar windows; **2–6 weeks** for straightforward residential work. Commercial and multi-family can take longer.
- **Oneida County / towns** — Unincorporated areas and towns may use county or town reviewers. Turnaround can range from **2 weeks** to **8+ weeks** depending on scope and staffing.

These are typical ranges, not guarantees. Always confirm current timelines with the office when you bid.

## How to Keep Things Moving

- **Complete applications** — Missing site plans, specs, or fees cause back-and-forth and delay.
- **Pre-submit questions** — A quick call or email to Rome, Utica, or the county can clarify requirements before you submit.
- **Schedule around permits** — Don't promise a start date before you have permit in hand. Use your **Labor Rate** and **Lead Estimator** tools to model timelines and crew cost so you're not paying for idle time.

## Use the Calculators

Model job duration and labor cost with our **Lead Estimator** and **Labor Rate Calculator**. Plan for permit lead time so your Mohawk Valley schedules stay realistic.

**[Lead Estimator](/calculators/business/lead-estimator)** — Plan timelines and pipeline for Oneida County, Rome, and Utica jobs.
    `,
  },
];

export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  return FIELD_NOTES.find((n) => n.slug === slug);
}

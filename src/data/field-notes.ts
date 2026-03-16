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
    slug: "2026-ny-construction-updates",
    title: "2026 NY Construction Updates: All-Electric Mandate, Marcy UDC, and Tax Compliance",
    description:
      "What Mohawk Valley contractors need for 2026: NYS all-electric mandate status (on hold), Town of Marcy UDC checkpoints, and sales-tax rules for capital improvements.",
    category: "Code & Compliance",
    date: "April 2026",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
      { href: "/calculators/business/lead-estimator", label: "Lead Estimator" },
    ],
    content: `
## 1) All-Electric New Building Mandate — Status: On Hold

- **Scope:** The NYS all-electric new-building mandate was slated to start **January 1, 2026** for most new residential buildings under seven stories (with larger buildings and special occupancies in 2027/2028). As of 2026, that mandate is **on hold**. Check current NYS and local code for the latest effective dates.
- **Plan impacts:** When the mandate or local requirements apply, budget for electric service upgrades, panel space for heat pumps, and electric water/space heating. Model load early to avoid redesign.
- **Bid checklist:**
  - Where all-electric or electric-ready is required or preferred, include heat pump (ASHP/GSHP) line items and electrical rough-ins.
  - Coordinate service size and meter stacks with the utility during precon.
  - Flag any exemptions (critical infrastructure, some commercial process loads) in your proposal.

## 2) Town of Marcy Unified Development Code (UDC)

- **What to check:** Zoning district use tables, site plan triggers, parking, lighting, and stormwater chapters in the Marcy UDC.
- **Pre-bid actions:**
  - Confirm your parcel's zoning and allowed use.
  - Note any site plan review or special permit requirements before you price schedule and fees.
  - Align exterior materials, lighting cutoff, and buffering with UDC standards to avoid redesign.

## 3) Sales Tax Compliance — Capital Improvements vs Repairs

- **Capital Improvements:** Use NYS **Form ST-124** signed by the owner; you do **not** charge sales tax on labor when the form is on file. Materials may still be taxable at purchase—plan margin accordingly.
- **Repairs/Maintenance:** Charge sales tax at the local rate (e.g., **Oneida County 8.75%**). Break out state/local portions in estimates.
- **Estimator workflow:** Run the **Tax Save** calculator with the Capital Improvement toggle; keep ST-124 in your job file for audit trails.

## Quick Actions for 2026 Bids

- Where all-electric or electric-ready is required or clients request it, add an **all-electric allowance** (panels, circuits, heat pumps) to new-build proposals.
- For Marcy jobs, attach a UDC compliance note to your scope and list any required approvals.
- Collect **ST-124** for qualifying projects; for repairs, show the applied **8.75% Oneida** rate line-item.
    `,
  },
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
    slug: "herkimer-county-sales-tax-2026",
    title: "Herkimer County Sales Tax (8.25%) & Capital Improvement Rules",
    description:
      "Herkimer County, NY contractors: applying the 8.25% combined sales tax, when to use ST-124, and how to keep bids compliant in 2026.",
    category: "Business & Legal",
    date: "May 2026",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## Herkimer County Combined Rate — 8.25%
- **Rate split:** State 4.0% + Local 4.25% = **8.25%** combined.
- **Applies to:** Repairs, maintenance, and taxable services. Show the rate on customer-facing estimates.
- **Materials:** Typically taxable at purchase; factor local portion into your markup.

## Capital Improvements (ST-124)
- Collect **NYS Form ST-124** from the owner for qualifying capital improvements; do **not** charge sales tax on labor when the form is on file.
- Keep the signed ST-124 with your estimate and invoice package for audit protection.

## Estimating Workflow
- Use the **Tax Save** calculator → select **Herkimer County** to auto-fill 8.25%.
- Toggle **Capital Improvement (ST-124)** when the job scope qualifies; the calculator zeroes out tax on labor and notes ST-124 in the material list/PDF.
- Keep margins intact by separating materials, labor, overhead, and profit lines.

## Quick Local Notes
- Town/village permits can add lead times—pad schedules accordingly.
- For mixed-scope jobs (repair + improvement), split line items and apply tax only where required.
    `,
  },
  {
    slug: "madison-county-sales-tax-2026",
    title: "Madison County Sales Tax (8.00%) & Capital Improvement Rules",
    description:
      "Madison County, NY contractors: using the 8.00% sales tax rate, handling ST-124 capital improvements, and keeping 2026 bids compliant.",
    category: "Business & Legal",
    date: "May 2026",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## Madison County Combined Rate — 8.00%
- **Rate split:** State 4.0% + Local 4.0% = **8.00%** combined.
- **Repairs/Maintenance:** Charge the full 8.00% on taxable services; show the rate on your estimate.
- **Materials:** Generally taxed at purchase—price accordingly.

## Capital Improvements (ST-124)
- For qualifying capital improvements, collect **Form ST-124**; labor is not taxed when the form is retained.
- Attach ST-124 note in your estimate/PDF to document the exemption.

## Estimating Workflow
- In **Tax Save**, pick **Madison County** to auto-fill 8.00%.
- Use the **Capital Improvement** toggle to zero labor tax and capture the ST-124 reminder in the material list.
- Protect margin: keep overhead recovery and profit targets separate from tax math.

## Local Considerations
- Check utility coordination early for all-electric 2026 code shifts.
- Split bids if combining taxable repair tasks with exempt capital improvements to stay clean on invoicing.
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
    slug: "ai-estimating-playbook",
    title: "AI Estimating Playbook: Using Pro Calc on Real Jobs",
    description:
      "How Mohawk Valley contractors can use Pro Construction Calc plus AI to write scopes, compare options, and tighten bids — without leaving the job trailer.",
    category: "AI & Workflow",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators", label: "All Calculators" },
      { href: "/calculators/management", label: "Management Calculators" },
      { href: "/calculators/business", label: "Business Calculators" },
    ],
    content: `
## Where AI Fits in a Real Estimate

On a live job, you don't have time for toy examples. The workflow for most **Rome, Utica, and Oneida County** contractors looks like this:

1. Run a calculator — concrete, framing, roofing, insulation, or business.
2. Sanity‑check quantities against your experience.
3. Ask AI to help with *language, options, and risk*, not to "do the job" for you.

Pro Construction Calc is built for exactly that loop. The calculators handle the math; the **AI Optimizer** helps you explain and refine the plan.

## Concrete Example: Footing and Slab in Oneida County

Say you're pouring a footing and slab in **Rome, NY**:

- Use the **Footing Volume** and **Slab** calculators to size yards and bags.
- Set depth based on frost‑line guidance from our **Freeze‑Lines** and **Frost Heave** Field Notes (typically 42"–48"+).
- Then send the results to the AI Optimizer and ask:

> “Write a short scope of work and materials list for a homeowner, based on these calculator outputs. Flag anything I should confirm with the building department.”

The AI response should give you:

- Plain‑English scope and inclusions/exclusions
- A ready‑to‑paste material list for your supplier
- A reminder to confirm frost depth and inspection requirements locally

You still control the numbers; AI just speeds up the paperwork.

## Roofing Example: Snow Loads and Shingles

For a **Mohawk Valley** roof:

- Use the **Pitch & Slope** and **Shingles** calculators to convert area, pitch, and waste into squares and bundles.
- Check the **Snow Loads** Field Note for typical ground and roof values in **Rome** and **Utica**.
- Then prompt AI:

> “Summarize this roof in one paragraph for a proposal, including snow‑load context for Oneida County, and list Good/Better/Best shingle options.”

AI can:

- Explain why your waste factor is set where it is
- Suggest three pricing tiers (good/better/best) that match your material choices
- Help you keep language consistent across bids

## Business Side: Cash Flow and Retainage

AI is just as useful on the **business** side:

- Run **Profit Margin**, **Labor Rate**, and **Lead Estimator** calculators.
- Use the **Retainage** and **Permit Timelines** Field Notes as context.
- Ask AI to:

> “Explain this bid's cash flow, including retainage and permit delays, in plain English for a GC or owner.”

You get a narrative you can drop into an email or proposal, while still owning the math and assumptions.

## Guardrails: What AI Should *Not* Replace

Even with strong local content and calculators, AI is not:

- A stamped engineering design
- A substitute for the Rome/Utica/Oneida County building department
- A replacement for your own judgment in the field

Treat AI as a fast assistant for **language, comparison, and reminders**, not the final authority. Use it to keep your documentation sharp so the real‑world work stays on schedule and in budget.
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
      "New York's push toward all-electric buildings affects Rome, Utica, and Oneida County. Heat pumps, panel sizing, and what to spec when all-electric or electric-ready applies in the Mohawk Valley.",
    category: "Energy",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/mechanical/btu-estimator", label: "BTU Estimator" },
      { href: "/calculators/mechanical", label: "Mechanical Calculators" },
    ],
    content: `
## Why All-Electric Matters in Oneida County

New York State's climate and energy goals are pushing new construction and major renovations toward **all-electric** or electric-ready design. The statewide mandate that was slated to take effect in 2026 is currently **on hold**; check NYS and local code for current effective dates. For contractors and builders in **Rome, NY**, **Utica, NY**, and **Oneida County**, voluntary all-electric and electric-ready specs still mean more heat-pump work, larger electrical panels, and different sizing rules than the gas-fired norm.

Staying ahead of code and client expectations in the **Mohawk Valley** means understanding what all-electric and electric-ready require and how to estimate and bid them.

## Heat Pumps and Load in the Mohawk Valley

Cold-climate heat pumps are the default for new all-electric homes. In **Oneida County** and the broader **Mohawk Valley**, heating loads drive the equipment size more than cooling. Proper sizing avoids overspend and undersized equipment that struggles in deep winter.

- **Manual J (or equivalent)** remains the right way to size. Don't rely on rule-of-thumb "per square foot" for heat pumps.
- **Design temperature** for the region is typically in the single digits (e.g., 5°F to 10°F). Equipment must be rated for that.
- **Electrical service:** All-electric homes often need **200 A** panels; larger homes or all-electric with EV charging may need more. Plan for panel and service upgrades in bids.

## What to Spec When All-Electric Applies

When all-electric or electric-ready is required by code or chosen by the client:

- **Ducted or ductless heat pumps** sized to a proper load calc.
- **Electric resistance backup** or dual-fuel only where explicitly allowed or grandfathered.
- **Water heating:** Heat-pump water heaters are the preferred all-electric option; size for occupancy and recovery.
- **Cooking and drying:** Electric ranges and heat-pump dryers are standard in all-electric specs.

For **Rome** and **Utica** permits, confirm with the local building department whether all-electric or electric-ready is required for your project type (the statewide mandate is on hold; local rules may still apply) and whether any exemptions apply.

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

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
  lastVerified?: string;
  sources?: string[];
  /** Calculator/tool links for "Use This Tool" sidebar */
  relatedToolLinks: FieldNoteToolLink[];
  content: string;
}

export const FIELD_NOTES: FieldNote[] = [
  {
    slug: "waste-factors-by-trade",
    title: "Material Waste Factors: What to Add for Concrete, Framing, Roofing, and Flooring",
    description:
      "Practical waste percentages for the trades where ordering short creates real problems. Know these numbers before you call the supplier.",
    category: "Estimating",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/concrete/slab", label: "Slab Calculator" },
      { href: "/calculators/framing/wall-studs", label: "Wall Studs Calculator" },
      { href: "/calculators/roofing/shingles", label: "Shingles Calculator" },
      { href: "/calculators/finish/flooring", label: "Flooring Calculator" },
    ],
    content: `
## Why waste factors exist

No pour, no framing package, and no roofing takeoff comes out exactly to the plan dimension. Concrete spills, lumber gets cut wrong, shingles get cracked in handling, and flooring pieces get wasted at walls and transitions. Waste factors are how experienced estimators account for this before the order goes in — not after.

## Concrete

For a straightforward slab-on-grade, carry 10 percent over the calculated volume. Footings and formed work can run a little higher because the forms are never perfectly square and spills happen at the chute. If the pour is complex or the crew is less experienced, move to 12 to 15 percent. Short-loading a concrete truck is expensive and embarrassing.

## Framing lumber

Wall framing waste typically runs 10 to 15 percent over the stud count from the plan. Add corners, double top plates, trimmers, kings, cripples, and let-in bracing before you order — those pieces add up fast. Roof framing waste can be higher, especially with hips, valleys, and ridge cuts.

## Roofing shingles

A standard open gable roof with no complex cuts can be estimated with 10 percent waste. Add hips, valleys, dormers, skylights, or tight rake cuts and move to 15 percent. Most suppliers sell in squares, so round up after adding waste, never before.

## Flooring

Straight-lay tile or plank flooring typically needs 10 percent. Diagonal or herringbone patterns need 15 percent or more because every cut along the perimeter wastes a larger piece. Always go higher in rooms with lots of angles or obstacles.

## Drywall and insulation

For drywall, 10 percent is standard. Insulation batts cut to fit around wiring, blocking, and odd stud bays can see 5 to 10 percent depending on the floor plan.

## The field rule

When in doubt, carry more. A leftover pallet of shingles can go back. Waiting for a second concrete truck cannot.
    `,
  },
  {
    slug: "deck-framing-basics",
    title: "Deck Framing Basics: Joist Span, Post Spacing, and Ledger Attachment",
    description:
      "The structural decisions that keep a deck code-compliant and safe — before you order a single board.",
    category: "Framing",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/framing/deck-joists", label: "Deck Joist Calculator" },
      { href: "/calculators/framing/floor", label: "Floor Framing Calculator" },
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
    ],
    content: `
## Start with the span table, not a rule of thumb

Joist size and spacing are not guesses — they come from a span table based on species, grade, spacing, and load. A 2x8 at 16 inches on center may carry a different span than the same lumber at 12 or 24 inches, and the difference matters when the client is standing on the deck.

## Common joist sizing starting points

For a lightly loaded residential deck using #2 Southern Pine or Douglas Fir:

- 2x8 at 16 inches on center spans approximately 12 to 13 feet.
- 2x10 at 16 inches on center spans approximately 15 to 16 feet.
- 2x12 at 16 inches on center spans approximately 18 feet.

Always confirm against the current AWC span tables or your plan engineer before ordering. Species and grade change the number.

## Post spacing

Beam design drives post spacing. A properly sized beam at 8-foot post spacing carries a different load than the same beam at 12-foot spacing. Run the tributary area and beam span together, not separately. If the deck cantilevers past the outer beam, account for that load too.

## Ledger attachment

The ledger is where most deck failures start. Attach to the rim joist or solid blocking — not through siding or stucco. Use stainless or hot-dipped galvanized structural screws or through-bolts sized for the connection load. Check local code for required fastener patterns; many jurisdictions now require engineered ledger connections for anything beyond a simple residential deck.

## Footings

The footing has to carry the post load and get below frost depth. In local markets, that means starting at 48 inches. Size the footing from the tributary area and soil bearing capacity — a local soils report or the permit set will tell you if the assumed bearing pressure works.

## Practical takeaway

Frame the deck like it is going to hold a crowd. Because eventually it will.

Use our [deck joist calculator](/calculators/framing/deck-joists) and [footing volume calculator](/calculators/concrete/footing) to get clean material counts before the truck arrives.
    `,
  },
  {
    slug: "local-county-freeze-lines",
    title: "local markets Freeze-Line Planning: Local, Local, and 48-Inch Baselines",
    description:
      "A safer way to estimate footing depth in local municipalities without leaning on loose rule-of-thumb numbers.",
    category: "Concrete & Foundations",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/concrete", label: "Concrete & Masonry Calculators" },
      { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
    ],
    content: `
## Start with a defensible planning number

Recent local markets public construction drawings use a 48-inch design frost depth. That makes 48 inches a reasonable estimating baseline for local footing work until the permit set, soils report, or building official tells you otherwise.

## Why crews still hear different answers

your local towns do not all review the same project types in the same way. Frost-protected shallow foundation details, site soils, drainage, and stamped design documents can all change the final requirement. That is why one project may carry a straightforward 48-inch note while another gets more detailed instructions.

## How to estimate it cleanly

- Carry 48 inches as the baseline unless the plans say otherwise.
- Ask early whether insulation-based frost protection details are allowed.
- Price drainage, base prep, and excavation depth together instead of treating frost depth as a single line item.

## Why it matters

Depth mistakes do not stay on paper. They turn into rework, inspection delays, and cold-weather schedule pain. A quick confirmation call before you dig is cheaper than a failed footing inspection.

Use our [footing volume calculator](/calculators/concrete/footing) once the design depth is confirmed.
    `,
  },
  {
    slug: "oneida-county-sales-tax-2026",
    title: "Oneida County Sales Tax (8.75%) and ST-124 Rules",
    description:
      "A contractor-focused guide to local markets's current combined sales tax rate covering the your local market market, ST-124 capital improvement exemptions, and clean estimating habits.",
    category: "Business & Legal",
    date: "May 2026",
    lastVerified: "2026-03-17",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## Current combined rate

New York's current jurisdiction table lists local markets at 8.75 percent combined sales tax. That is 4 percent state tax plus 4.75 percent local tax. This applies to taxable repair and maintenance work performed within local markets, including the your local market metro areas.

## Capital improvements and Form ST-124

If the project qualifies as a capital improvement under NYS tax law, collect a signed Form ST-124 from the property owner before the job starts. A valid ST-124 on file means you do not charge sales tax on labor for that scope. Materials you purchase for the job are still taxable at the point of purchase unless a separate exemption applies.

## Common traps in the your local market market

- Remodeling a kitchen or bathroom usually qualifies as a capital improvement. Patching or repairing the same space usually does not.
- A job that mixes new work with repair work needs two separate invoice lines so the tax treatment is clear on paper.
- Do not rely on what the last GC told you. Verify the project type before the proposal goes out.

## Clean estimating habits

- Enter the 8.75 percent rate in the Tax Save calculator before you build the bid.
- Keep the signed ST-124 in the job file alongside the executed contract and final invoice.
- Show tax as its own line on every taxable estimate so clients are not surprised at closeout.

## Local contractor note

local markets projects often span multiple municipalities from Local to Local to Whitesboro. Tax treatment does not change by city for sales tax purposes, but permit requirements and inspection processes can vary significantly. Confirm local jurisdiction paperwork before you break ground.

Use our [Tax Save calculator](/calculators/business/tax-save) to model the taxable and exempt versions of a bid before it leaves your desk.
    `,
  },
  {
    slug: "herkimer-county-sales-tax-2026",
    title: "Herkimer County Sales Tax (8.25%) and ST-124 Rules",
    description:
      "A straightforward guide to Local County's current combined sales tax rate and how ST-124 changes the labor line on a qualifying capital-improvement job.",
    category: "Business & Legal",
    date: "May 2026",
    lastVerified: "2026-03-17",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## Current combined rate

New York's current jurisdiction table lists Local County at 8.25 percent combined sales tax. That is 4 percent state tax plus 4.25 percent local tax.

## When ST-124 changes the invoice

If the job qualifies as a capital improvement and you have a signed Form ST-124 on file, labor is not taxed. If the work is repair or maintenance, the taxable labor line stays in play.

## Clean estimating habits

- Separate repair work from capital-improvement work on mixed jobs.
- Keep materials, labor, overhead, and profit visible instead of hiding tax inside a lump sum.
- Save the signed ST-124 with the estimate and invoice package.

## Local reminder

Permit handling and review timing can still vary by town or village, so do not let the tax math distract you from jurisdiction-specific paperwork.

Use our [Tax Save calculator](/calculators/business/tax-save) to model the job both ways before you send the bid.
    `,
  },
  {
    slug: "madison-county-sales-tax-2026",
    title: "Madison County Sales Tax (8.00%) and ST-124 Rules",
    description:
      "How to handle Local County's current combined rate and keep taxable repairs separate from true capital-improvement work.",
    category: "Business & Legal",
    date: "May 2026",
    lastVerified: "2026-03-17",
    relatedToolLinks: [
      { href: "/calculators/business/tax-save", label: "Tax Save Calculator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## Current combined rate

Local County is currently listed at an 8.00 percent combined sales tax rate. That is 4 percent state tax plus 4 percent local tax.

## Where contractors get tripped up

The mistake is not usually the percentage. It is treating every residential job like a capital improvement. If the work is repair or maintenance, tax still applies. If it qualifies and you have Form ST-124 on file, labor is not taxed.

## Keep the paperwork clean

- Decide early whether the scope is taxable repair, exempt capital improvement, or a mix of both.
- Split mixed scopes into separate lines so the invoice tells the same story as the contract.
- Keep the exemption form in the file, not in someone's inbox.

## Practical takeaway

The easier you make the paper trail, the easier it is to defend the invoice later.

Use our [Tax Save calculator](/calculators/business/tax-save) to compare the taxed and exempt versions before you send the estimate.
    `,
  },
  {
    slug: "nys-retainage-laws",
    title: "NYS Retainage Rules: What Local GCs Should Read First",
    description:
      "Public vs private retainage limits, cash-flow risk, and the contract questions to answer before you sign.",
    category: "Business & Legal",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/business", label: "Business & Estimating Calculators" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin Calculator" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate Calculator" },
    ],
    content: `
## Public work and private work are not the same

On public projects covered by New York prompt-payment statutes, retainage is generally limited to 5 percent. Private work does not have a statewide retainage cap, which means the written contract controls the amount, the trigger, and the release timing.

## What to look for before you sign

- How much retainage is withheld.
- The exact event that releases it.
- What closeout documents are required before the money moves.

## Where the risk shows up

A job can look profitable on paper and still create cash-flow problems if retainage sits too long. That is why the retainage clause matters just as much as the labor rate or margin target.

## Practical move

Model the project with retainage included, confirm the release condition in writing, and pay attention to lien rights and notice deadlines if payment starts to slide.

Use our [profit margin calculator](/calculators/business/profit-margin) and [labor rate calculator](/calculators/business/labor-rate) to stress-test the job before you commit.
    `,
  },
  {
    slug: "ai-estimating-playbook",
    title: "AI Estimating Playbook: Using Pro Calc on Real Jobs",
    description:
      "A practical workflow for turning calculator outputs into scopes, options, and cleaner proposal language without letting AI replace field judgment.",
    category: "AI & Workflow",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators", label: "All Calculators" },
      { href: "/calculators/management", label: "Management Calculators" },
      { href: "/calculators/business", label: "Business Calculators" },
    ],
    content: `
## Use AI after the math, not before it

The cleanest workflow is simple:

1. Run the calculator.
2. Check the result against the plans and site conditions.
3. Use AI to turn the result into better language, option sets, and reminders.

## Concrete example

If you are pricing a footing and slab in local markets, run the footing and slab tools first. Once the quantities are in hand, ask AI to draft a short homeowner scope, a material list, and a checklist of items to confirm with the building department.

## Roofing example

For a roofing job, use the pitch and shingle tools first. Then ask AI to turn the takeoff into a short proposal summary with good, better, and best material options. That keeps the math anchored while still saving time on the write-up.

## Business example

The same pattern works for margins, labor, lead cost, and cash-flow explanations. The calculator gives you the numbers. AI helps you explain the numbers in a way the client or GC can actually follow.

## Guardrails

- Do not let AI make code calls for you.
- Do not let AI replace a load calc, stamped design, or local permit check.
- Do not send AI output without checking that the numbers still match the job.

Use AI as the fast drafting assistant. Keep field judgment and final responsibility with the estimator.
    `,
  },
  {
    slug: "insulation-r-values",
    title: "Insulation R-Values for National Winters",
    description:
      "What Zone 6 insulation targets mean for attics, walls, rim joists, and the spray-foam-versus-fiber decision across the national service area.",
    category: "Insulation",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/insulation", label: "HVAC & Insulation Calculators" },
      { href: "/calculators/insulation/r-value-tracker", label: "R-Value Tracker" },
      { href: "/calculators/insulation/drywall-sheets", label: "Drywall Sheets Calculator" },
    ],
    content: `
## Start with the climate zone

The current New York energy code climate table places most regions in Climate Zone 6. DOE and ENERGY STAR guidance for Zone 6 homes generally pushes attic insulation into the R-49 to R-60 range. Wall and floor targets depend more on the assembly, framing depth, and whether you are looking at new work or retrofit guidance.

## What that means on real jobs

Attics usually need the deepest insulation package. Walls depend on framing depth, exterior insulation strategy, and air-sealing quality. Rim joists and awkward transition areas are where leakage can erase the benefit of a good nominal R-value.

## Spray foam vs fiber

Spray foam helps when you need insulation and air sealing in the same limited cavity. Fiber systems often win on cost in open attic areas where depth is easy to build and air sealing can be handled separately.

## Better decision rule

Do not compare products by advertised R-value alone. Compare the whole assembly: cavity depth, air leakage, moisture control, and how cleanly the system fits the framing you already have.

Use our [R-Value Tracker](/calculators/insulation/r-value-tracker) to build the assembly before you price it.
    `,
  },
  {
    slug: "all-electric-2026",
    title: "All-Electric 2026: What National Contractors Should Verify Now",
    description:
      "A practical read on the current code pause, load-calculation issues, and the electrical scope questions that still matter on all-electric and electric-ready jobs.",
    category: "Energy",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/mechanical/btu-estimator", label: "BTU Estimator" },
      { href: "/calculators/mechanical", label: "Mechanical Calculators" },
    ],
    content: `
## The statewide deadline is not the whole story

New York's 2025 code books are in effect, but the fossil-fuel equipment prohibitions have been suspended by court order while appeals continue. That means the statewide all-electric picture is still moving, even though owners, designers, and some local projects are already pushing toward electric-only or electric-ready scope.

## What still changes on the job

Even with the court pause, all-electric projects usually need more upfront attention to service size, panel space, heat-pump layout, and water-heating strategy. Those decisions show up in the estimate long before they show up at rough-in.

## Do not skip the load work

- Size heating equipment from a real load calc, not a square-foot shortcut.
- Coordinate service and panel requirements early.
- Call out owner selections that could change electrical scope later, like EV charging or electric cooking.

## Practical takeaway

The smart move in 2026 is to confirm the current code status, then bid the actual system the owner and jurisdiction expect instead of guessing from headlines.

Use our [BTU Estimator](/calculators/mechanical/btu-estimator) as a starting point before you lock equipment assumptions.
    `,
  },
  {
    slug: "frost-heave",
    title: "Frost Heave in local markets: Start With 48 Inches, Then Verify",
    description:
      "Why depth alone is not enough, how wet soils increase frost-heave risk, and why a 48-inch footing note is only the first step.",
    category: "Concrete & Foundations",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
      { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
      { href: "/calculators/concrete", label: "Concrete Calculators" },
    ],
    content: `
## Frost heave is a water problem and a depth problem

Footings move when water in the soil freezes, expands, and lifts the structure with it. Digging below frost depth matters, but drainage, base preparation, and the soil itself matter too.

## Local baseline

Recent local markets public drawings use a 48-inch design frost depth. That is a solid starting point for estimating, but it does not replace the permit set, the soils report, or site-specific review comments.

## What makes a job riskier

- Wet silts and clays that hold water.
- Poor drainage around the footing line.
- Slabs and walks that are shallow and unprotected at the perimeter.

## Practical move

Carry the footing at the confirmed frost depth, then price the drainage and base work that keep water from sitting under the structure in the first place.

Use our [footing volume calculator](/calculators/concrete/footing) once the final depth is confirmed.
    `,
  },
  {
    slug: "snow-loads",
    title: "Snow Loads in the National Region: Check the Design Load Before You Frame",
    description:
      "Local snow design values can run much higher than generic homeowner assumptions, so get the real number before you size rafters or trusses.",
    category: "Roofing",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/roofing/shingles", label: "Shingles Calculator" },
      { href: "/calculators/roofing/pitch-slope", label: "Pitch & Slope Calculator" },
      { href: "/calculators/roofing", label: "Roofing Calculators" },
    ],
    content: `
## Do not guess at local snow loads

Recent local markets public construction drawings show local ground snow loads in the 60 to 70 psf range on real projects. That is a good reminder that generic online rules of thumb can be far too low for national work.

## What that changes

Snow load affects rafter sizing, truss design, connection details, and drift conditions. It does not change the way you count shingle area, but it absolutely changes the structure under the shingles.

## Practical workflow

- Get the design load from the plans, engineer, or authority having jurisdiction.
- Separate structural design assumptions from the roofing material takeoff.
- Use the roof calculator for squares and bundles only after the framing side is settled.

## Practical takeaway

If the project documents are silent, that is the moment to ask questions, not the moment to assume a light load because the roof pitch looks common.

Use our [pitch and slope calculator](/calculators/roofing/pitch-slope) and [shingles calculator](/calculators/roofing/shingles) once the structural load is confirmed.
    `,
  },
  {
    slug: "permit-timelines",
    title: "Permit Reviews in local markets: What to Confirm Before You Promise a Start Date",
    description:
      "A better way to handle schedule risk when different city, town, village, and state offices may all touch the review path.",
    category: "Business & Legal",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/business/lead-estimator", label: "Lead Estimator" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate Calculator" },
      { href: "/calculators/business", label: "Business Calculators" },
    ],
    content: `
## There is no single countywide permit clock

The first question is not "How many weeks does it take?" The first question is "Who is actually reviewing this job?" In most regions, the county governments themselves have opted out of code enforcement. On many private jobs, the reviewing office is still the city, town, or village where the project sits. On some local-government work, the state inspection unit can become part of the review path.

## Better first steps

- Confirm the authority having jurisdiction before you promise a start date.
- Ask what drawings, specs, fees, and outside approvals are required up front.
- Treat incomplete submittals as a schedule problem, not just a paperwork problem.

## Where delays usually come from

Permit schedules stretch when the scope is unclear, site plans are missing, engineering is incomplete, or outside agency approvals are still open. That is why the same office can turn one job quickly and stall another.

## Practical takeaway

Build schedule buffer into the estimate, tell the client what assumptions the start date depends on, and keep labor planning flexible until the permit is actually in hand.

Use our [Lead Estimator](/calculators/business/lead-estimator) and [labor rate calculator](/calculators/business/labor-rate) to model the schedule risk before you commit.
    `,
  },
  {
    slug: "2026-ny-construction-updates",
    title: "2026 NY Construction Updates: Energy Code Pause and Marcy UDC",
    description:
      "Two items worth checking before you lock a 2026 national bid: the current energy-code court pause and Marcy site-review requirements.",
    category: "Code & Compliance",
    date: "April 2026",
    lastVerified: "2026-03-17",
    sources: [
      "https://www.dos.ny.gov/licensing/",
    ],
    relatedToolLinks: [
      { href: "/calculators/mechanical/btu-estimator", label: "BTU Estimator" },
      { href: "/calculators/business/profit-margin", label: "Profit Margin" },
      { href: "/calculators/business/labor-rate", label: "Labor Rate" },
    ],
    content: `
## State energy code status

New York's 2025 Uniform and Energy Code updates took effect on December 31, 2025. The fossil-fuel equipment prohibitions are currently suspended by court order while appeals are pending. For 2026 bids, treat statewide all-electric compliance as a live code-watch item, not a settled deadline you can quote from memory.

## What that means in the field

- Verify the current code status before locking equipment selections.
- Carry enough electrical scope for heat pumps and electric water heating when owners want all-electric or electric-ready designs.
- Write any exemption, alternate path, or owner preference directly into the proposal.

## Marcy UDC review

The Town of Marcy has an adopted Unified Development Code on file with the state. Before you price a job there, confirm the parcel zoning, the allowed use, and whether site plan, lighting, parking, buffering, or stormwater review will affect scope and schedule.

## Practical move

If you are bidding a 2026 project in Marcy or elsewhere in local markets, check the code status first and confirm land-use review requirements second before the proposal leaves your desk.
    `,
  },
  {
    slug: "how-much-mulch-do-i-need",
    title: "How Much Mulch Do I Need? A Quick Volume Guide",
    description:
      "Estimate bulk mulch in cubic yards for beds, tree rings, and landscape areas — with depth guidelines by application.",
    category: "Landscaping",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/landscape/mulch", label: "Mulch Calculator" },
      { href: "/calculators/landscape/topsoil", label: "Topsoil Calculator" },
    ],
    content: `
## Start with the area

Measure the length and width of the bed or landscape area in feet. Multiply them to get square footage. For irregular shapes, break the area into rectangles and add the sections together.

## Pick the right depth

Mulch depth depends on the application:

- **Garden beds:** 2–3 inches is standard for weed suppression and moisture retention.
- **Tree rings:** 3–4 inches, but keep mulch 6 inches away from the trunk to avoid rot.
- **Walkway borders:** 2 inches is usually enough for appearance.
- **Erosion control on slopes:** 4 inches minimum to stay in place.

## Convert to cubic yards

The formula is simple:

**Cubic yards = (length × width × depth in inches) ÷ (12 × 27)**

For example, a 20 × 10 foot bed at 3 inches deep needs about 1.85 cubic yards before waste.

## Bulk vs. bagged

Bulk mulch from a local yard runs 3–4 times cheaper per cubic yard than bagged product from a box store. Once you need more than about 2 cubic yards, bulk delivery almost always makes sense — especially in the national area where most suppliers charge a flat delivery fee regardless of quantity.

## Add waste

Order 10% extra for settling, uneven bed depths, and spillage. Mulch compresses after rain, and a short order means a second trip.

Use our [mulch calculator](/calculators/landscape/mulch) to turn your bed dimensions into a clean cubic yard number.
    `,
  },
  {
    slug: "planning-a-paver-patio-materials-and-layout",
    title: "Planning a Paver Patio: Materials and Layout",
    description:
      "How to estimate pavers, sand, and gravel base for a patio — with base depth guidelines for Upstate New York freeze-thaw conditions.",
    category: "Outdoor",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/outdoor/paver-patio", label: "Paver Patio Calculator" },
      { href: "/calculators/landscape/gravel", label: "Gravel & Stone Calculator" },
    ],
    content: `
## Base prep matters most

A paver patio is only as good as what is underneath it. In the national area, freeze-thaw cycles will destroy a patio with an undersized base in one or two winters. Start with the base, not the pavers.

## Gravel base depth

- **Patios (foot traffic only):** 4 inches of compacted crushed stone minimum.
- **Areas with occasional vehicle traffic:** 6 inches minimum.
- **Over clay soils or poor drainage:** Add 2 inches to the above numbers.

Compact the base in 2-inch lifts with a plate compactor. Skipping this step is the number one reason patios fail.

## Sand bedding

A 1-inch layer of bedding sand goes on top of the compacted gravel. Use concrete sand or ASTM C33 sand — not play sand or mason sand.

## Paver count

A standard 4×8 inch brick paver covers about 0.222 square feet. For a 12×12 foot patio (144 sq ft):

- **Pavers:** 144 ÷ 0.222 = ~649 pavers before waste
- **With 10% waste:** ~714 pavers

Pattern cuts (herringbone, basket weave) generate more waste than running bond. Budget 10–15% depending on the pattern.

## Edge restraint

Every patio needs edge restraint around the perimeter to prevent pavers from shifting. Measure the perimeter in linear feet and order rigid plastic or aluminum edging to match.

## Polymeric sand

After setting pavers, sweep polymeric sand into the joints and activate with water. This locks the pavers in place and prevents weed growth. One 50-lb bag covers roughly 30–50 sq ft depending on joint width.

Use our [paver patio calculator](/calculators/outdoor/paver-patio) to get material quantities for your project.
    `,
  },
  {
    slug: "fence-material-estimating-posts-rails-and-pickets",
    title: "Fence Material Estimating: Posts, Rails, and Pickets",
    description:
      "The math behind a wood fence package — post spacing, rail count, picket quantities, and frost line requirements for Upstate New York.",
    category: "Outdoor",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/outdoor/fence", label: "Fence Calculator" },
    ],
    content: `
## Posts first

Post count is straightforward: divide the total linear footage by the post spacing, then add one.

- **Standard spacing:** 8 feet on center for most residential wood fences.
- **6-foot spacing:** Used on slopes, heavy wind areas, or when the fence height exceeds 6 feet.

A 100-foot fence at 8-foot spacing needs 14 posts (100 ÷ 8 + 1 = 13.5, round up).

## Frost line depth

In most regions, fence posts must be set at least 48 inches below grade per NYS frost line requirements. This means the post needs to be at least 4 feet in the ground. For a 6-foot fence, use 10-foot posts (6 above + 4 below). Cutting corners on depth leads to frost-heaved posts by the second spring.

## Rails

- **Fences up to 6 feet:** 2 horizontal rails per section.
- **Fences over 6 feet:** 3 rails per section for structural rigidity.

Each section runs between two posts, so rail count = sections × rails per section. A 100-foot fence at 8-foot spacing with 2 rails needs 13 sections × 2 = 26 rails.

## Pickets

A standard dog-ear picket is 3.5 inches wide. With a 0.5-inch gap between pickets, each picket takes up 4 inches of fence width.

- **Pickets per 8-foot section:** (8 × 12) ÷ 4 = 24 pickets
- **For 13 sections:** 24 × 13 = 312 pickets

Add 10% for waste (broken boards, bad cuts, and gate framing).

## Gates

Each gate opening loses one section of fence but adds a gate frame kit. Budget 2 extra posts (doubled for hinge/latch strength) and a pre-hung gate or custom frame per opening.

Use our [fence calculator](/calculators/outdoor/fence) to get a complete material list before the order goes in.
    `,
  },
  {
    slug: "spring-driveway-repair-asphalt-vs-concrete",
    title: "Spring Driveway Repair: Asphalt vs Concrete",
    description:
      "A practical comparison of asphalt and concrete driveways for Upstate New York homeowners — cost, durability, and climate considerations.",
    category: "Outdoor",
    date: "March 2026",
    relatedToolLinks: [
      { href: "/calculators/outdoor/asphalt-driveway", label: "Asphalt Driveway Calculator" },
      { href: "/calculators/concrete/slab", label: "Slab Calculator" },
    ],
    content: `
## The climate factor

Upstate New York winters are hard on driveways. Freeze-thaw cycles, road salt, and plow damage all affect the surface differently depending on the material.

**Asphalt** flexes with freeze-thaw movement, which reduces cracking. But it softens in extreme heat and needs seal coating every 3–5 years. Salt damage is minimal.

**Concrete** is rigid and cracks more easily from frost heave, but it lasts longer without maintenance when the base is done right. De-icing salt can cause surface spalling over time — use sand or calcium chloride instead of rock salt on concrete.

## Cost comparison

Rough installed cost ranges for the national area (2026):

- **Asphalt:** $3–$6 per square foot installed
- **Concrete:** $6–$12 per square foot installed

Asphalt is cheaper upfront but has higher lifetime maintenance cost. Concrete costs more initially but requires almost no maintenance for 20–30 years when properly installed.

## Thickness and base

- **Asphalt driveways:** 2–3 inches of compacted hot mix over 6–8 inches of compacted gravel base.
- **Concrete driveways:** 4 inches of concrete over 4–6 inches of compacted gravel base. Rebar or wire mesh recommended for crack control.

Both materials need proper gravel base and compaction to handle Upstate freeze-thaw conditions.

## When to choose each

**Choose asphalt** when budget is tight, the driveway is long, or you want a surface that handles plow blades better.

**Choose concrete** when you want longevity, minimal maintenance, or decorative options (stamped, colored, exposed aggregate).

Use our [asphalt driveway calculator](/calculators/outdoor/asphalt-driveway) for tonnage estimates, or our [slab calculator](/calculators/concrete/slab) for concrete driveway volume.
    `,
  },
];

export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  return FIELD_NOTES.find((n) => n.slug === slug);
}

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

The footing has to carry the post load and get below frost depth. In Oneida County, that means starting at 48 inches. Size the footing from the tributary area and soil bearing capacity — a local soils report or the permit set will tell you if the assumed bearing pressure works.

## Practical takeaway

Frame the deck like it is going to hold a crowd. Because eventually it will.

Use our [deck joist calculator](/calculators/framing/deck-joists) and [footing volume calculator](/calculators/concrete/footing) to get clean material counts before the truck arrives.
    `,
  },
  {
    slug: "oneida-county-freeze-lines",
    title: "Oneida County Freeze-Line Planning: Rome, Utica, and 48-Inch Baselines",
    description:
      "A safer way to estimate footing depth in Rome, Utica, and surrounding Oneida County without leaning on loose rule-of-thumb numbers.",
    category: "Concrete & Foundations",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/concrete", label: "Concrete & Masonry Calculators" },
      { href: "/calculators/concrete/slab", label: "Slab-on-Grade Calculator" },
      { href: "/calculators/concrete/footing", label: "Footing Volume Calculator" },
    ],
    content: `
## Start with a defensible planning number

Recent Oneida County public construction drawings use a 48-inch design frost depth. That makes 48 inches a reasonable estimating baseline for local footing work until the permit set, soils report, or building official tells you otherwise.

## Why crews still hear different answers

Rome, Utica, and nearby towns do not all review the same project types in the same way. Frost-protected shallow foundation details, site soils, drainage, and stamped design documents can all change the final requirement. That is why one project may carry a straightforward 48-inch note while another gets more detailed instructions.

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

If you are pricing a footing and slab in Oneida County, run the footing and slab tools first. Once the quantities are in hand, ask AI to draft a short homeowner scope, a material list, and a checklist of items to confirm with the building department.

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
    title: "Insulation R-Values for Tri-County Winters",
    description:
      "What Zone 6 insulation targets mean for attics, walls, rim joists, and the spray-foam-versus-fiber decision across the tri-county service area.",
    category: "Insulation",
    date: "March 2025",
    relatedToolLinks: [
      { href: "/calculators/insulation", label: "HVAC & Insulation Calculators" },
      { href: "/calculators/insulation/r-value-tracker", label: "R-Value Tracker" },
      { href: "/calculators/insulation/drywall-sheets", label: "Drywall Sheets Calculator" },
    ],
    content: `
## Start with the climate zone

The current New York energy code climate table places Oneida, Herkimer, and Madison counties in Climate Zone 6. DOE and ENERGY STAR guidance for Zone 6 homes generally pushes attic insulation into the R-49 to R-60 range. Wall and floor targets depend more on the assembly, framing depth, and whether you are looking at new work or retrofit guidance.

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
    title: "All-Electric 2026: What Tri-County Contractors Should Verify Now",
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
    title: "Frost Heave in Oneida County: Start With 48 Inches, Then Verify",
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

Recent Oneida County public drawings use a 48-inch design frost depth. That is a solid starting point for estimating, but it does not replace the permit set, the soils report, or site-specific review comments.

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
    title: "Snow Loads in the Tri-County Region: Check the Design Load Before You Frame",
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

Recent Oneida County public construction drawings show local ground snow loads in the 60 to 70 psf range on real projects. That is a good reminder that generic online rules of thumb can be far too low for tri-county work.

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
    title: "Permit Reviews in Oneida County: What to Confirm Before You Promise a Start Date",
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

The first question is not "How many weeks does it take?" The first question is "Who is actually reviewing this job?" In Oneida, Herkimer, and Madison counties, the county governments themselves have opted out of code enforcement. On many private jobs, the reviewing office is still the city, town, or village where the project sits. On some local-government work, the state inspection unit can become part of the review path.

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
      "Two items worth checking before you lock a 2026 tri-county bid: the current energy-code court pause and Marcy site-review requirements.",
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

If you are bidding a 2026 project in Marcy or elsewhere in Oneida County, check the code status first and confirm land-use review requirements second before the proposal leaves your desk.
    `,
  },
];

export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  return FIELD_NOTES.find((n) => n.slug === slug);
}

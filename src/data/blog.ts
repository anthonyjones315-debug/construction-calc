export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  date: string
  content: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-calculate-concrete-for-a-slab',
    title: 'How to Calculate Concrete for a Slab',
    description: 'A clean way to size slab volume, add waste, and decide when bags stop making sense.',
    category: 'Concrete',
    date: 'March 1, 2025',
    content: `
## Start with the volume

The core formula is simple:

Cubic yards = length × width × (thickness in inches ÷ 12) ÷ 27

If the slab is 10 feet by 10 feet and 4 inches thick, the base volume is 1.23 cubic yards before waste.

## Add waste before you order

Most slab pours need a little cushion for grade variation, uneven forms, and cleanup. For a straightforward slab, 10 percent is a practical starting point. Footings, steps, and awkward pours usually need a bit more.

## Bags or ready-mix

Bagged concrete works best for patches, small pads, and jobs where access matters more than speed. An 80-pound bag yields about 0.6 cubic feet, so bag counts climb quickly once the pour gets larger.

When you are getting close to a full yard, call the ready-mix supplier and confirm minimums, short-load charges, and the mix design the job requires. Those details vary by plant.

## Field checklist

- Pull thickness from the plans, not memory.
- Confirm whether the slab needs air entrainment or a specific mix requirement.
- Order enough material to finish the pour in one shot.

Use our [slab calculator](/calculators/concrete/slab) to turn those dimensions into a clean material number.
    `,
  },
  {
    slug: 'how-to-frame-a-wall',
    title: 'How to Frame a Wall: Stud Count, Plates, and Headers',
    description: 'The math behind a framing package — stud spacing, plate lengths, and sizing headers for openings.',
    category: 'Framing',
    date: 'March 10, 2025',
    content: `
## The basic stud count

For a wall framed at 16 inches on center, divide the wall length in inches by 16, then add 1. A 16-foot wall has 13 layout studs before you account for corners, openings, and end details. At 24 inches on center the base count drops, but you still need to add the same corner and opening extras.

## Plate material

Every standard wall needs a bottom plate and a double top plate. A 16-foot wall needs 48 feet of plate material just for the straight run — plus extra for laps, corners, and splices. Most estimators add 10 to 15 percent for plate waste on complex floor plans.

## Sizing headers

Header size depends on the opening width, the load above, and what the code or engineer requires. Common rule-of-thumb starting points for residential bearing walls:

- Up to 3 feet: (2) 2x6 or (2) 2x8
- 3 to 5 feet: (2) 2x10
- 5 to 8 feet: (2) 2x12 or engineered lumber

Always verify against the plans or a licensed engineer for any load-bearing application. These are starting points, not final specs.

## Corner and intersection extras

Every exterior corner needs extra studs for nailing surface and insulation access. Interior wall intersections need backing or ladder framing. Budget at least 3 extra studs per corner and 2 per T-intersection before you order.

## Practical takeaway

Run the stud count from the plan first, then add corners, openings, and backing. Ordering short on a framing package costs more in delivery fees than the extra lumber does.

Use our [wall studs calculator](/calculators/framing/wall-studs) to get a complete count before the order goes in.
    `,
  },
  {
    slug: 'stud-spacing-16-vs-24-inch',
    title: '16" vs 24" Stud Spacing: When Each One Makes Sense',
    description: 'Stud spacing is a structural choice first and a lumber-saving choice second. Here is the practical way to think about it.',
    category: 'Framing',
    date: 'February 15, 2025',
    content: `
## Start with the wall, not the spacing

Stud spacing depends on the whole assembly: load path, wall height, openings, sheathing, drywall feel, finish materials, and the code or engineering behind the job. That is why there is no single answer that fits every wall.

## Why 16-inch spacing is the safe default

Sixteen inches on center is still the conservative choice for most exterior and load-bearing walls. It gives you a stiffer wall, simpler backing for finishes, and fewer surprises when cabinets, tile, or heavy trim get added later.

## Where 24-inch spacing can work

Twenty-four inches on center is usually a value-engineering move. It can work where the plans, sheathing package, and local code all allow it, but it is not something to pick in isolation just to save studs.

## What it does to your count

On a 20-foot wall, moving from 16-inch to 24-inch spacing drops the base count from about 16 studs to about 11 before corners, openings, and layout details. The savings are real, but so are the tradeoffs.

## Practical takeaway

Treat 16-inch spacing as the default unless the plans or engineer clearly support something else. If you want to frame at 24 inches on center, check the full wall system first: stud size, height, bracing, sheathing, drywall, and finish loads.

Use our [wall studs calculator](/calculators/framing/wall-studs) to compare the count before you order lumber.
    `,
  },
  {
    slug: 'rafter-length-calculation',
    title: 'Rafter Length by Hand: Rise, Run, and the Pythagorean Method',
    description: 'How to calculate rafter length from roof pitch and span — the math every framer should know.',
    category: 'Roofing',
    date: 'February 1, 2025',
    content: `
## Why rafter length matters

Cutting rafters short wastes material and delays the job. Cutting them long means trimming at the ridge and possibly re-cutting the bird's mouth. Getting the number right before the lumber arrives is the move.

## The formula

Rafter length = √(rise² + run²)

Where run is half the building span (for a simple gable) and rise is the total vertical height from the top plate to the ridge.

For a building 24 feet wide with an 8/12 pitch:
- Run = 12 feet
- Rise = 12 × (8 ÷ 12) = 8 feet
- Rafter length = √(12² + 8²) = √(144 + 64) = √208 ≈ 14.42 feet

Add the overhang to this number. If the overhang is 16 inches (1.33 feet), the total rafter before the ridge cut is approximately 15.75 feet. Buy 16-foot stock.

## The pitch factor shortcut

You can also multiply the run by the pitch factor for your slope:

- 4/12 pitch factor: 1.054
- 6/12 pitch factor: 1.118
- 8/12 pitch factor: 1.202
- 10/12 pitch factor: 1.302
- 12/12 pitch factor: 1.414

Multiply run × pitch factor = rafter length (excluding overhang).

## Bird's mouth and ridge cut

The bird's mouth depth is typically a maximum of one-third of the rafter depth. The ridge cut angle matches the pitch — a 4/12 pitch cuts at roughly 18.4 degrees. A speed square handles this without any math.

## Practical takeaway

Run the math before you touch the saw. A quick calculation saves a trip to the lumber yard.

Use our [rafter length calculator](/calculators/framing/rafter-length) to get the number fast and generate a cut list.
    `,
  },
  {
    slug: 'understanding-roof-pitch',
    title: 'Roof Pitch Explained: Rise, Run, and Material Area',
    description: 'A simple breakdown of what roof pitch means and why it changes your real roofing area.',
    category: 'Roofing',
    date: 'January 28, 2025',
    content: `
## What 4/12 pitch means

Roof pitch is rise over run. A 4/12 roof rises 4 inches for every 12 inches of horizontal run. It is a common residential slope because it sheds water well without feeling especially steep.

## A quick pitch guide

- 2/12 to 3/12 is low slope.
- 4/12 to 6/12 is a common residential range.
- 7/12 and up starts to feel steep fast.

## Why the multiplier matters

The roof surface is larger than the flat footprint below it. That is why pitch changes the real shingle area.

The slope multiplier is:

√(1 + (pitch ÷ 12)²)

Some common examples:

- 4/12 pitch → multiplier 1.054
- 8/12 pitch → multiplier 1.202
- 12/12 pitch → multiplier 1.414

If the footprint is 1,000 square feet and the multiplier is 1.202, the sloped surface is about 1,202 square feet before waste.

## Measuring an existing roof

1. Hold a level so it stays horizontal.
2. Measure 12 inches along the level.
3. Measure the vertical rise at that 12-inch mark.

That rise number is the pitch.

Use our [pitch and slope calculator](/calculators/roofing/pitch-slope) to convert pitch into area and rafter-friendly numbers.
    `,
  },
  {
    slug: 'estimating-paint-coverage',
    title: 'Estimating Paint for a Room: Coverage, Coats, and Overage',
    description: 'How to calculate how much paint you need without overbuying by three gallons or running short on the second coat.',
    category: 'Finish',
    date: 'January 15, 2025',
    content: `
## The coverage rule

Most interior latex paints cover 350 to 400 square feet per gallon at one coat. That number comes from the manufacturer and assumes a smooth, primed surface with no heavy texture. On raw drywall, new wood, or porous surfaces, plan for less.

## Calculating wall area

Measure the perimeter of the room and multiply by the ceiling height. Subtract roughly 20 square feet for each standard door and 15 square feet for each window. That gives you the paintable wall area.

For a 12×14 room with 9-foot ceilings:
- Perimeter = (12+14) × 2 = 52 feet
- Wall area = 52 × 9 = 468 square feet
- Less one door and two windows = 468 − 20 − 30 = 418 square feet
- At 350 sq ft per gallon, one coat needs 1.2 gallons

## Two coats vs. one

Color changes and fresh drywall nearly always need two coats. Dark-to-light color changes sometimes need three. Budget accordingly — running out mid-wall on a second coat is a real problem because the dry edge will show.

## Primer matters

Priming bare drywall before the finish coat saves paint and produces a better result. A PVA drywall primer seals the surface so the finish coat goes on evenly instead of soaking into the paper.

## Don't forget the ceiling and trim

Ceilings are often a flat white, but they still need paint. Trim and doors get their own product — usually semi-gloss or gloss — and use less coverage per gallon because of the smaller surface area and more deliberate application.

## Practical takeaway

Calculate the area, pick your coat count, divide by coverage, and round up to the nearest gallon. Buying an extra quart is cheaper than a second trip to the paint store mid-job.

Use our [paint calculator](/calculators/interior/paint-gal) to get the gallons before you walk into the store.
    `,
  },
  {
    slug: 'choosing-insulation-r-value-by-climate',
    title: 'Choosing the Right R-Value for Your Climate Zone',
    description: 'Use the climate zone first, then choose the assembly that gets you there without creating air-sealing problems.',
    category: 'Insulation',
    date: 'January 10, 2025',
    content: `
## Start with the climate zone

Energy Star and DOE guidance group insulation targets by climate zone. In colder zones, attic targets commonly move into the R-49 to R-60 range, with stronger wall and floor requirements to match. Oneida, Herkimer, and Madison counties fall in Climate Zone 6.

## What changes as the climate gets colder

- Zones 1 and 2 usually start with lighter attic and wall targets.
- Zones 3 and 4 step up attic and floor insulation.
- Zones 5 through 8 typically call for the highest attic values and stronger wall assemblies.

Your local code and the exact assembly still control the final requirement, but climate zone is the right starting point.

## 2x4 walls vs 2x6 walls

A 2x4 wall gives you about 3.5 inches of cavity depth, which caps out around batt R-15. A 2x6 wall gives you 5.5 inches and more room for higher-R batts or mineral wool.

## Do not ignore air sealing

Installed R-value is only part of the story. A leaky assembly can underperform even if the nominal R-value looks good on paper. That is why contractors often pair fiber with careful air sealing, or use spray foam where depth is limited and leakage is hard to control.

## Cost comes second

Material pricing changes quickly, so compare the full assembly instead of chasing a single dollars-per-inch number. The right question is whether the assembly hits the code target, controls air leakage, and fits the framing you already have.

Use our [R-Value Tracker](/calculators/insulation/r-value-tracker) to size the assembly before you price it.
    `,
  },
]

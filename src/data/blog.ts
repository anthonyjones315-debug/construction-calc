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

Cubic yards = length x width x (thickness in inches / 12) / 27

If the slab is 10 feet by 10 feet and 4 inches thick, the base volume is 1.23 cubic yards before waste.

## Add waste before you order

Most slab pours need a little cushion for grade variation, uneven forms, and cleanup. For a straightforward slab, a 10 percent waste factor is a practical starting point. Footings, steps, and awkward pours usually need a bit more.

## Bags or ready-mix

Bagged concrete works best for patches, small pads, and jobs where access matters more than speed. Quikrete lists an 80-pound bag at about 0.6 cubic feet of yield, so bag counts climb quickly once the pour gets larger.

When you are getting close to a full yard, call the ready-mix supplier and confirm minimums, short-load charges, and the mix design the job requires. Those details vary by plant, so it is better to verify than rely on a rule of thumb.

## Field checklist

- Pull thickness from the plans, not memory.
- Confirm whether the slab needs air entrainment or another specific mix requirement.
- Order enough material to finish the pour in one shot.

Use our [slab calculator](/calculators/concrete/slab) to turn those dimensions into a clean material number.
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

On a 20-foot wall, moving from 16-inch spacing to 24-inch spacing drops the base count from about 16 studs to about 11 before corners, openings, and layout details. The savings are real, but so are the tradeoffs.

## Practical takeaway

Treat 16-inch spacing as the default unless the plans or engineer clearly support something else. If you want to frame at 24 inches on center, check the full wall system first: stud size, height, bracing, sheathing, drywall, and finish loads.

Use our [wall studs calculator](/calculators/framing/wall-studs) to compare the count before you order lumber.
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

sqrt(1 + (pitch / 12)^2)

Some common examples:

- 4/12 pitch -> multiplier 1.054
- 8/12 pitch -> multiplier 1.202
- 12/12 pitch -> multiplier 1.414

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
    slug: 'choosing-insulation-r-value-by-climate',
    title: 'Choosing the Right R-Value for Your Climate Zone',
    description: 'Use the climate zone first, then choose the assembly that gets you there without creating air-sealing problems.',
    category: 'Insulation',
    date: 'January 10, 2025',
    content: `
## Start with the climate zone

Energy Star and DOE guidance group insulation targets by climate zone, not by state name alone. In warmer zones, the attic recommendation can start around R-30 to R-49. In colder zones, attic targets commonly move into the R-49 to R-60 range, with stronger wall and floor requirements to match ([ENERGY STAR recommended home insulation R-values](https://www.energystar.gov/saveathome/seal_insulate/identify-problems-you-want-fix/diy-checks-inspections/insulation-r-values), as of March 17, 2026; for example, the current chart shows attic guidance ranging from R-30 in Zone 1 up to R-60 in Zones 4 through 8, depending on existing insulation levels).

## What changes as the climate gets colder

- Zones 1 and 2 usually start with lighter attic and wall targets.
- Zones 3 and 4 step up attic and floor insulation.
- Zones 5 through 8 typically call for the highest attic values and stronger wall assemblies.

Your local code and the exact assembly still control the final requirement, but climate zone is the right starting point.

## 2x4 walls vs 2x6 walls

A 2x4 wall gives you about 3.5 inches of cavity depth, which usually caps out around batt R-15. A 2x6 wall gives you about 5.5 inches of depth and more room for higher-R batts or mineral wool.

## Do not ignore air sealing

Installed R-value is only part of the story. A leakier assembly can underperform even if the nominal R-value looks good on paper. That is why contractors often pair fiber with careful air sealing, or use spray foam where depth is limited and leakage is hard to control.

## Cost comes second

Material pricing changes quickly, so compare the full assembly instead of chasing a single dollars-per-inch number. The right question is whether the assembly hits the code target, controls air leakage, and fits the framing you already have.

Use our [R-Value Tracker](/calculators/insulation/r-value-tracker) to size the assembly before you price it.
    `,
  },
]

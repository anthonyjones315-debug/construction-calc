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
    title: 'How to Calculate Concrete for a Slab (The Right Way)',
    description: 'Most DIYers underorder concrete and end up making a second trip to the supply yard. Here\'s how to nail your estimate the first time.',
    category: 'Concrete',
    date: 'March 1, 2025',
    content: `
## Why Concrete Estimates Go Wrong

The most common mistake is forgetting two things: the thickness is in inches, not feet — and you always need to order extra. Concrete can't be returned once mixed, but running short mid-pour is a disaster.

## The Formula

Volume (cubic yards) = Length × Width × (Thickness ÷ 12) ÷ 27

A 10×10 slab at 4" thick = 10 × 10 × (4/12) ÷ 27 = **1.23 cubic yards**

Always add **10% waste** for a standard slab. For footings or steps, add 15%.

## Bags vs. Ready-Mix

- **Under 1 cubic yard**: use bags. An 80lb bag yields about 0.6 cubic feet.
- **Over 1 yard**: call the ready-mix plant. Typical minimum delivery is 1 yard.

## Pro Tips

- Order ready-mix in 0.5 yard increments — that's how most plants price it
- Ask for **3,000 PSI mix** for standard slabs, **4,000 PSI** for driveways
- Fiber-reinforced mix reduces crack risk without needing wire mesh
- In cold weather, add air-entrainment admixture and cover with insulated blankets

Our [concrete calculator](/  ) handles all of this automatically — just plug in your dimensions.
    `,
  },
  {
    slug: 'stud-spacing-16-vs-24-inch',
    title: '16" vs 24" Stud Spacing: Which Should You Use?',
    description: 'The answer depends on your load, your sheathing, and your local code. Here\'s the breakdown contractors actually use.',
    category: 'Framing',
    date: 'February 15, 2025',
    content: `
## The Short Answer

- **16" OC**: Use for load-bearing walls, walls over 8 feet tall, and any wall getting tile or heavy stone finish
- **24" OC**: Fine for non-load-bearing partition walls, garage walls, and where you want to cut material cost

## Why It Matters for Your Material Count

Going from 16" to 24" OC on a 20-foot wall drops your stud count from 16 to 11 — that's 5 fewer studs per wall. On a full house addition, this adds up fast.

## Code Considerations

Most jurisdictions follow IRC Table R602.3. Key rules:

- 2×4 at 16" OC: max 10-foot wall height for load-bearing
- 2×4 at 24" OC: max 8-foot for load-bearing (some codes restrict this entirely)
- 2×6 at 24" OC: allowed in many energy codes for exterior walls (gives room for R-19 batt)

## Sheathing Note

If you're using OSB or plywood sheathing, 24" OC requires **7/16" OSB minimum**. At 16" OC you can use thinner panels, but 7/16" is standard either way.

## Our Recommendation

Default to **16" OC** for any exterior wall or anything structural. Save 24" OC for interior partitions where you want to reduce cost and the wall is under 8 feet tall.

Use our [framing calculator](/) to compare stud counts side by side.
    `,
  },
  {
    slug: 'understanding-roof-pitch',
    title: 'Roof Pitch Explained: From Rise/Run to Slope Multiplier',
    description: 'What 4/12 actually means, how to measure pitch on an existing roof, and why the slope multiplier matters for material estimates.',
    category: 'Roofing',
    date: 'January 28, 2025',
    content: `
## What Does "4/12 Pitch" Mean?

Roof pitch is expressed as rise over run. **4/12 means the roof rises 4 inches for every 12 inches of horizontal run.** That's a fairly common residential pitch — walkable, good drainage, not too steep.

## The Pitch Categories

| Pitch | Description | Walkable? |
|-------|-------------|-----------|
| 2/12–3/12 | Low slope | Easy |
| 4/12–6/12 | Standard | Yes |
| 7/12–9/12 | Steep | Careful |
| 10/12+ | Very steep | Harness required |

## The Slope Multiplier

Here's what most homeowners miss: **a pitched roof covers more area than the flat footprint.** You can't just multiply length × width and call it your roofing area.

The slope multiplier = √(1 + (pitch/12)²)

- 4/12 pitch → multiplier = **1.054** (5.4% more material than flat area)
- 8/12 pitch → multiplier = **1.202** (20% more)
- 12/12 pitch → multiplier = **1.414** (41% more — a 45° roof)

## How to Measure Existing Pitch

You need an 18" level and a tape measure:
1. Hold the level horizontal against the roof
2. Measure 12" in from one end horizontally
3. Measure the vertical distance at that 12" mark — that's your rise

Our [roof pitch calculator](/) does this math instantly, including rafter length.
    `,
  },
  {
    slug: 'choosing-insulation-r-value-by-climate',
    title: 'Choosing the Right R-Value for Your Climate Zone',
    description: 'R-30 in Florida is overkill. R-19 in Minnesota is not enough. Here\'s the DOE recommendation by zone, plus what it means for material costs.',
    category: 'Insulation',
    date: 'January 10, 2025',
    content: `
## DOE Climate Zone R-Value Recommendations

| Zone | States (Examples) | Attic | Walls | Crawlspace |
|------|-------------------|-------|-------|-----------|
| 1–2 | FL, HI, TX south | R-30 | R-13 | R-13 |
| 3 | GA, AL, AZ | R-38 | R-13–15 | R-19 |
| 4 | VA, MO, NM | R-49 | R-13–21 | R-25 |
| 5 | OH, PA, CO | R-49 | R-15–21 | R-25 |
| 6–7 | MN, WI, MT | R-60 | R-21+ | R-25–30 |

## Wall Insulation: 2×4 vs 2×6 Framing

- **2×4 framing** gives you 3.5" of cavity depth → max R-15 with batt
- **2×6 framing** gives you 5.5" → up to R-21 with batt, or R-23 with mineral wool

In climate zones 5+, 2×6 framing for exterior walls is worth the extra cost.

## Spray Foam vs. Batt: When to Upgrade

Batt insulation is cheaper but requires an air barrier. Spray foam **is** the air barrier — it seals gaps, rim joists, and penetrations that batt misses.

In crawlspaces and rim joist areas, closed-cell spray foam at 2" (R-13) outperforms R-19 batt in a leaky space.

## Cost Rule of Thumb

- Fiberglass batt: **$0.75–1.25/sq ft installed**
- Closed-cell spray foam: **$1.50–3.00/bd ft**
- Blown cellulose (attic): **$1.00–2.00/sq ft**

Use our [insulation calculator](/) to get your exact bag or board-foot count.
    `,
  },
]

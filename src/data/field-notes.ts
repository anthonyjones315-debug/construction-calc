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
];

export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  return FIELD_NOTES.find((n) => n.slug === slug);
}

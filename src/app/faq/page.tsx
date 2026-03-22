import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  JsonLD,
  getFAQSchema,
  getBreadcrumbSchema,
  getPageMetadata,
} from "@/seo";
import { FAQAccordion } from "./FaqAccordion";

export const metadata: Metadata = getPageMetadata({
  title: "FAQ | Pro Construction Calc",
  description:
    "Frequently asked questions about Pro Construction Calc construction calculators.",
  path: "/faq",
});

const FAQ_ITEMS = [
  {
    q: "Are these construction calculators free?",
    a: "Yes. The calculators are free to use, and you do not need an account for the core tools. Create a free account if you want saved estimates and workspace features.",
  },
  {
    q: "How accurate are the estimates?",
    a: "Our calculators use standard construction formulas based on common field practice and material yields. Results are planning numbers, not permit-set guarantees, so always verify against the plans, supplier data, site conditions, and local code before ordering.",
  },
  {
    q: "What is a waste factor and should I use it?",
    a: "Waste factor accounts for cuts, damaged pieces, and offcuts from standard material sizes. For most projects, 10% is standard. For complex cuts (diagonal flooring, hip roofs) use 15%. For simple rectangular work you can use 5%. We recommend always including waste to avoid running short.",
  },
  {
    q: "What does the AI Optimizer do?",
    a: "The AI Optimizer reviews your calculator results and returns short, practical suggestions on waste, material choices, staging, and common misses to double-check. It runs on Anthropic and is meant as a planning assistant, not a final code or engineering decision.",
  },
  {
    q: "How does AI help with real jobs, not just theory?",
    a: "Our AI tools are aimed at working contractors. After you run a calculator, the AI Optimizer can help turn the result into cleaner supplier notes, scope language, staging reminders, and a shortlist of things worth verifying before you buy or bid.",
  },
  {
    q: "Can AI draft a scope of work or proposal language?",
    a: "Yes. Once you have calculator results, you can ask the AI Optimizer to generate scoped work notes, inclusions/exclusions, and homeowner-friendly explanations based on your inputs. You stay in control: review and edit the text before sending it to a client or dropping it into your estimating software.",
  },
  {
    q: "Does the AI understand tri-county job conditions?",
    a: "It can work with the local context you give it and with the guidance we publish in Field Notes for Oneida, Madison, and Herkimer counties, but it is still guidance, not a stamped engineering design or code ruling. Confirm critical values with the plans, building department, or engineer before you commit.",
  },
  {
    q: "Is my project data used to train public AI models?",
    a: "No. Calculator inputs and AI prompts are used to run your session and improve Pro Construction Calc, but they are not used to train public foundation models. See our Privacy Policy and Terms for full details, including how we handle saved estimates and AI usage logs.",
  },
  {
    q: "How do I export a PDF estimate?",
    a: "Use Export PDF for a quick download. If you sign in, you can also save estimates to your account and come back to them later. Every PDF should still be treated as a planning estimate and verified before ordering materials or starting work.",
  },
  {
    q: "Can I save estimates for later?",
    a: "Yes. Signed-in users can save estimates to their account and access them from any device. This feature is in beta and being actively improved.",
  },
  {
    q: 'What does "roofing squares" mean?',
    a: "One roofing square = 100 square feet of roof area. Shingles are sold by the square (3 bundles per square for standard 3-tab and architectural shingles). Our roofing calculators convert square footage to squares automatically.",
  },
  {
    q: "How do I calculate concrete for a curved or irregular area?",
    a: "Break the area into rectangles or use the formula for circles (π × radius²). Calculate each section separately and add them together, then enter the total area into our concrete calculator. Add at least 10% waste for irregular shapes.",
  },
  {
    q: "What wire gauge do I need for a 20-amp circuit?",
    a: "12 AWG copper is the usual NEC minimum for a 20-amp branch circuit. On longer runs, voltage drop can justify upsizing, so 10 AWG is a common next step when the distance grows or the load is sensitive.",
  },
  {
    q: "Is my data private?",
    a: "Yes. We collect only what's needed to run the app. See our Privacy Policy for full details. We never sell your data.",
  },
  {
    q: "What waste factor should I use for framing lumber?",
    a: "For standard wall framing use 10–15%. Hip and valley roofs, complex stair framing, or layouts with lots of corners and headers push toward 15–20%. Simple gable roofs or long straight runs can use 10%. When in doubt, round up — lumber is cheaper than a second delivery.",
  },
  {
    q: "How do I calculate how many sheets of drywall I need?",
    a: "Multiply the total wall and ceiling square footage by 1.10 (10% waste). Divide by the sheet size you're using — typically 32 sq ft for a 4×8 sheet. Our drywall calculator handles this automatically and accounts for door and window deductions.",
  },
  {
    q: "What is a good profit margin for a contractor estimate?",
    a: "Most residential contractors target 15–25% gross margin (the difference between your selling price and direct job costs). Specialty and commercial work often runs 20–35%. Use the Profit Margin calculator to find the markup multiplier that gets you to your target margin — markup and margin are not the same number.",
  },
  {
    q: "How do I estimate labor hours for a framing job?",
    a: "A common starting point: one experienced framer can install roughly 300–400 linear feet of wall plate per day on a straightforward residential project. Complex rooflines, tall walls, or engineered lumber slow that number. Use the Labor Rate calculator to convert your hour estimate into a dollar figure based on your burdened rate.",
  },
  {
    q: "Can I use these calculators for commercial jobs?",
    a: "Yes — the math is the same. The calculators are built for residential field speed but the formulas (slab volumes, rafter geometry, shingle quantities) apply to light commercial work too. For large commercial projects, treat the outputs as cross-checks against your estimating software, not as the primary quantity source.",
  },
  {
    q: "How do I figure out roof pitch from rise and run?",
    a: "Pitch = rise ÷ run, expressed as X-in-12. If your roof rises 6 inches for every 12 inches of horizontal run, that is a 6/12 pitch. Use the Roof Pitch calculator to convert between pitch, slope angle, and multiplier so you can calculate rafter lengths and total roof area.",
  },
  {
    q: "What is the difference between margin and markup?",
    a: "Margin is profit as a percentage of your selling price. Markup is profit as a percentage of your cost. A 25% margin requires a 33.3% markup. They are not interchangeable — confusing them is one of the most common reasons contractors underprice jobs. Use our Profit Margin calculator to see both at once.",
  },
  {
    q: "Do these calculators work offline?",
    a: "Yes. Once the app has loaded in your browser, the core calculators continue to work without an internet connection. Saved estimates and PDF export require a connection to sync, but you can run quantities and view results offline from the job site.",
  },
  {
    q: "How many cubic yards of mulch do I need?",
    a: "Multiply your bed area (length × width in feet) by the depth in inches, then divide by 324 to get cubic yards. At 3 inches deep, 100 square feet of bed takes about 0.93 cubic yards. Order 10% extra for settling. Use our Mulch Calculator to get an exact number with waste factored in.",
  },
  {
    q: "What depth should mulch be?",
    a: "For most garden beds, 2–3 inches is standard for weed suppression and moisture retention. Tree rings should be 3–4 inches but kept 6 inches away from the trunk. Erosion control on slopes needs 4 inches minimum. Going deeper than 4 inches can smother root systems and trap excess moisture.",
  },
  {
    q: "How do I estimate fence materials?",
    a: "Divide the total linear footage by your post spacing (usually 8 feet), then add one to get your post count. Each section between posts needs 2 horizontal rails (3 for fences over 6 feet). For pickets, divide the section width in inches by 4 (3.5-inch picket plus 0.5-inch gap). Add 10% waste. Use our Fence Calculator for a complete material list.",
  },
  {
    q: "How much gravel do I need for a patio base?",
    a: "Patio bases need 4 inches of compacted crushed stone minimum (6 inches for vehicle traffic). To calculate: multiply the area in square feet by the depth in inches, divide by 324 for cubic yards, then multiply by 1.4 to convert to tons — since gravel suppliers sell by the ton. Use our Gravel & Stone Calculator for exact tonnage.",
  },
  {
    q: "Asphalt vs concrete for driveways — which is better?",
    a: "In Upstate New York, asphalt is cheaper upfront ($3–$6/sq ft) and flexes with freeze-thaw cycles, but needs seal coating every 3–5 years. Concrete costs more ($6–$12/sq ft) but lasts 20–30 years with almost no maintenance when the base is done right. Choose asphalt for budget or long driveways; choose concrete for longevity and low maintenance.",
  },
  {
    q: "How do I calculate paver quantities?",
    a: "Divide the patio area in square feet by the coverage of a single paver. A standard 4×8 inch brick paver covers 0.222 sq ft, so a 100 sq ft patio needs about 450 pavers before waste. Add 10% for running bond patterns and 15% for herringbone or diagonal patterns. Use our Paver Patio Calculator for pavers, sand, and gravel base quantities.",
  },
  {
    q: "Do the outdoor calculators account for local conditions?",
    a: "Yes. Our fence calculator uses the NYS frost line depth of 48 inches below grade for post depth in the tri-county area. Patio and driveway calculators use base depth minimums appropriate for Upstate New York freeze-thaw conditions. Always verify against site-specific soil and drainage conditions before ordering.",
  },
];

export default function FAQPage() {
  return (
    <div className="command-theme page-shell flex min-h-dvh flex-col">
      <Header />
      <JsonLD schema={getFAQSchema(FAQ_ITEMS)} />
      <JsonLD schema={getBreadcrumbSchema([{ name: "FAQ", href: "/faq" }])} />
      <main id="main-content" className="viewport-main">
        <div className="viewport-frame max-w-6xl">
          {/* Breadcrumb nav */}
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-2 text-[11px] text-[--color-nav-text]/60"
          >
            <Link
              href="/"
              className="transition-colors hover:text-[--color-orange-brand]"
            >
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-[--color-nav-text]">FAQ</span>
          </nav>

          <div className="dark-feature-panel p-4 text-[--color-ink]">
            <p className="section-kicker">Field answers</p>
            <h1 className="mt-1.5 text-2xl font-display font-bold">
              Frequently Asked Questions
            </h1>
            <p className="mt-1.5 text-sm text-[--color-ink-mid]">
              Everything you need to know about Pro Construction Calc.
            </p>
            <div className="trim-nav-border mt-3 inline-flex rounded-full border bg-[--color-surface-alt] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--color-ink]">
              Practical answers for real jobs
            </div>
          </div>

          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

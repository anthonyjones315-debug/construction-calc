import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getFAQSchema } from "@/seo";

export const metadata: Metadata = {
  title: "FAQ | Pro Construction Calc",
  description:
    "Frequently asked questions about Pro Construction Calc construction calculators.",
};

const FAQ_ITEMS = [
  {
    q: "Are these construction calculators free?",
    a: "Yes. All calculators on Pro Construction Calc are completely free to use. No account required for basic use. Create a free account to unlock PDF export and saved estimates.",
  },
  {
    q: "How accurate are the estimates?",
    a: "Our calculators use standard construction formulas based on industry practices and material yields. Results are estimates for planning purposes — actual quantities may vary based on site conditions, material dimensions, installation patterns, and local code requirements. Always verify with your contractor or supplier before purchasing.",
  },
  {
    q: "What is a waste factor and should I use it?",
    a: "Waste factor accounts for cuts, damaged pieces, and offcuts from standard material sizes. For most projects, 10% is standard. For complex cuts (diagonal flooring, hip roofs) use 15%. For simple rectangular work you can use 5%. We recommend always including waste to avoid running short.",
  },
  {
    q: "What does the AI Optimizer do?",
    a: "The AI Optimizer analyzes your calculator results and provides specific cost-saving tips, Good/Better/Best material tier recommendations, waste reduction strategies, and buying tips. It uses Claude AI (Anthropic) and is free to use.",
  },
  {
    q: "How do I export a PDF estimate?",
    a: "Use Export PDF for a quick download, or sign in with Google to save estimates to your account before downloading. Every PDF should be treated as a planning estimate and verified before ordering materials or starting work.",
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
    a: "12 AWG copper wire is the NEC minimum for a 20-amp circuit at standard residential voltages. Our wire gauge calculator factors in voltage drop for long runs — for distances over 75 feet, you may want to upsize to 10 AWG.",
  },
  {
    q: "Is my data private?",
    a: "Yes. We collect only what's needed to run the app. See our Privacy Policy for full details. We never sell your data.",
  },
];

export default function FAQPage() {
  return (
    <div className="command-theme page-shell flex min-h-screen flex-col">
      <Header />
      <JsonLD schema={getFAQSchema(FAQ_ITEMS)} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="dark-feature-panel mb-8 p-6 text-white">
            <p className="section-kicker">Field answers</p>
            <h1 className="mt-2 text-3xl font-display font-bold">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-[--color-nav-text]/70">
              Everything you need to know about Pro Construction Calc.
            </p>
            <div className="trim-nav-border mt-4 inline-flex rounded-full border bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
              Practical answers for real jobs
            </div>
          </div>

          <div className="content-card mb-8 overflow-hidden">
            <Image
              src="/images/safety-estimate.svg"
              alt="Hard hat and checklist representing practical estimating guidance"
              width={1200}
              height={700}
              className="w-full h-44 object-cover"
            />
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group content-card overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-semibold text-[--color-ink] hover:text-[--color-orange-brand] transition-colors select-none">
                  {item.q}
                  <span className="text-[--color-ink-dim] group-open:rotate-45 transition-transform text-xl leading-none ml-4 shrink-0">
                    +
                  </span>
                </summary>
                <div className="trim-border-strong border-t px-6 pb-5 pt-4 text-sm leading-relaxed text-[--color-ink-mid]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

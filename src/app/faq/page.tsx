import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLD, getFAQSchema, getPageMetadata } from "@/seo";

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
];

export default function FAQPage() {
  return (
    <div className="command-theme page-shell flex min-h-dvh flex-col">
      <Header />
      <JsonLD schema={getFAQSchema(FAQ_ITEMS)} />
      <main id="main-content" className="viewport-main">
        <div className="viewport-frame max-w-6xl">
          <div className="dark-feature-panel p-4 text-white">
            <p className="section-kicker">Field answers</p>
            <h1 className="mt-1.5 text-2xl font-display font-bold">
              Frequently Asked Questions
            </h1>
            <p className="mt-1.5 text-sm text-[--color-nav-text]/70">
              Everything you need to know about Pro Construction Calc.
            </p>
            <div className="trim-nav-border mt-3 inline-flex rounded-full border bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--color-nav-text]">
              Practical answers for real jobs
            </div>
          </div>

          <div className="grid min-h-0 gap-3 md:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group content-card overflow-hidden"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-sm font-semibold text-[--color-ink] hover:text-[--color-orange-brand] transition-colors select-none">
                  {item.q}
                  <span className="ml-3 shrink-0 text-lg leading-none text-[--color-ink-dim] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="trim-border-strong border-t px-4 pb-4 pt-3 text-[13px] leading-relaxed text-[--color-ink-mid]">
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

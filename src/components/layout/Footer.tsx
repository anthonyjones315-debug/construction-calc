import Link from 'next/link'
import { HardHat } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[--color-nav-bg] border-t border-white/10 text-[--color-nav-text] text-sm">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-display font-bold text-lg mb-3">
              <HardHat className="w-5 h-5 text-[--color-orange-brand]" />
              BUILD CALC PRO
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Free construction calculators built for contractors and DIYers.
            </p>
          </div>

          <div>
            <p className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-3">Calculators</p>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/?calc=concrete" className="hover:text-white transition-colors">Concrete</Link></li>
              <li><Link href="/?calc=framing" className="hover:text-white transition-colors">Framing</Link></li>
              <li><Link href="/?calc=roofing" className="hover:text-white transition-colors">Roofing</Link></li>
              <li><Link href="/?calc=insulation" className="hover:text-white transition-colors">Insulation</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-3">Resources</p>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-3">Legal</p>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
            <p className="text-xs text-white/30 mt-4 leading-relaxed">
              Results are estimates only. Always consult a licensed contractor.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">
            &copy; {year} Build Calc Pro. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Material prices are estimates. Verify with local suppliers.
          </p>
        </div>
      </div>
    </footer>
  )
}

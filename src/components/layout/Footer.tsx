import Link from 'next/link'
import { HardHat } from 'lucide-react'
import { CookiePreferencesButton } from '@/components/layout/CookiePreferencesButton'

export function Footer() {
  return (
    <footer className="bg-[--color-nav-bg] border-t border-white/10 text-[#9ca3af] text-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-white font-display font-bold text-lg mb-3">
              <HardHat className="w-5 h-5 text-[--color-orange-brand]" aria-hidden />
              BUILD CALC PRO
            </div>
            <p className="text-xs leading-relaxed">
              Free professional construction calculators for contractors and serious DIYers.
              Based in Central New York.
            </p>
          </div>

          {/* Calculators */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Calculators</p>
            <div className="space-y-2">
              {[
                { href: '/calculators?c=concrete',  label: 'Concrete' },
                { href: '/calculators?c=framing',   label: 'Framing' },
                { href: '/calculators?c=roofing',   label: 'Roofing' },
                { href: '/calculators?c=insulation',label: 'Insulation' },
                { href: '/calculators?c=flooring',  label: 'Flooring' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Account</p>
            <div className="space-y-2">
              {[
                { href: '/auth/signin', label: 'Sign In' },
                { href: '/saved',       label: 'Saved Estimates' },
                { href: '/pricebook',   label: 'Price Book' },
                { href: '/settings',    label: 'Business Profile' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Company</p>
            <div className="space-y-2">
              {[
                { href: '/blog',    label: 'Blog' },
                { href: '/faq',     label: 'FAQ' },
                { href: '/about',   label: 'About' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms of Service' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © {new Date().getFullYear()} Build Calc Pro. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Calculator outputs are for estimating purposes only. Verify quantities, site conditions, and local code before ordering or building.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  )
}

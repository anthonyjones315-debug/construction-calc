'use client'
import { SessionProvider } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { SplashPopup } from '@/components/ui/SplashPopup'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

// Lazy-load each calculator panel
const ConcreteCalc       = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.ConcreteCalc })))
const FramingCalc        = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.FramingCalc })))
const RoofingCalc        = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.RoofingCalc })))
const RoofPitchCalc      = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.RoofPitchCalc })))
const RoofingSquaresCalc = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.RoofingSquaresCalc })))
const RaftersCalc        = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.RaftersCalc })))
const FlooringCalc       = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.FlooringCalc })))
const InsulationCalc     = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.InsulationCalc })))
const SprayFoamCalc      = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.SprayFoamCalc })))
const CelluloseCalc      = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.CelluloseCalc })))
const SidingCalc         = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.SidingCalc })))
const PaintCalc          = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.PaintCalc })))
const WireGaugeCalc      = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.WireGaugeCalc })))
const LaborCalc          = dynamic(() => import('@/components/calculator/Calculators').then(m => ({ default: m.LaborCalc })))
const BudgetCalc         = dynamic(() => import('@/components/calculator/BudgetCalc').then(m => ({ default: m.BudgetCalc })))

function CalcRouter() {
  const { activeCalculator } = useStore()

  const map: Record<string, React.ComponentType> = {
    concrete: ConcreteCalc,
    framing: FramingCalc,
    roofing: RoofingCalc,
    roofPitch: RoofPitchCalc,
    roofingSquares: RoofingSquaresCalc,
    rafters: RaftersCalc,
    flooring: FlooringCalc,
    insulation: InsulationCalc,
    sprayfoam: SprayFoamCalc,
    cellulose: CelluloseCalc,
    siding: SidingCalc,
    paint: PaintCalc,
    wireGauge: WireGaugeCalc,
    labor: LaborCalc,
    budget: BudgetCalc,
  }

  const Component = map[activeCalculator]
  return Component ? <Component /> : null
}

function AppShell() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, shown on md+ */}
        <div className="hidden md:block h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <CalcRouter />
          </div>
        </main>
      </div>
      <Footer />
      <SplashPopup />
    </div>
  )
}

export default function Home() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  )
}

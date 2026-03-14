import { NextResponse } from 'next/server'
import { MARKET_PRICES_BASE } from '@/data'
import type { MarketPrices } from '@/types'

// This endpoint returns current market prices.
// In Phase 2, this will fetch live prices from Supabase user_materials or an external source.
// For now it returns the base prices so BudgetCalc can refresh without reloading the page.

export async function POST() {
  try {
    // Future: query Supabase for user's custom price book and merge with base prices
    // const session = await auth()
    // if (session?.user?.id) { /* fetch user_materials from Supabase */ }

    const prices: MarketPrices = { ...MARKET_PRICES_BASE }

    return NextResponse.json({ prices })
  } catch (err) {
    console.error('Prices update error:', err)
    return NextResponse.json({ error: 'Failed to fetch prices.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { MARKET_PRICES_BASE } from '@/data'

export async function POST() {
  // In production, this could call a pricing API or Claude to estimate current prices.
  // For now returns base prices with a small random variance to simulate live updates.
  const updated = Object.fromEntries(
    Object.entries(MARKET_PRICES_BASE).map(([k, v]) => {
      const variance = 0.9 + Math.random() * 0.2 // ±10%
      return [k, { ...v, price: parseFloat((v.price * variance).toFixed(2)) }]
    })
  )
  return NextResponse.json({ prices: updated })
}

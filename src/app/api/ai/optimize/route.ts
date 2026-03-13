import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { calculatorId, results, context } = await req.json() as {
      calculatorId: string
      results: string
      context?: string
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        system: `You are a professional construction estimator and material optimizer for Build Calc Pro.
Given calculator results, provide concise, actionable advice in 3–5 bullet points:
• Cost-saving opportunities specific to these numbers
• Material quality tiers (Good/Better/Best) where relevant
• Common waste reduction tips for this trade
• One local sourcing or buying tip

Keep it practical, contractor-grade language. Use markdown bullet points. No fluff.`,
        messages: [
          {
            role: 'user',
            content: `Calculator: ${calculatorId}\nResults:\n${results}${context ? `\n\nContext: ${context}` : ''}`,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Claude API error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> }
    const text = data.content.find(b => b.type === 'text')?.text ?? ''

    return NextResponse.json({ content: text })
  } catch (err) {
    console.error('Optimize route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

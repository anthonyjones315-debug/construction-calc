import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// Simple in-memory rate limiter: 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 5) return false

  entry.count++
  return true
}

// Sanitize output to prevent XSS in markdown rendering
function sanitize(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

interface RequestBody {
  calculatorId?: string
  results?: string
  context?: string
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured.' },
      { status: 503 }
    )
  }

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { calculatorId, results, context } = body

  if (!calculatorId || !results) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const contextLine = context ? `\nAdditional context: ${context}` : ''
  const prompt = `You are a professional construction estimator AI assistant. A contractor just ran a ${calculatorId} calculation. Analyze the results and provide 3-5 brief, practical tips to optimize their project. Be specific, actionable, and field-ready. Use markdown for formatting.

Calculator: ${calculatorId}
Results:
${results}${contextLine}

Provide tips on: material optimization, waste reduction, cost savings, and common mistakes to avoid. Keep each tip to 1-2 sentences. Total response under 200 words.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Use a stable, currently supported fast model.
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'AI service temporarily unavailable.' }, { status: 502 })
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
    }

    const content = sanitize(data.content?.[0]?.text ?? '')

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI.' }, { status: 502 })
    }

    return NextResponse.json({ content })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

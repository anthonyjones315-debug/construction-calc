import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createServerClient } from '@/lib/supabase/server'

const BUCKET = 'business_logos'
const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('logo') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Logo must be under 2MB' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Please upload a PNG, JPG, WebP, SVG, or GIF' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${session.user.id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const db = createServerClient()
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type })

  if (error) {
    console.error('Logo upload error:', error.message)
    return NextResponse.json({ error: 'Upload failed — make sure the business_logos bucket exists in Supabase Storage.' }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ ok: true, url: publicUrl })
}

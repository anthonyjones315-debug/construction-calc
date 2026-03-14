'use client'
export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { BusinessProfile } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Building2, Phone, Mail, MapPin, Globe, Upload, Save, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

function SettingsContent() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) { setLoading(false); return }
    fetch('/api/business-profile')
      .then(r => r.json())
      .then(({ profile: p }) => { if (p) setProfile(p) })
      .finally(() => setLoading(false))
  }, [session, status])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be under 2MB'); return }
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }

    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('logo', file)
      const res = await fetch('/api/business-profile/logo', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      setProfile(p => ({ ...p, logo_url: json.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logo upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user?.id) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/business-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <LogIn className="w-10 h-10 text-[--color-orange-brand] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[--color-ink] mb-2">Sign in to manage your business profile</h1>
        <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-[--color-orange-brand] text-white font-bold px-6 py-3 rounded-xl">Sign In Free</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-display font-bold text-[--color-ink] mb-1">Business Profile</h1>
      <p className="text-sm text-[--color-ink-dim] mb-8">This info appears on your exported PDF estimates.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo */}
        <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-ink-dim] mb-4">Company Logo</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-[--color-surface-alt] overflow-hidden shrink-0">
              {profile.logo_url
                ? <img src={profile.logo_url} alt="Business logo" className="w-full h-full object-contain p-1" />
                : <Building2 className="w-8 h-8 text-[--color-ink-dim]" />
              }
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm font-medium border border-gray-200 hover:border-[--color-orange-brand] text-[--color-ink-mid] hover:text-[--color-orange-brand] px-4 py-2 rounded-lg transition-all"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </button>
              <p className="text-xs text-[--color-ink-dim] mt-1">PNG, JPG or SVG — max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-ink-dim] mb-2">Contact Info</h2>

          {[
            { field: 'business_name',    label: 'Business Name',   icon: Building2, placeholder: 'Acme Construction LLC' },
            { field: 'business_phone',   label: 'Phone',           icon: Phone,     placeholder: '(315) 555-0100' },
            { field: 'business_email',   label: 'Email',           icon: Mail,      placeholder: 'info@yourbusiness.com', type: 'email' },
            { field: 'business_address', label: 'Address',         icon: MapPin,    placeholder: '123 Main St, Rome, NY 13440' },
            { field: 'business_website', label: 'Website',         icon: Globe,     placeholder: 'https://yourbusiness.com', type: 'url' },
          ].map(({ field, label, icon: Icon, placeholder, type }) => (
            <div key={field}>
              <label className="text-sm font-medium text-[--color-ink-mid] flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" aria-hidden /> {label}
              </label>
              <input
                type={type ?? 'text'}
                value={(profile as Record<string, string>)[field] ?? ''}
                onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[--color-surface-alt] text-sm text-[--color-ink] focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold py-3 rounded-xl transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg]">
      <Header />
      <main id="main-content" className="flex-1"><SettingsContent /></main>
      <Footer />
    </div>
  )
}

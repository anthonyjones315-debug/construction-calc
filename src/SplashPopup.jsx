import { useState, useEffect } from 'react'

const C = {
  surface: '#ffffff', border: '#d9d4c7', borderLight: '#c4bfb4',
  accent: '#e8820c', accentDark: '#c96d08', accentSoft: 'rgba(232,130,12,0.10)',
  text: '#1a1a1a', textMid: '#555248', textDim: '#8c887f',
  surfaceAlt: '#f9f7f3',
}
const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif"
const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif"

const ENDPOINT = 'https://formspree.io/f/xyknwlrz'
const STORAGE_KEY = 'bcp_splash_dismissed'
const DELAY_MS = 3000

export default function SplashPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        localStorage.setItem(STORAGE_KEY, '1')
        setTimeout(() => setVisible(false), 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (!visible) return null

  return (
    <>
      <div onClick={dismiss} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 999,
        animation: 'splashFadeIn 0.2s ease',
      }} />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%', maxWidth: '440px',
        background: C.surface,
        border: '2px solid ' + C.border,
        borderRadius: '14px',
        padding: '36px 32px',
        fontFamily: font,
        animation: 'splashSlideUp 0.25s ease',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>

        <button onClick={dismiss} style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>✕</button>

        {/* Orange top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: C.accent, borderRadius: '14px 14px 0 0',
        }} />

        <div style={{
          width: '48px', height: '48px', borderRadius: '10px',
          background: C.accentSoft, border: '2px solid ' + C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', marginBottom: '18px',
        }}>🔨</div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.text, marginBottom: '8px', letterSpacing: '0.5px' }}>YOU'RE IN!</div>
            <div style={{ fontSize: '14px', color: C.textMid }}>We'll let you know when new calculators drop.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: fontDisplay, fontSize: '24px', fontWeight: '700', color: C.text, marginBottom: '10px', lineHeight: '1.2', letterSpacing: '0.5px' }}>
              NEW CALCULATORS DROPPING SOON
            </div>
            <div style={{ fontSize: '14px', color: C.textMid, lineHeight: '1.6', marginBottom: '24px' }}>
              HVAC, deck, stair stringer, and more. Drop your email and we'll let you know when they're live — no spam, just new tools.
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%', padding: '12px 14px',
                  background: C.surfaceAlt, border: '2px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '15px',
                  fontFamily: font, marginBottom: '12px',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <button type="submit" disabled={status === 'sending'} style={{
                width: '100%', padding: '14px',
                background: C.accent, color: '#fff',
                border: 'none', borderRadius: '8px',
                fontFamily: fontDisplay, fontSize: '16px', fontWeight: '700',
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
                marginBottom: '12px', opacity: status === 'sending' ? 0.7 : 1,
              }}>
                {status === 'sending' ? 'Sending...' : 'Keep Me Updated →'}
              </button>

              {status === 'error' && (
                <div style={{ fontSize: '13px', color: '#c0392b', textAlign: 'center', marginBottom: '8px' }}>
                  Something went wrong. Try again.
                </div>
              )}
            </form>

            <button onClick={dismiss} style={{
              width: '100%', padding: '10px',
              background: 'none', border: 'none',
              color: C.textDim, fontSize: '13px',
              fontFamily: font, cursor: 'pointer',
            }}>
              No thanks
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes splashFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes splashSlideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  )
}

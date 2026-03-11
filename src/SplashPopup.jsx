import { useState, useEffect } from 'react'

const C = {
  bg: '#111318', surface: '#1c1f2b', surfaceAlt: '#23273a',
  border: '#2e3347', accent: '#f59e0b', accentDark: '#d97706',
  accentSoft: 'rgba(245,158,11,0.12)', text: '#f0efe8',
  textMid: '#9ca3af', textDim: '#6b7280',
}
const font = "'Inter', 'Segoe UI', system-ui, sans-serif"

const ENDPOINT = 'https://formspree.io/f/xyknwlrz'
const STORAGE_KEY = 'bcp_splash_dismissed'
const DELAY_MS = 3000

export default function SplashPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error

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
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 999,
        animation: 'fadeIn 0.2s ease',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%', maxWidth: '440px',
        background: C.surface,
        border: '1px solid ' + C.border,
        borderRadius: '16px',
        padding: '36px 32px',
        fontFamily: font,
        animation: 'slideUp 0.25s ease',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Close */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>✕</button>

        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '12px',
          background: C.accentSoft, border: '1px solid ' + C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', marginBottom: '20px',
        }}>🔨</div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>You're in!</div>
            <div style={{ fontSize: '14px', color: C.textMid }}>We'll let you know when new calculators drop.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '22px', fontWeight: '800', color: C.text, marginBottom: '10px', lineHeight: '1.2' }}>
              New calculators dropping soon
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
                  background: C.surfaceAlt, border: '1px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '15px',
                  fontFamily: font, marginBottom: '12px',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <button type="submit" disabled={status === 'sending'} style={{
                width: '100%', padding: '14px',
                background: C.accent, color: '#000',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: '700',
                fontFamily: font, cursor: 'pointer',
                marginBottom: '12px', opacity: status === 'sending' ? 0.7 : 1,
              }}>
                {status === 'sending' ? 'Sending...' : 'Keep me updated →'}
              </button>

              {status === 'error' && (
                <div style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center', marginBottom: '8px' }}>
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
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  )
}

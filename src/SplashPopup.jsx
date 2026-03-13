import { useState, useEffect, useRef } from 'react'
import { C, font, fontDisplay, shadow } from './theme.js'

const ENDPOINT   = 'https://formspree.io/f/xyknwlrz'
const STORAGE_KEY = 'bcp_splash_dismissed'
const DELAY_MS    = 4000   // slight delay so LCP isn't blocked

export default function SplashPopup() {
  const [visible, setVisible] = useState(false)
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState('idle')
  const inputRef  = useRef(null)
  const modalRef  = useRef(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => {
      setVisible(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }, DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  // Trap focus
  useEffect(() => {
    if (!visible) return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0], last = focusable[focusable.length - 1]
    const trap = e => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
    }
    modal.addEventListener('keydown', trap)
    return () => modal.removeEventListener('keydown', trap)
  }, [visible])

  // Escape to close
  useEffect(() => {
    if (!visible) return
    const handler = e => { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible])

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
        setTimeout(() => setVisible(false), 2200)
      } else setStatus('error')
    } catch { setStatus('error') }
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, animation: 'splashFade 0.2s ease' }} />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="splash-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000, width: '90%', maxWidth: '440px',
          maxHeight: '90vh', overflowY: 'auto',
          background: C.surface, border: '2px solid ' + C.border,
          borderRadius: '14px', padding: '36px 32px',
          fontFamily: font, animation: 'splashUp 0.25s ease',
          boxShadow: shadow.xl,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: C.accent, borderRadius: '14px 14px 0 0' }} />

        <button
          onClick={dismiss}
          aria-label="Close notification signup"
          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: '1.5px solid ' + C.border, borderRadius: '6px', cursor: 'pointer', color: C.inkDim, fontSize: '16px', lineHeight: 1, padding: '6px 10px' }}
        >✕</button>

        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: C.accentSoft, border: '2px solid ' + C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '18px' }}>🔨</div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.ink, marginBottom: '8px', letterSpacing: '0.5px' }}>YOU'RE IN!</div>
            <div style={{ fontSize: '14px', color: C.inkMid }}>We'll let you know when new calculators drop.</div>
          </div>
        ) : (
          <>
            <div id="splash-title" style={{ fontFamily: fontDisplay, fontSize: '24px', fontWeight: '700', color: C.ink, marginBottom: '10px', lineHeight: '1.2', letterSpacing: '0.5px' }}>
              NEW CALCULATORS DROPPING SOON
            </div>
            <div style={{ fontSize: '14px', color: C.inkMid, lineHeight: '1.6', marginBottom: '24px' }}>
              HVAC, deck, stair stringer, and more. Drop your email and we'll let you know when they're live — no spam, just new tools.
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="splash-email" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Email address</label>
              <input
                id="splash-email"
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: '100%', padding: '12px 14px', background: C.surfaceAlt, border: '2px solid ' + C.border, borderRadius: '8px', color: C.ink, fontSize: '15px', fontFamily: font, marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{ width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: fontDisplay, fontSize: '16px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', opacity: status === 'sending' ? 0.7 : 1, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentDeep}
                onMouseLeave={e => e.currentTarget.style.background = C.accent}
              >
                {status === 'sending' ? 'Sending...' : 'Keep Me Updated →'}
              </button>
              {status === 'error' && <div role="alert" style={{ fontSize: '13px', color: C.red, textAlign: 'center', marginBottom: '8px' }}>Something went wrong. Try again.</div>}
            </form>

            <button
              onClick={dismiss}
              style={{ width: '100%', padding: '10px', background: 'none', border: '1.5px solid ' + C.border, borderRadius: '8px', color: C.inkMid, fontSize: '13px', fontFamily: font, cursor: 'pointer', transition: 'border-color 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              No thanks
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes splashFade { from { opacity:0; } to { opacity:1; } }
        @keyframes splashUp   { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }
      `}</style>
    </>
  )
}

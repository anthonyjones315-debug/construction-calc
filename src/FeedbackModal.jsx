import { useState, useEffect, useRef } from 'react'
import { C, font, fontDisplay, shadow } from './theme.js'

const ENDPOINT = 'https://formspree.io/f/xzdjrynd'

export default function FeedbackModal({ onClose }) {
  const [improvement, setImprovement] = useState('')
  const [request, setRequest]         = useState('')
  const [status, setStatus]           = useState('idle')
  const firstInputRef = useRef(null)
  const modalRef      = useRef(null)

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // Trap focus inside modal
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0], last = focusable[focusable.length - 1]
    const trap = e => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus() } }
    }
    modal.addEventListener('keydown', trap)
    return () => modal.removeEventListener('keydown', trap)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!improvement && !request) return
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ improvement, request }),
      })
      if (res.ok) { setStatus('success'); setTimeout(() => onClose(), 2500) }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000, width: '90%', maxWidth: '480px',
          maxHeight: '90vh', overflowY: 'auto',
          background: C.surface, border: '2px solid ' + C.border,
          borderRadius: '14px', padding: '36px 32px',
          fontFamily: font, boxShadow: shadow.xl,
          animation: 'splashSlideUp 0.22s ease',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: C.accent, borderRadius: '14px 14px 0 0' }} />

        <button
          onClick={onClose}
          aria-label="Close feedback form"
          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: '1.5px solid ' + C.border, borderRadius: '6px', cursor: 'pointer', color: C.inkDim, fontSize: '16px', lineHeight: 1, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🙏</div>
            <div id="feedback-title" style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.ink, marginBottom: '8px', letterSpacing: '0.5px' }}>THANKS FOR THE FEEDBACK!</div>
            <div style={{ fontSize: '14px', color: C.inkMid }}>We read every submission and use it to prioritize what gets built next.</div>
          </div>
        ) : (
          <>
            <div id="feedback-title" style={{ fontFamily: fontDisplay, fontSize: '24px', fontWeight: '700', color: C.ink, marginBottom: '8px', letterSpacing: '0.5px' }}>💬 FEEDBACK & REQUESTS</div>
            <div style={{ fontSize: '14px', color: C.inkMid, marginBottom: '28px', lineHeight: '1.6' }}>Tell us what to improve or what calculator to build next. Every submission gets read.</div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="feedback-improve" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.inkDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                What would you like to see improved?
              </label>
              <textarea
                id="feedback-improve"
                ref={firstInputRef}
                value={improvement}
                onChange={e => setImprovement(e.target.value)}
                placeholder="e.g. The roofing calculator needs a hip roof option..."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', background: C.surfaceAlt, border: '2px solid ' + C.border, borderRadius: '8px', color: C.ink, fontSize: '14px', fontFamily: font, marginBottom: '20px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <label htmlFor="feedback-request" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.inkDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                What calculator should we build next?
              </label>
              <textarea
                id="feedback-request"
                value={request}
                onChange={e => setRequest(e.target.value)}
                placeholder="e.g. HVAC load calculator, stair stringer, paint coverage..."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', background: C.surfaceAlt, border: '2px solid ' + C.border, borderRadius: '8px', color: C.ink, fontSize: '14px', fontFamily: font, marginBottom: '24px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <button
                type="submit"
                disabled={status === 'sending'}
                style={{ width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: fontDisplay, fontSize: '16px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', opacity: status === 'sending' ? 0.7 : 1, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentDeep}
                onMouseLeave={e => e.currentTarget.style.background = C.accent}
              >
                {status === 'sending' ? 'Sending...' : 'Submit Feedback →'}
              </button>

              {status === 'error' && (
                <div role="alert" style={{ fontSize: '13px', color: C.red, textAlign: 'center', marginTop: '10px' }}>Something went wrong. Try again.</div>
              )}
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes splashSlideUp { from { opacity:0; transform:translate(-50%,-46%); } to { opacity:1; transform:translate(-50%,-50%); } }
      `}</style>
    </>
  )
}

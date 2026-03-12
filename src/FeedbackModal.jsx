import { useState } from 'react'
import { C, font, fontDisplay } from './theme.js'

const ENDPOINT = 'https://formspree.io/f/xzdjrynd'

export default function FeedbackModal({ onClose }) {
  const [improvement, setImprovement] = useState('')
  const [request, setRequest] = useState('')
  const [status, setStatus] = useState('idle')

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
      if (res.ok) {
        setStatus('success')
        setTimeout(() => onClose(), 2500)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 999,
      }} />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%', maxWidth: '480px',
        background: C.surface,
        border: '2px solid ' + C.border,
        borderRadius: '14px',
        padding: '36px 32px',
        fontFamily: font,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>

        {/* Orange top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: C.accent, borderRadius: '14px 14px 0 0',
        }} />

        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>✕</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🙏</div>
            <div style={{ fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.text, marginBottom: '8px', letterSpacing: '0.5px' }}>THANKS FOR THE FEEDBACK!</div>
            <div style={{ fontSize: '14px', color: C.textMid }}>We read every submission and use it to prioritize what gets built next.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: fontDisplay, fontSize: '24px', fontWeight: '700', color: C.text, marginBottom: '8px', letterSpacing: '0.5px' }}>
              💬 FEEDBACK & REQUESTS
            </div>
            <div style={{ fontSize: '14px', color: C.textMid, marginBottom: '28px', lineHeight: '1.6' }}>
              Tell us what to improve or what calculator to build next. Every submission gets read.
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                What would you like to see improved?
              </label>
              <textarea
                value={improvement}
                onChange={e => setImprovement(e.target.value)}
                placeholder="e.g. The roofing calculator needs a hip roof option..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: C.surfaceAlt, border: '2px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '14px',
                  fontFamily: font, marginBottom: '20px', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                What calculator should we build next?
              </label>
              <textarea
                value={request}
                onChange={e => setRequest(e.target.value)}
                placeholder="e.g. HVAC load calculator, stair stringer, paint coverage..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: C.surfaceAlt, border: '2px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '14px',
                  fontFamily: font, marginBottom: '24px', resize: 'vertical',
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
                opacity: status === 'sending' ? 0.7 : 1,
              }}>
                {status === 'sending' ? 'Sending...' : 'Submit Feedback →'}
              </button>

              {status === 'error' && (
                <div style={{ fontSize: '13px', color: '#c0392b', textAlign: 'center', marginTop: '10px' }}>
                  Something went wrong. Try again.
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </>
  )
}

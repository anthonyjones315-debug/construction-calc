import { useState } from 'react'

const C = {
  bg: '#111318', surface: '#1c1f2b', surfaceAlt: '#23273a',
  border: '#2e3347', accent: '#f59e0b',
  text: '#f0efe8', textMid: '#9ca3af', textDim: '#6b7280',
}
const font = "'Inter', 'Segoe UI', system-ui, sans-serif"

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
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 999,
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%', maxWidth: '480px',
        background: C.surface,
        border: '1px solid ' + C.border,
        borderRadius: '16px',
        padding: '36px 32px',
        fontFamily: font,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: '20px', lineHeight: 1, padding: '4px',
        }}>✕</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🙏</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>Thanks for the feedback!</div>
            <div style={{ fontSize: '14px', color: C.textMid }}>We read every submission and use it to prioritize what gets built next.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '22px', fontWeight: '800', color: C.text, marginBottom: '8px' }}>
              💬 Feedback & Requests
            </div>
            <div style={{ fontSize: '14px', color: C.textMid, marginBottom: '28px', lineHeight: '1.6' }}>
              Tell us what to improve or what calculator to build next. Every submission gets read.
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textMid, marginBottom: '6px' }}>
                What would you like to see improved?
              </label>
              <textarea
                value={improvement}
                onChange={e => setImprovement(e.target.value)}
                placeholder="e.g. The roofing calculator needs a hip roof option..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: C.surfaceAlt, border: '1px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '14px',
                  fontFamily: font, marginBottom: '20px', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.textMid, marginBottom: '6px' }}>
                What calculator should we build next?
              </label>
              <textarea
                value={request}
                onChange={e => setRequest(e.target.value)}
                placeholder="e.g. HVAC load calculator, stair stringer, paint coverage..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: C.surfaceAlt, border: '1px solid ' + C.border,
                  borderRadius: '8px', color: C.text, fontSize: '14px',
                  fontFamily: font, marginBottom: '24px', resize: 'vertical',
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
                opacity: status === 'sending' ? 0.7 : 1,
              }}>
                {status === 'sending' ? 'Sending...' : 'Submit Feedback →'}
              </button>

              {status === 'error' && (
                <div style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>
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

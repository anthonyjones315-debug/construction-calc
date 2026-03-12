import SplashPopup from './SplashPopup.jsx'
import Blog from './Blog.jsx'
import FAQ from './FAQ.jsx'
import FeedbackModal from './FeedbackModal.jsx'
import { useState, useEffect } from 'react'
import ConstructionCalculator from './Calculator.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [showFeedback, setShowFeedback] = useState(false)

  function navigate(href) {
    window.history.pushState({}, '', href)
    setPath(href)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault()
        window.history.pushState({}, '', href)
        setPath(href)
        window.scrollTo(0, 0)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  if (path === '/privacy') return <PrivacyPolicy />
  if (path === '/faq') return <FAQ />
  if (path === '/blog' || path.startsWith('/blog/')) {
    const slug = path.startsWith('/blog/') ? path.replace('/blog/', '') : null
    return (
      <div style={{ minHeight: '100vh', background: '#111318' }}>
        <Blog slug={slug} navigate={navigate} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#111318' }}>

      <SplashPopup />
      <div style={{ flex: 1 }}>
        <ConstructionCalculator />
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      <footer style={{
        borderTop: '1px solid #2e3347',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: '#1c1f2b',
      }}>
        <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
          © {new Date().getFullYear()} Build Calc Pro — Free Construction Estimating Tool
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/blog" style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", textDecoration: 'none' }}>
            Resources
          </a>
          <a href="/faq" style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", textDecoration: 'none' }}>
            FAQ
          </a>
          <a href="/privacy" style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif", textDecoration: 'none' }}>
            Privacy Policy
          </a>
          <button onClick={() => setShowFeedback(true)} style={{
            fontSize: '12px', color: '#f59e0b', fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            💬 Feedback / Request a Calculator
          </button>
          <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Results are estimates. Always verify with a licensed professional.
          </span>
        </div>
      </footer>
    </div>
  )
}

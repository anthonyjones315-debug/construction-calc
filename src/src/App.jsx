import { useState, useEffect } from 'react'
import SplashPopup from './SplashPopup.jsx'
import Blog from './Blog.jsx'
import FAQ from './FAQ.jsx'
import FeedbackModal from './FeedbackModal.jsx'
import ConstructionCalculator from './Calculator.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif"

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

  // Intercept internal <a href="/..."> clicks so they go through navigate()
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault()
        navigate(href)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  if (path === '/privacy') return <PrivacyPolicy />

  if (path === '/faq') return (
    <FAQ onFeedback={() => setShowFeedback(true)} onNavigate={navigate} />
  )

  if (path === '/blog' || path.startsWith('/blog/')) {
    const slug = path.startsWith('/blog/') ? path.replace('/blog/', '') : null
    return <Blog slug={slug} navigate={navigate} onFeedback={() => setShowFeedback(true)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f1eb' }}>
      <SplashPopup />
      <div style={{ flex: 1 }}>
        <ConstructionCalculator />
      </div>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      <footer style={{
        borderTop: '1px solid #d9d4c7',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: '#f9f7f3',
      }}>
        <span style={{ fontSize: '12px', color: '#8c887f', fontFamily: font }}>
          © {new Date().getFullYear()} Build Calc Pro — Free Construction Estimating Tool
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/blog" style={{ fontSize: '12px', color: '#555248', fontFamily: font, textDecoration: 'none' }}>Resources</a>
          <a href="/faq" style={{ fontSize: '12px', color: '#555248', fontFamily: font, textDecoration: 'none' }}>FAQ</a>
          <a href="/privacy" style={{ fontSize: '12px', color: '#555248', fontFamily: font, textDecoration: 'none' }}>Privacy Policy</a>
          <button onClick={() => setShowFeedback(true)} style={{
            fontSize: '12px', color: '#e8820c', fontFamily: font,
            fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            💬 Feedback / Request a Calculator
          </button>
          <span style={{ fontSize: '12px', color: '#8c887f', fontFamily: font }}>
            Results are estimates. Always verify with a licensed professional.
          </span>
        </div>
      </footer>
    </div>
  )
}

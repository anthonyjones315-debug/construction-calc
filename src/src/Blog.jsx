import { POSTS, getPost } from './posts/index.js'

const C = {
  bg: '#f4f1eb', surface: '#ffffff', surfaceAlt: '#f9f7f3',
  border: '#d9d4c7', navBg: '#1a1a1a',
  accent: '#e8820c', accentDark: '#c96d08', accentSoft: 'rgba(232,130,12,0.10)',
  text: '#1a1a1a', textMid: '#555248', textDim: '#8c887f',
}
const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif"
const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif"

// ── Shared nav bar ────────────────────────────────────────────────────────────
function NavBar({ onBack, backLabel }) {
  return (
    <div style={{
      background: C.navBg, margin: '-40px -24px 40px', padding: '0 24px', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    }}>
      <a href="/" style={{ fontFamily: fontDisplay, fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '0.5px' }}>
        ⚒ BUILD CALC PRO
      </a>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {onBack && (
          <button onClick={onBack} style={{
            fontSize: '13px', color: '#c4bfb4', fontWeight: '600',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: font,
          }}>
            ← {backLabel || 'Back'}
          </button>
        )}
        <a href="/" style={{ fontSize: '13px', color: '#e8820c', fontWeight: '700', textDecoration: 'none', fontFamily: font }}>
          Open Calculator
        </a>
      </div>
    </div>
  )
}

// ── Minimal markdown renderer ─────────────────────────────────────────────────
function renderContent(md) {
  const lines = md.split('\n')
  const elements = []
  let i = 0
  let tableBuffer = []

  const inlineFormat = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code style="background:#f0ede6;border:1px solid #d9d4c7;padding:2px 6px;border-radius:4px;font-size:0.88em;color:#1a1a1a">$1</code>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:#e8820c;text-decoration:underline;font-weight:600">$1</a>`)
  }

  while (i < lines.length) {
    const line = lines[i]

    // Collect table rows
    if (line.trim().startsWith('|')) {
      tableBuffer.push(line)
      i++
      continue
    }

    // Flush table
    if (tableBuffer.length > 0) {
      const rows = tableBuffer.filter(r => !r.match(/^\|\s*[-:]+/))
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', fontFamily: font, border: '1px solid ' + C.border }}>
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1)
              const Tag = ri === 0 ? 'th' : 'td'
              return (
                <tr key={ri} style={{ borderBottom: '1px solid ' + C.border, background: ri === 0 ? C.surfaceAlt : (ri % 2 === 0 ? C.surface : C.bg) }}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: ri === 0 ? C.accent : C.text,
                      fontWeight: ri === 0 ? '700' : '400',
                    }}
                      dangerouslySetInnerHTML={{ __html: inlineFormat(cell.trim()) }}
                    />
                  ))}
                </tr>
              )
            })}
          </table>
        </div>
      )
      tableBuffer = []
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: fontDisplay, fontSize: '22px', fontWeight: '700', color: C.text,
          margin: '40px 0 14px', letterSpacing: '0.3px',
          borderBottom: '2px solid ' + C.border, paddingBottom: '8px',
        }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }}
        />
      )
      i++; continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{
          fontSize: '16px', fontWeight: '700', color: C.text,
          margin: '28px 0 10px', fontFamily: font,
        }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }}
        />
      )
      i++; continue
    }

    if (line.match(/^- /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '0 0 20px', paddingLeft: '24px' }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: C.textMid, fontSize: '15px', lineHeight: '1.7', marginBottom: '6px', fontFamily: font }}
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ul>
      )
      continue
    }

    if (line.trim() === '') { i++; continue }

    elements.push(
      <p key={i} style={{ color: C.textMid, fontSize: '15px', lineHeight: '1.8', margin: '0 0 20px', fontFamily: font }}
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    )
    i++
  }

  return elements
}

// ── Blog Index ────────────────────────────────────────────────────────────────
function BlogIndex({ onPost }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>
        <NavBar />
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: fontDisplay, fontSize: '36px', fontWeight: '700', color: C.text, margin: '0 0 10px', letterSpacing: '0.5px' }}>
            RESOURCES & GUIDES
          </h1>
          <p style={{ color: C.textMid, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Practical guides for contractors, builders, and serious DIYers.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {POSTS.map(post => (
            <div
              key={post.slug}
              onClick={() => onPost(post.slug)}
              style={{
                background: C.surface, border: '2px solid ' + C.border,
                borderRadius: '10px', padding: '24px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontSize: '12px', color: C.accent, fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {post.category}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 10px', lineHeight: '1.3', fontFamily: font }}>
                {post.title}
              </h2>
              <p style={{ fontSize: '14px', color: C.textMid, margin: '0 0 16px', lineHeight: '1.6' }}>
                {post.description}
              </p>
              <span style={{ fontSize: '13px', color: C.accent, fontWeight: '700' }}>
                Read article →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Blog Post ─────────────────────────────────────────────────────────────────
function BlogPost({ slug, onBack }) {
  const post = getPost(slug)

  if (!post) return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>
        <NavBar onBack={onBack} backLabel="Resources" />
        <div style={{ padding: '60px 0', textAlign: 'center', color: C.textMid }}>
          Post not found.{' '}
          <button onClick={onBack} style={{ color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontWeight: '700' }}>
            Go back
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>
        <NavBar onBack={onBack} backLabel="Resources" />

        <div style={{ fontSize: '12px', color: C.accent, fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {post.category} · {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        <h1 style={{ fontFamily: fontDisplay, fontSize: '34px', fontWeight: '700', color: C.text, margin: '0 0 32px', lineHeight: '1.2', letterSpacing: '0.3px' }}>
          {post.title}
        </h1>

        <div>{renderContent(post.content)}</div>

        {/* Calculator CTA */}
        <div style={{
          marginTop: '48px', background: C.navBg,
          borderRadius: '10px', padding: '28px', textAlign: 'center',
          borderLeft: '5px solid ' + C.accent,
        }}>
          <div style={{ fontFamily: fontDisplay, fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px', letterSpacing: '0.5px' }}>
            READY TO RUN THE NUMBERS?
          </div>
          <div style={{ fontSize: '14px', color: '#c4bfb4', marginBottom: '20px', lineHeight: '1.6' }}>
            Use the free {post.relatedCalcLabel} to get your estimate in seconds.
          </div>
          <a href="/" style={{
            display: 'inline-block', background: C.accent, color: '#fff',
            padding: '13px 28px', borderRadius: '8px', fontWeight: '700',
            fontSize: '14px', textDecoration: 'none',
            fontFamily: fontDisplay, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Open {post.relatedCalcLabel} →
          </a>
        </div>

      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function Blog({ slug, navigate }) {
  if (slug) return <BlogPost slug={slug} onBack={() => navigate('/blog')} />
  return <BlogIndex onPost={(s) => navigate(`/blog/${s}`)} />
}

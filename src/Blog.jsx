import { POSTS, getPost } from './posts/index.js'

const C = {
  bg: '#111318', surface: '#1c1f2b', surfaceAlt: '#23273a',
  border: '#2e3347', accent: '#f59e0b', accentDark: '#d97706',
  accentSoft: 'rgba(245,158,11,0.12)', text: '#f0efe8',
  textMid: '#9ca3af', textDim: '#6b7280',
}
const font = "'Inter', 'Segoe UI', system-ui, sans-serif"

// ── Minimal markdown renderer ─────────────────────────────────────────────────
function renderContent(md) {
  const lines = md.split('\n')
  const elements = []
  let i = 0
  let tableBuffer = []
  let inTable = false

  const inlineFormat = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code style="background:#23273a;padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:#f59e0b;text-decoration:underline">$1</a>`)
  }

  while (i < lines.length) {
    const line = lines[i]

    // Table row
    if (line.trim().startsWith('|')) {
      tableBuffer.push(line)
      i++
      continue
    }

    // Flush table
    if (tableBuffer.length > 0) {
      const rows = tableBuffer.filter(r => !r.match(/^\|\s*[-:]+/))
      const tableEl = (
        <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', fontFamily: font }}>
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1)
              const Tag = ri === 0 ? 'th' : 'td'
              return (
                <tr key={ri} style={{ borderBottom: '1px solid ' + C.border }}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: ri === 0 ? C.accent : C.text,
                      fontWeight: ri === 0 ? '600' : '400',
                      background: ri === 0 ? C.surfaceAlt : 'transparent',
                      whiteSpace: 'nowrap',
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
      elements.push(tableEl)
      tableBuffer = []
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{
          fontSize: '20px', fontWeight: '700', color: C.text,
          margin: '36px 0 14px', fontFamily: font,
          borderBottom: '1px solid ' + C.border, paddingBottom: '8px',
        }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }}
        />
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{
          fontSize: '17px', fontWeight: '700', color: C.text,
          margin: '28px 0 10px', fontFamily: font,
        }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }}
        />
      )
      i++; continue
    }

    // List item
    if (line.match(/^- /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '0 0 20px', paddingLeft: '24px' }}>
          {items.map((item, j) => (
            <li key={j} style={{
              color: C.textMid, fontSize: '15px', lineHeight: '1.7',
              marginBottom: '6px', fontFamily: font,
            }}
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ul>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') { i++; continue }

    // Paragraph
    elements.push(
      <p key={i} style={{
        color: C.textMid, fontSize: '15px', lineHeight: '1.8',
        margin: '0 0 20px', fontFamily: font,
      }}
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '13px', color: C.accent, fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Build Calc Pro
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: C.text, margin: '0 0 12px' }}>
          Resources & Guides
        </h1>
        <p style={{ color: C.textMid, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
          Practical guides for contractors, builders, and serious DIYers. Written by people who've been on the job site.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {POSTS.map(post => (
          <div
            key={post.slug}
            onClick={() => onPost(post.slug)}
            style={{
              background: C.surface, border: '1px solid ' + C.border,
              borderRadius: '12px', padding: '24px', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ fontSize: '12px', color: C.accent, fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {post.category}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 10px', lineHeight: '1.3' }}>
              {post.title}
            </h2>
            <p style={{ fontSize: '14px', color: C.textMid, margin: '0 0 16px', lineHeight: '1.6' }}>
              {post.description}
            </p>
            <span style={{ fontSize: '13px', color: C.accent, fontWeight: '600' }}>
              Read article →
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Blog Post ─────────────────────────────────────────────────────────────────
function BlogPost({ slug, onBack }) {
  const post = getPost(slug)
  if (!post) return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: C.textMid, fontFamily: font }}>
      Post not found. <button onClick={onBack} style={{ color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font }}>Go back</button>
    </div>
  )

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', fontFamily: font }}>

      {/* Back */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: C.textMid, fontSize: '13px', fontFamily: font,
        marginBottom: '28px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        ← Back to Resources
      </button>

      {/* Category + date */}
      <div style={{ fontSize: '12px', color: C.accent, fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {post.category} · {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.text, margin: '0 0 32px', lineHeight: '1.25' }}>
        {post.title}
      </h1>

      {/* Content */}
      <div>{renderContent(post.content)}</div>

      {/* Calculator CTA */}
      <div style={{
        marginTop: '48px', background: C.surfaceAlt,
        border: '1px solid ' + C.border, borderRadius: '12px',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>
          Ready to run the numbers?
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, marginBottom: '16px' }}>
          Use our free {post.relatedCalcLabel} to get your estimate in seconds.
        </div>
        <a href="/" style={{
          display: 'inline-block', background: C.accent, color: '#000',
          padding: '12px 24px', borderRadius: '8px', fontWeight: '700',
          fontSize: '14px', textDecoration: 'none', fontFamily: font,
        }}>
          Open {post.relatedCalcLabel} →
        </a>
      </div>

    </div>
  )
}

// ── Main Blog Component ───────────────────────────────────────────────────────
export default function Blog({ slug }) {
  if (slug) return <BlogPost slug={slug} onBack={() => window.history.pushState({}, '', '/blog')} />
  return <BlogIndex onPost={(s) => window.history.pushState({}, '', `/blog/${s}`)} />
}

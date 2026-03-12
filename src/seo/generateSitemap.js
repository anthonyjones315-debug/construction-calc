/**
 * Generate sitemap.xml
 * Run: node src/seo/generateSitemap.js
 * Output: public/sitemap.xml
 *
 * Submit this URL to Google Search Console:
 * https://buildcalcpro.com/sitemap.xml
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_URL = 'https://buildcalcpro.com'

const PAGES = [
  // Priority 1.0 = most important. Changefreq = how often Google should recrawl.
  { path: '/', priority: '1.0', changefreq: 'weekly' },

  // Roofing — highest search volume for this tool type
  { path: '/roofing/roof-pitch-calculator', priority: '0.95', changefreq: 'monthly' },
  { path: '/roofing/roofing-squares-calculator', priority: '0.90', changefreq: 'monthly' },

  // Concrete — second highest volume
  { path: '/concrete/concrete-slab-calculator', priority: '0.90', changefreq: 'monthly' },
  { path: '/concrete/concrete-footing-calculator', priority: '0.85', changefreq: 'monthly' },

  // Insulation — high CPM niche
  { path: '/insulation/spray-foam-calculator', priority: '0.88', changefreq: 'monthly' },
  { path: '/insulation/cellulose-insulation-calculator', priority: '0.85', changefreq: 'monthly' },

  // Framing
  { path: '/framing/wall-stud-calculator', priority: '0.82', changefreq: 'monthly' },
  { path: '/framing/rafter-length-calculator', priority: '0.82', changefreq: 'monthly' },

  // Electrical
  { path: '/electrical/wire-gauge-ampacity-calculator', priority: '0.80', changefreq: 'monthly' },

  // Materials
  { path: '/materials/brick-calculator', priority: '0.78', changefreq: 'monthly' },
  { path: '/materials/drywall-calculator', priority: '0.78', changefreq: 'monthly' },

  // Area
  { path: '/area/room-area-calculator', priority: '0.75', changefreq: 'monthly' },
  { path: '/area/triangle-area-calculator', priority: '0.70', changefreq: 'monthly' },
]

const today = new Date().toISOString().split('T')[0]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`

const outPath = resolve(__dirname, '../../public/sitemap.xml')
writeFileSync(outPath, xml, 'utf8')
console.log(`✅ sitemap.xml written to ${outPath}`)
console.log(`   ${PAGES.length} URLs included`)
console.log(`\n📌 Submit to Google Search Console:`)
console.log(`   ${SITE_URL}/sitemap.xml`)

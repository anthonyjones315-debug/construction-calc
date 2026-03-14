import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PDFEstimateData } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#e8820c' },
  logo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  logoSub: { fontSize: 10, color: '#e8820c', fontFamily: 'Helvetica-Bold', marginTop: 2 },
  meta: { textAlign: 'right' },
  metaText: { fontSize: 9, color: '#6b6560' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b6560', marginBottom: 20 },
  sectionLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9a9389', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  heroCard: { backgroundColor: '#e8820c', borderRadius: 8, padding: 12, minWidth: 140, flex: 1 },
  heroLabel: { fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginTop: 2 },
  heroUnit: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  heroDesc: { fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  card: { backgroundColor: '#f9f7f3', borderRadius: 8, padding: 10, minWidth: 120, flex: 1 },
  cardLabel: { fontSize: 8, color: '#9a9389', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginTop: 2 },
  cardUnit: { fontSize: 9, color: '#6b6560' },
  cardDesc: { fontSize: 8, color: '#9a9389', marginTop: 1 },
  disclaimer: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0ede7' },
  disclaimerText: { fontSize: 8, color: '#9a9389', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#c4bfb4' },
})

interface Props { data: PDFEstimateData }

export function EstimatePDF({ data }: Props) {
  const highlighted = data.results.filter(r => r.highlight)
  const rest = data.results.filter(r => !r.highlight)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BUILD CALC PRO</Text>
            <Text style={styles.logoSub}>proconstructioncalc.com</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
            <Text style={styles.metaText}>Planning Estimate</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>{data.calculatorLabel} Calculator</Text>

        {/* Hero results */}
        {highlighted.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Key Results</Text>
            <View style={styles.resultsGrid}>
              {highlighted.map((r, i) => (
                <View key={i} style={styles.heroCard}>
                  <Text style={styles.heroLabel}>{r.label}</Text>
                  <Text style={styles.heroValue}>{r.value}</Text>
                  <Text style={styles.heroUnit}>{r.unit}</Text>
                  {r.description && <Text style={styles.heroDesc}>{r.description}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Secondary results */}
        {rest.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>All Results</Text>
            <View style={styles.resultsGrid}>
              {rest.map((r, i) => (
                <View key={i} style={styles.card}>
                  <Text style={styles.cardLabel}>{r.label}</Text>
                  <Text style={styles.cardValue}>{r.value} <Text style={styles.cardUnit}>{r.unit}</Text></Text>
                  {r.description && <Text style={styles.cardDesc}>{r.description}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            These estimates are for planning purposes only. Material quantities may vary based on site conditions,
            local codes, and contractor specifications. Always verify with a licensed contractor before purchasing materials.
            Material prices reflect regional averages and are subject to market fluctuation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Build Calc Pro — proconstructioncalc.com</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

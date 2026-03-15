import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

const SLATE_950 = "#020617";
const SLATE_800 = "#1e293b";
const SLATE_200 = "#e2e8f0";
const SLATE_400 = "#94a3b8";
const ORANGE_600 = "#ea580c";
const WHITE = "#ffffff";

let fontsRegistered = false;

function ensurePdfFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Oswald",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/oswald@5/files/oswald-latin-400-normal.woff2",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/oswald@5/files/oswald-latin-700-normal.woff2",
        fontWeight: 700,
      },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-400-normal.woff2",
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-700-normal.woff2",
        fontWeight: 700,
      },
    ],
  });
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    color: SLATE_950,
    fontFamily: "Inter",
    fontSize: 10,
    paddingHorizontal: 40,
    paddingTop: 0,
    paddingBottom: 60,
  },
  headerBand: {
    backgroundColor: SLATE_950,
    marginHorizontal: -40,
    paddingHorizontal: 40,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandName: {
    fontFamily: "Oswald",
    fontSize: 20,
    color: ORANGE_600,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandRegion: {
    fontFamily: "Inter",
    fontSize: 8,
    color: SLATE_400,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontFamily: "Inter",
    fontSize: 9,
    color: SLATE_400,
  },
  headerDocType: {
    fontFamily: "Oswald",
    fontSize: 10,
    color: ORANGE_600,
    textTransform: "uppercase",
    marginTop: 2,
  },
  titleSection: {
    marginTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ORANGE_600,
  },
  title: {
    fontFamily: "Oswald",
    fontSize: 22,
    color: SLATE_950,
    textTransform: "uppercase",
  },
  kicker: {
    fontSize: 9,
    color: SLATE_400,
    marginTop: 3,
  },
  sectionBar: {
    backgroundColor: ORANGE_600,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  sectionBarText: {
    color: WHITE,
    fontFamily: "Oswald",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: SLATE_200,
    marginTop: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: SLATE_950,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colLabel: { width: "50%", fontSize: 10 },
  colValue: { width: "25%", fontSize: 10, textAlign: "right" },
  colUnit: { width: "25%", fontSize: 10, textAlign: "right" },
  th: {
    fontFamily: "Oswald",
    fontSize: 9,
    color: SLATE_400,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: {
    fontFamily: "Inter",
    fontSize: 10,
    color: SLATE_950,
  },
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SLATE_950,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  totalLabel: {
    fontFamily: "Oswald",
    fontSize: 11,
    color: SLATE_400,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: "Oswald",
    fontSize: 20,
    color: ORANGE_600,
  },
  divider: {
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: ORANGE_600,
  },
  disclaimer: {
    marginTop: 14,
    fontSize: 8,
    color: SLATE_400,
    fontFamily: "Inter",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: SLATE_200,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: SLATE_400,
    fontFamily: "Inter",
  },
});

export type CalculatorExportPayload = {
  title: string;
  calculatorLabel: string;
  results: Array<{ label: string; value: string | number; unit: string }>;
  generatedAt: string;
};

export function createCalculatorExportPDF(
  data: CalculatorExportPayload,
): ReactElement<DocumentProps> {
  ensurePdfFonts();
  const rows = data.results;
  const primaryResult = rows.length > 0 ? rows[0] : null;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerBand}>
          <View>
            <Text style={s.brandName}>Pro Construction Calc</Text>
            <Text style={s.brandRegion}>Mohawk Valley / Rome, NY</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{data.generatedAt}</Text>
            <Text style={s.headerDocType}>Calculator Estimate</Text>
          </View>
        </View>

        <View style={s.titleSection}>
          <Text style={s.title}>{data.title}</Text>
          <Text style={s.kicker}>{data.calculatorLabel}</Text>
        </View>

        <View style={s.sectionBar}>
          <Text style={s.sectionBarText}>Results Breakdown</Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.colLabel, s.th]}>Item</Text>
            <Text style={[s.colValue, s.th]}>Value</Text>
            <Text style={[s.colUnit, s.th]}>Unit</Text>
          </View>
          {rows.map((row, index) => {
            const isLast = index === rows.length - 1;
            const isAlt = index % 2 === 1;
            return (
              <View
                key={`${row.label}-${index}`}
                style={[
                  s.tableRow,
                  isAlt ? s.tableRowAlt : {},
                  isLast ? s.tableRowLast : {},
                ]}
              >
                <Text style={[s.colLabel, s.td]}>{row.label}</Text>
                <Text style={[s.colValue, s.td]}>
                  {typeof row.value === "number" ? row.value.toFixed(2) : String(row.value)}
                </Text>
                <Text style={[s.colUnit, s.td]}>{row.unit}</Text>
              </View>
            );
          })}
        </View>

        {primaryResult && (
          <View style={s.totalBar}>
            <Text style={s.totalLabel}>Total Estimate</Text>
            <Text style={s.totalValue}>
              {typeof primaryResult.value === "number"
                ? primaryResult.value.toFixed(2)
                : String(primaryResult.value)}{" "}
              {primaryResult.unit}
            </Text>
          </View>
        )}

        <View style={s.divider} />
        <Text style={s.disclaimer}>
          This estimate was generated by Pro Construction Calc — proconstructioncalc.com.
          All quantities are approximate and should be verified before ordering materials
          or starting work. Pro Construction Calc is not liable for material shortages or
          overages resulting from these calculations.
        </Text>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Pro Construction Calc — Mohawk Valley / Rome, NY</Text>
          <Text style={s.footerText}>proconstructioncalc.com</Text>
          <Text style={s.footerText}>Generated: {data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}

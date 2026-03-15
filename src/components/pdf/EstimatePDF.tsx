import {
  Document,
  Font,
  Image as PdfImage,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { BudgetItem, PDFEstimateData } from "@/types";

const SLATE_950 = "#020617";
const SLATE_800 = "#1e293b";
const SLATE_200 = "#e2e8f0";
const SLATE_400 = "#94a3b8";
const ORANGE_600 = "#ea580c";

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

const WHITE = "#ffffff";

const colors = {
  midnight: SLATE_950,
  dusk: SLATE_800,
  accent: ORANGE_600,
  border: SLATE_200,
  headerGray: SLATE_950,
  text: SLATE_950,
  muted: SLATE_400,
  surface: "#f8fafc",
  page: WHITE,
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 42,
    paddingHorizontal: 34,
    fontFamily: "Inter",
    backgroundColor: colors.page,
    color: colors.text,
    fontSize: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoWrap: {
    maxWidth: 210,
  },
  logoImage: {
    width: 140,
    height: 56,
    objectFit: "contain",
  },
  fallbackLogo: {
    fontSize: 18,
    fontFamily: "Oswald",
    color: ORANGE_600,
  },
  brandRegion: {
    marginTop: 2,
    fontSize: 8,
    color: SLATE_400,
  },
  brandSite: {
    marginTop: 2,
    fontSize: 9,
    color: colors.muted,
  },
  estimateStack: {
    alignItems: "flex-end",
    maxWidth: 240,
  },
  estimateTitle: {
    fontFamily: "Oswald",
    fontSize: 30,
    color: SLATE_950,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  contractorCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    width: 220,
  },
  blockHeading: {
    fontFamily: "Oswald",
    fontSize: 10,
    color: SLATE_950,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  cardLine: {
    fontSize: 9,
    lineHeight: 1.35,
    color: colors.text,
  },
  metadataRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  clientCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    width: "58%",
  },
  estimateMetaCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    width: "42%",
  },
  metaLabel: {
    fontFamily: "Oswald",
    fontSize: 9,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  metaValue: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.text,
  },
  descWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    minHeight: 44,
  },
  sectionBar: {
    marginTop: 12,
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sectionBarText: {
    color: WHITE,
    fontFamily: "Oswald",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  table: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.headerGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colService: { width: "24%", fontSize: 9 },
  colDesc: { width: "40%", fontSize: 9 },
  colQty: { width: "12%", fontSize: 9, textAlign: "right" },
  colUnit: { width: "12%", fontSize: 9, textAlign: "right" },
  colTotal: { width: "12%", fontSize: 9, textAlign: "right" },
  th: {
    fontFamily: "Oswald",
    fontSize: 9,
    textTransform: "uppercase",
    color: SLATE_400,
    letterSpacing: 0.5,
  },
  td: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.text,
  },
  totalBox: {
    marginTop: 10,
    marginLeft: "54%",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  totalLabel: {
    fontFamily: "Oswald",
    fontSize: 10,
    color: SLATE_950,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  totalValue: {
    marginTop: 2,
    fontFamily: "Oswald",
    fontSize: 20,
    color: colors.accent,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  holdHarmless: {
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.35,
    color: colors.muted,
  },
  footerMeta: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerMetaText: {
    fontSize: 8,
    color: colors.muted,
    fontFamily: "Inter",
  },
});

type LineItem = {
  serviceItem: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
};

function asFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function toLineItems(data: PDFEstimateData): LineItem[] {
  const budgetItems = Array.isArray(data.budgetItems) ? data.budgetItems : [];

  if (budgetItems.length > 0) {
    return budgetItems
      .map<LineItem | null>((item: BudgetItem) => {
        const serviceItem = String(item.name ?? "Service Item").trim();
        const quantity = asFiniteNumber(item.quantity) ?? 0;
        const unitCost = asFiniteNumber(item.pricePerUnit) ?? 0;
        const total = quantity * unitCost;
        if (quantity <= 0 || unitCost <= 0 || total <= 0) return null;

        const descriptionBits = [
          typeof item.unit === "string" && item.unit.trim()
            ? `${item.unit} basis`
            : null,
        ].filter(Boolean);

        return {
          serviceItem: serviceItem || "Service Item",
          description:
            descriptionBits.length > 0
              ? descriptionBits.join(" · ")
              : "Professional service line item",
          quantity,
          unitCost,
          total,
        };
      })
      .filter((row): row is LineItem => Boolean(row));
  }

  return data.results
    .map<LineItem | null>((result) => {
      const numericValue = asFiniteNumber(result.value);
      const isCurrencyUnit =
        result.unit === "$" || result.unit.toLowerCase().includes("usd");
      if (numericValue === null || numericValue <= 0 || !isCurrencyUnit) {
        return null;
      }

      return {
        serviceItem: result.label,
        description: result.description ?? "Calculated line item",
        quantity: 1,
        unitCost: numericValue,
        total: numericValue,
      };
    })
    .filter((row): row is LineItem => Boolean(row));
}

function estimateNumber(data: PDFEstimateData): string {
  const stamp = data.generatedAt.replace(/[^0-9]/g, "").slice(-8);
  return stamp ? `EST-${stamp}` : `EST-${Date.now().toString().slice(-6)}`;
}

function resolveControlNumber(data: PDFEstimateData): string {
  if (typeof data.controlNumber === "string") {
    const normalized = data.controlNumber
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "");
    if (normalized) {
      return normalized;
    }
  }

  return estimateNumber(data);
}

interface Props {
  data: PDFEstimateData;
}

export function createEstimatePDF(
  data: PDFEstimateData,
): ReactElement<DocumentProps> {
  ensurePdfFonts();

  const contractorName = data.contractorProfile?.businessName?.trim();
  const contractorLogoUrl = data.contractorProfile?.logoUrl?.trim();
  const contractorAddress = data.contractorProfile?.businessAddress?.trim();
  const contractorPhone = data.contractorProfile?.businessPhone?.trim();
  const contractorEmail = data.contractorProfile?.businessEmail?.trim();

  const clientName = data.clientName?.trim();
  const clientAddress = data.jobSiteAddress?.trim();
  const lineItems = toLineItems(data);

  const computedSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const combinedEstimateTotal =
    typeof data.totalCost === "number" && Number.isFinite(data.totalCost)
      ? data.totalCost
      : computedSubtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.logoWrap}>
            {contractorLogoUrl ? (
              <PdfImage src={contractorLogoUrl} style={styles.logoImage} />
            ) : (
              <Text style={styles.fallbackLogo}>Pro Construction Calc</Text>
            )}
            <Text style={styles.brandRegion}>Mohawk Valley / Rome, NY</Text>
            <Text style={styles.brandSite}>proconstructioncalc.com</Text>
          </View>

          <View style={styles.estimateStack}>
            <Text style={styles.estimateTitle}>Estimate</Text>
            <View style={styles.contractorCard}>
              <Text style={styles.blockHeading}>Contractor Profile</Text>
              <Text style={styles.cardLine}>
                {contractorName || "Pro Construction Calc"}
              </Text>
              {contractorAddress && (
                <Text style={styles.cardLine}>{contractorAddress}</Text>
              )}
              {contractorPhone && (
                <Text style={styles.cardLine}>{contractorPhone}</Text>
              )}
              {contractorEmail && (
                <Text style={styles.cardLine}>{contractorEmail}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.metadataRow}>
          <View style={styles.clientCard}>
            <Text style={styles.blockHeading}>Client</Text>
            <Text style={styles.cardLine}>
              {clientName || "Client not specified"}
            </Text>
            {clientAddress && (
              <Text style={styles.cardLine}>{clientAddress}</Text>
            )}
          </View>

          <View style={styles.estimateMetaCard}>
            <Text style={styles.metaLabel}>Control Number</Text>
            <Text style={styles.metaValue}>{resolveControlNumber(data)}</Text>
            <Text style={styles.metaLabel}>Estimate Sent</Text>
            <Text style={styles.metaValue}>{data.generatedAt}</Text>
          </View>
        </View>

        <View style={styles.descWrap}>
          <Text style={styles.blockHeading}>Description of Work</Text>
          <Text style={styles.cardLine}>{data.title}</Text>
        </View>

        <View style={styles.sectionBar}>
          <Text style={styles.sectionBarText}>Service Line Items</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colService, styles.th]}>Service / Item</Text>
            <Text style={[styles.colDesc, styles.th]}>Description</Text>
            <Text style={[styles.colQty, styles.th]}>Quantity / Hours</Text>
            <Text style={[styles.colUnit, styles.th]}>Unit Cost</Text>
            <Text style={[styles.colTotal, styles.th]}>Total</Text>
          </View>

          {lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <View
                key={`${item.serviceItem}-${index}`}
                style={
                  index === lineItems.length - 1
                    ? [styles.tableRow, styles.tableRowLast]
                    : styles.tableRow
                }
              >
                <Text style={[styles.colService, styles.td]}>
                  {item.serviceItem}
                </Text>
                <Text style={[styles.colDesc, styles.td]}>
                  {item.description}
                </Text>
                <Text style={[styles.colQty, styles.td]}>
                  {formatQuantity(item.quantity)}
                </Text>
                <Text style={[styles.colUnit, styles.td]}>
                  {formatCurrency(item.unitCost)}
                </Text>
                <Text style={[styles.colTotal, styles.td]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={[styles.colService, styles.td]}>Service item</Text>
              <Text style={[styles.colDesc, styles.td]}>
                Add budget lines to populate a structured estimate table.
              </Text>
              <Text style={[styles.colQty, styles.td]}>0</Text>
              <Text style={[styles.colUnit, styles.td]}>
                {formatCurrency(0)}
              </Text>
              <Text style={[styles.colTotal, styles.td]}>
                {formatCurrency(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Combined Estimate Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(combinedEstimateTotal)}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.holdHarmless}>
            Hold Harmless: Client acknowledges all estimate values are planning
            projections and agrees to hold Contractor harmless for site-specific
            variances, market price changes, permitting delays, and scope
            adjustments discovered before or during execution.
          </Text>
          <View style={styles.footerMeta}>
            <Text style={styles.footerMetaText}>Pro Construction Calc</Text>
            <Text
              style={styles.footerMetaText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function EstimatePDF({ data }: Props) {
  return createEstimatePDF(data);
}

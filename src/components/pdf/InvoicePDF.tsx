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
import { designTokens } from "@/lib/design-tokens";

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

const colors = {
  midnight: designTokens.ui.midnight,
  dusk: designTokens.ui.dusk,
  accent: designTokens.brand.orange,
  accentDark: designTokens.brand.orangeDark,
  border: designTokens.ui.border,
  headerGray: designTokens.ui.surfaceAlt,
  text: designTokens.ui.text,
  muted: designTokens.ui.textMuted,
  surface: designTokens.ui.surface,
  page: designTokens.ui.page,
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.page,
    color: colors.text,
    fontFamily: "Inter",
    fontSize: 10,
    paddingHorizontal: 34,
    paddingTop: 30,
    paddingBottom: 40,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "Oswald",
    fontSize: 30,
    color: colors.midnight,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "Oswald",
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.midnight,
    marginBottom: 4,
  },
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  line: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.35,
  },
  muted: {
    color: colors.muted,
  },
  tableHeader: {
    marginTop: 12,
    backgroundColor: colors.dusk,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: colors.surface,
    fontFamily: "Oswald",
    fontSize: 10,
    textTransform: "uppercase",
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  trHead: {
    flexDirection: "row",
    backgroundColor: colors.headerGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  trLast: {
    borderBottomWidth: 0,
  },
  c1: { width: "50%", fontSize: 9 },
  c2: { width: "16%", fontSize: 9, textAlign: "right" },
  c3: { width: "17%", fontSize: 9, textAlign: "right" },
  c4: { width: "17%", fontSize: 9, textAlign: "right" },
  th: { fontFamily: "Oswald", color: colors.midnight },
  td: { fontFamily: "Inter", color: colors.text },
  summary: {
    marginTop: 10,
    marginLeft: "52%",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  total: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: "Oswald",
    fontSize: 10,
    textTransform: "uppercase",
  },
  totalValue: {
    fontFamily: "Oswald",
    fontSize: 20,
    color: colors.accent,
    textAlign: "right",
  },
  paymentCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
    fontFamily: "Inter",
    lineHeight: 1.35,
  },
});

export type InvoiceLineItem = {
  serviceItem: string;
  quantity: number;
  unitCost: number;
  total: number;
};

export type InvoicePDFData = {
  estimateTitle: string;
  generatedAt: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate?: string;
  invoiceAmount: number;
  contractTotal: number;
  billedToDate: number;
  remainingBalance: number;
  invoiceStatus: string;
  paymentMethod?: string;
  paymentInstructions?: string;
  clientName?: string;
  clientAddress?: string;
  contractorProfile?: {
    businessName: string | null;
    businessAddress?: string | null;
    businessPhone?: string | null;
    businessEmail?: string | null;
  };
  lineItems: InvoiceLineItem[];
};

function usd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function qty(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

interface Props {
  data: InvoicePDFData;
}

export function createInvoicePDF(
  data: InvoicePDFData,
): ReactElement<DocumentProps> {
  ensurePdfFonts();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.top}>
          <View style={{ width: "55%" }}>
            <Text style={styles.heading}>Invoice</Text>
            <Text style={[styles.line, styles.muted]}>
              Pro Construction Calc
            </Text>
          </View>

          <View style={[styles.box, { width: "45%" }]}>
            <Text style={styles.sectionTitle}>Contractor Profile</Text>
            <Text style={styles.line}>
              {data.contractorProfile?.businessName || "Pro Construction Calc"}
            </Text>
            {data.contractorProfile?.businessAddress && (
              <Text style={styles.line}>
                {data.contractorProfile.businessAddress}
              </Text>
            )}
            {data.contractorProfile?.businessPhone && (
              <Text style={styles.line}>
                {data.contractorProfile.businessPhone}
              </Text>
            )}
            {data.contractorProfile?.businessEmail && (
              <Text style={styles.line}>
                {data.contractorProfile.businessEmail}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.box, styles.col]}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={styles.line}>
              {data.clientName || "Client not specified"}
            </Text>
            {data.clientAddress && (
              <Text style={styles.line}>{data.clientAddress}</Text>
            )}
          </View>

          <View style={[styles.box, styles.col]}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.line}>Invoice #: {data.invoiceNumber}</Text>
            <Text style={styles.line}>Issued: {data.issuedDate}</Text>
            <Text style={styles.line}>
              Due: {data.dueDate || "Upon receipt"}
            </Text>
            <Text style={styles.line}>Status: {data.invoiceStatus}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Progress Billing Items</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.c1, styles.th]}>Service / Item</Text>
            <Text style={[styles.c2, styles.th]}>Quantity</Text>
            <Text style={[styles.c3, styles.th]}>Unit Cost</Text>
            <Text style={[styles.c4, styles.th]}>Total</Text>
          </View>

          {data.lineItems.map((row, index) => (
            <View
              key={`${row.serviceItem}-${index}`}
              style={
                index === data.lineItems.length - 1
                  ? [styles.tr, styles.trLast]
                  : styles.tr
              }
            >
              <Text style={[styles.c1, styles.td]}>{row.serviceItem}</Text>
              <Text style={[styles.c2, styles.td]}>{qty(row.quantity)}</Text>
              <Text style={[styles.c3, styles.td]}>{usd(row.unitCost)}</Text>
              <Text style={[styles.c4, styles.td]}>{usd(row.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.line}>Contract Total</Text>
            <Text style={styles.line}>{usd(data.contractTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.line}>Billed To Date</Text>
            <Text style={styles.line}>{usd(data.billedToDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.line}>Remaining Balance</Text>
            <Text style={styles.line}>{usd(data.remainingBalance)}</Text>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Current Invoice Total</Text>
            <Text style={styles.totalValue}>{usd(data.invoiceAmount)}</Text>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Text style={styles.line}>
            Method: {data.paymentMethod?.trim() || "Not specified"}
          </Text>
          <Text style={[styles.line, styles.muted]}>
            {data.paymentInstructions?.trim() ||
              "Payment instructions to be provided by contractor."}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Hold Harmless: Client acknowledges billing values are based on work
            completed to date and agrees to resolve scope disputes through the
            contract change-order process.
          </Text>
          <Text style={styles.footerText}>Generated: {data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}

export function InvoicePDF({ data }: Props) {
  return createInvoicePDF(data);
}

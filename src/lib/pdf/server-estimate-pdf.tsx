"use server";
/* eslint-disable jsx-a11y/alt-text */

import { Buffer } from "node:buffer";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

type SignatureBlock = {
  signerName?: string | null;
  signerEmail?: string | null;
  signatureDataUrl?: string | null;
  signedAt?: string | null;
};

export type EstimatePdfPayload = {
  estimateName: string;
  jobName: string;
  calculatorLabel: string;
  generatedAt: string;
  brandName: string;
  contractorEmail?: string | null;
  contractorPhone?: string | null;
  logoUrl?: string | null;
  results: Array<{
    label: string;
    value: string | number;
    unit: string;
  }>;
  materialList: string[];
  signature?: SignatureBlock;
};

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyf.woff2", fontStyle: "normal", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMUQhLyf.woff2", fontStyle: "normal", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMWlhLyf.woff2", fontStyle: "normal", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "3 solid #f97316",
    paddingBottom: 12,
    gap: 10,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandName: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  brandSub: { color: "#475569" },
  meta: { alignItems: "flex-end", gap: 2 },
  metaLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
    fontSize: 9,
  },
  metaValue: { fontSize: 12, fontWeight: 700 },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 700,
  },
  chipRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    border: "1 solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  hero: {
    marginTop: 10,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  heroLabel: {
    textTransform: "uppercase",
    fontSize: 9,
    color: "#cbd5e1",
    letterSpacing: 1,
  },
  heroValue: { fontSize: 22, fontWeight: 800, color: "#fb923c" },
  table: {
    width: "100%",
    border: "1 solid #cbd5e1",
    borderRadius: 10,
    overflow: "hidden",
  },
  row: { flexDirection: "row" },
  cellHeader: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 8,
    fontSize: 10,
    fontWeight: 700,
  },
  cell: { flex: 1, padding: 8, borderTop: "1 solid #e2e8f0" },
  cellNarrow: { flexBasis: "26%", padding: 8, borderTop: "1 solid #e2e8f0" },
  signature: {
    marginTop: 14,
    padding: 10,
    border: "1 solid #e2e8f0",
    borderRadius: 10,
    gap: 6,
  },
  logo: { width: 46, height: 46, borderRadius: 10, objectFit: "contain" },
});

function toDisplayValue(value: string | number) {
  return typeof value === "number" ? value.toFixed(2) : String(value);
}

function EstimateDocument(payload: EstimatePdfPayload) {
  const primaryResult = payload.results[0];

  const rows =
    payload.materialList.length > 0
      ? payload.materialList.map((item, index) => ({
          key: `${item}-${index}`,
          item,
          value: primaryResult ? toDisplayValue(primaryResult.value) : "Included",
          unit: primaryResult?.unit || "estimate",
        }))
      : payload.results.map((result, index) => ({
          key: `${result.label}-${index}`,
          item: result.label,
          value: toDisplayValue(result.value),
          unit: result.unit,
        }));

  return (
    <Document title={payload.estimateName} author={payload.brandName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {payload.logoUrl ? (
              <Image src={payload.logoUrl} style={styles.logo} />
            ) : (
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: "#f97316",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                <Text>P</Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{payload.brandName}</Text>
              <Text style={styles.brandSub}>{payload.calculatorLabel}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{payload.generatedAt}</Text>
            <Text style={styles.metaLabel}>Estimate</Text>
            <Text style={styles.metaValue}>{payload.estimateName}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Project</Text>
        <Text style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
          {payload.jobName || payload.estimateName}
        </Text>
        <View style={styles.chipRow}>
          {payload.contractorEmail ? (
            <View style={styles.chip}>
              <Text>{payload.contractorEmail}</Text>
            </View>
          ) : null}
          {payload.contractorPhone ? (
            <View style={styles.chip}>
              <Text>{payload.contractorPhone}</Text>
            </View>
          ) : null}
        </View>

        {primaryResult ? (
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Primary Result</Text>
            <Text style={styles.heroValue}>
              {toDisplayValue(primaryResult.value)} {primaryResult.unit}
            </Text>
            <Text>{primaryResult.label}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Materials & Results</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { flex: 1.3 }]}>Item</Text>
            <Text style={styles.cellHeader}>Value</Text>
            <Text style={[styles.cellHeader, styles.cellNarrow]}>Unit</Text>
          </View>
          {rows.map((row, index) => (
            <View key={row.key} style={styles.row}>
              <Text style={[styles.cell, { flex: 1.3, backgroundColor: index % 2 ? "#f8fafc" : "#ffffff" }]}>
                {row.item}
              </Text>
              <Text style={[styles.cell, { backgroundColor: index % 2 ? "#f8fafc" : "#ffffff" }]}>{row.value}</Text>
              <Text style={[styles.cellNarrow, { backgroundColor: index % 2 ? "#f8fafc" : "#ffffff" }]}>{row.unit}</Text>
            </View>
          ))}
        </View>

        {payload.signature ? (
          <View style={styles.signature}>
            <Text style={{ fontWeight: 700, fontSize: 12 }}>Signature</Text>
            {payload.signature.signatureDataUrl ? (
              <Image
                style={{ width: 180, height: 60, objectFit: "contain" }}
                src={payload.signature.signatureDataUrl}
              />
            ) : null}
            <Text>Signer: {payload.signature.signerName ?? "N/A"}</Text>
            <Text>Email: {payload.signature.signerEmail ?? "N/A"}</Text>
            <Text>Signed at: {payload.signature.signedAt ?? "Pending"}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

type PdfRenderOutput =
  | Uint8Array
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>;

function isWebReadableStream(
  value: PdfRenderOutput,
): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && "getReader" in value;
}

function isNodeReadableStream(
  value: PdfRenderOutput,
): value is NodeJS.ReadableStream {
  return typeof value === "object" && "on" in value;
}

async function readWebStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    totalLength += value.byteLength;
  }

  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

async function readNodeStream(stream: NodeJS.ReadableStream) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer | Uint8Array | string) => {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
        return;
      }

      chunks.push(Buffer.from(chunk));
    });

    stream.on("end", () => {
      const merged = Buffer.concat(chunks);
      resolve(
        new Uint8Array(merged.buffer, merged.byteOffset, merged.byteLength),
      );
    });
    stream.on("error", reject);
  });
}

export async function renderEstimatePdfBytes(payload: EstimatePdfPayload) {
  const output = (await renderToBuffer(
    <EstimateDocument {...payload} />,
  )) as PdfRenderOutput;

  if (output instanceof Uint8Array) {
    return new Uint8Array(output.buffer, output.byteOffset, output.byteLength);
  }

  if (isWebReadableStream(output)) {
    return readWebStream(output);
  }

  if (isNodeReadableStream(output)) {
    return readNodeStream(output);
  }

  throw new TypeError("Unsupported PDF render output type.");
}

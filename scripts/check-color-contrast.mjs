import fs from "node:fs/promises";
import path from "node:path";

const cssPath = path.resolve(process.cwd(), "src/app/globals.css");

const css = await fs.readFile(cssPath, "utf8");
const tokenMatches = Array.from(css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g));
const tokens = {};
for (const [, name, value] of tokenMatches) {
  if (tokens[name]) continue;
  tokens[name] = value.toLowerCase();
}

const combos = [
  { label: "Body text on surface", text: "--color-ink", bg: "--color-surface", min: 7 },
  { label: "Body text on background", text: "--color-ink", bg: "--color-bg", min: 7 },
  { label: "Body mid text on surface alt", text: "--color-ink-mid", bg: "--color-surface-alt" },
  { label: "Body dim text on surface alt", text: "--color-ink-dim", bg: "--color-surface-alt" },
  { label: "Nav text on nav background", text: "--color-nav-text", bg: "--color-nav-bg" },
  { label: "Nav active text on nav background", text: "--color-nav-active", bg: "--color-nav-bg" },
  { label: "Brand badge text", text: "#ffffff", bg: "--color-orange-brand" },
  { label: "Brand badge hover text", text: "#ffffff", bg: "--color-orange-dark" },
  { label: "Deep brand badge text", text: "#ffffff", bg: "--color-orange-deep" },
  { label: "Google card body text", text: "--color-ink", bg: "--color-surface", min: 7 },
  { label: "Google info text on card", text: "--color-ink-dim", bg: "--color-surface-alt" },
  { label: "Footer link text on surface", text: "--color-ink", bg: "--color-surface" },
  { label: "Footer dim text on background", text: "--color-ink-dim", bg: "--color-bg" },
];

const hexToLuminance = (hex) => {
  const normalized = hex.replace("#", "");
  const parsed = parseInt(normalized, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrastRatio = (a, b) => {
  const max = Math.max(a, b);
  const min = Math.min(a, b);
  return (max + 0.05) / (min + 0.05);
};

const resolveColor = (input) => {
  const trimmed = input.trim();
  if (trimmed.startsWith("var(") && trimmed.endsWith(")")) {
    return resolveColor(trimmed.slice(4, -1));
  }
  if (trimmed.startsWith("--")) {
    const tokenValue = tokens[trimmed.slice(2)];
    if (!tokenValue) {
      throw new Error(`Unknown token ${trimmed}`);
    }
    return tokenValue;
  }
  return trimmed;
};

const failures = [];

for (const combo of combos) {
  const textColor = resolveColor(combo.text);
  const bgColor = resolveColor(combo.bg);
  const textLum = hexToLuminance(textColor);
  const bgLum = hexToLuminance(bgColor);
  const ratio = contrastRatio(textLum, bgLum);
  const minRatio = combo.min ?? 4.5;
  console.log(`${combo.label}: ${ratio.toFixed(2)} (min ${minRatio})`);
  if (ratio < minRatio) {
    failures.push(`${combo.label} ratio ${ratio.toFixed(2)} < ${minRatio}`);
  }
}

if (failures.length) {
  throw new Error(
    `ADA color checks failed:\n${failures.map((f) => `• ${f}`).join("\n")}`,
  );
}

console.log("All ADA color checks passed.");

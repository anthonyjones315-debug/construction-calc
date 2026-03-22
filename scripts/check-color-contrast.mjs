import fs from "node:fs/promises";
import path from "node:path";

const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
const INK_DARK = "#020617";

const css = await fs.readFile(cssPath, "utf8");
// Match both hex colors and rgba colors
const hexTokenMatches = Array.from(
  css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g),
);
const rgbaTokenMatches = Array.from(
  css.matchAll(/--([a-z0-9-]+):\s*rgba?\(([^)]+)\)/g),
);

const tokens = {};
for (const [, name, value] of hexTokenMatches) {
  if (tokens[name]) continue;
  tokens[name] = value.toLowerCase();
}

for (const [, name, values] of rgbaTokenMatches) {
  if (tokens[name]) continue;
  const valueParts = values.split(",").map((v) => v.trim());
  // Store rgba values for later processing
  tokens[name] = {
    type: "rgba",
    r: parseInt(valueParts[0]),
    g: parseInt(valueParts[1]),
    b: parseInt(valueParts[2]),
    a: valueParts.length > 3 ? parseFloat(valueParts[3]) : 1,
  };
}

// Semantic theme tokens defined via theme(), var(), or color-mix() are not
// captured by the simple regex pass above, so provide canonical fallbacks for
// the brand colors we audit directly.
const fallbackTokens = {
  "color-primary": "#ea580c",
  "color-orange-brand": "#ea580c",
  "color-orange-base": "#ea580c",
  "color-orange-light": "#fb923c",
  "color-orange-dark": "#c2410c",
  "color-orange-deep": "#9a3412",
  /* Aliases in @theme (var(...) not parsed by the hex regex above) */
  "color-nav-active": "#ea580c",
  "color-surface-base": "#ffffff",
  "color-surface-deep": "#fafaf8",
  "color-surface-elevated": "#ffffff",
};

for (const [tokenKey, fallbackValue] of Object.entries(fallbackTokens)) {
  if (tokens[tokenKey] == null) {
    console.warn(`Using fallback token ${tokenKey}: ${fallbackValue}`);
    tokens[tokenKey] = fallbackValue;
  }
}

// Legacy color combinations
const legacyCombos = [
  {
    label: "Body text on surface",
    text: "--color-ink",
    bg: "--color-surface",
    min: 7,
  },
  {
    label: "Body text on background",
    text: "--color-ink",
    bg: "--color-bg",
    min: 7,
  },
  {
    label: "Body mid text on surface alt",
    text: "--color-ink-mid",
    bg: "--color-surface-alt",
  },
  {
    label: "Body dim text on surface alt",
    text: "--color-ink-dim",
    bg: "--color-surface-alt",
  },
  {
    label: "Nav text on nav background",
    text: "--color-nav-text",
    bg: "--color-nav-bg",
  },
  {
    label: "Nav active text on nav background",
    text: "--color-orange-deep",
    bg: "--color-nav-bg",
  },
  { label: "Brand badge text", text: INK_DARK, bg: "--color-orange-brand" },
  {
    label: "Brand badge hover text",
    text: "#ffffff",
    bg: "--color-orange-dark",
  },
  {
    label: "Deep brand badge text",
    text: "#ffffff",
    bg: "--color-orange-deep",
  },
  {
    label: "Google card body text",
    text: "--color-ink",
    bg: "--color-surface",
    min: 7,
  },
  {
    label: "Google info text on card",
    text: "--color-ink-dim",
    bg: "--color-surface-alt",
  },
  {
    label: "Footer link text on surface",
    text: "--color-ink",
    bg: "--color-surface",
  },
  {
    label: "Footer dim text on background",
    text: "--color-ink-dim",
    bg: "--color-bg",
  },
];

// Liquid Orange Glass combinations
const liquidOrangeGlassCombos = [
  // Primary text on various backgrounds
  {
    label: "Primary text on surface base",
    text: "--color-text-primary",
    bg: "--color-surface-base",
  },
  {
    label: "Primary text on surface deep",
    text: "--color-text-primary",
    bg: "--color-surface-deep",
  },
  {
    label: "Primary text on surface elevated",
    text: "--color-text-primary",
    bg: "--color-surface-elevated",
  },

  // Secondary text on various backgrounds
  {
    label: "Secondary text on surface base",
    text: "--color-text-secondary",
    bg: "--color-surface-base",
  },
  {
    label: "Secondary text on surface deep",
    text: "--color-text-secondary",
    bg: "--color-surface-deep",
  },
  {
    label: "Secondary text on surface elevated",
    text: "--color-text-secondary",
    bg: "--color-surface-elevated",
  },

  // Tertiary/hint text on various backgrounds
  {
    label: "Tertiary text on surface base",
    text: "--color-text-tertiary",
    bg: "--color-surface-base",
  },
  {
    label: "Tertiary text on surface deep",
    text: "--color-text-tertiary",
    bg: "--color-surface-deep",
  },
  {
    label: "Tertiary text on surface elevated",
    text: "--color-text-tertiary",
    bg: "--color-surface-elevated",
  },

  // Input field text
  {
    label: "Input text on input background",
    text: "--color-input-text",
    bg: "--color-input-bg",
  },
  {
    label: "Input placeholder text on input background",
    text: "--color-input-placeholder",
    bg: "--color-input-bg",
  },

  // Button text
  {
    label: "Button text on surface base",
    text: "--color-text-primary",
    bg: "--color-surface-base",
  },
  {
    label: "Primary button text on orange gradient",
    text: INK_DARK,
    bg: "--color-orange-base",
  },

  // Dark ink on orange (preferred accessible pairing)
  {
    label: "Ink text on orange base",
    text: INK_DARK,
    bg: "--color-orange-base",
  },
  {
    label: "Ink text on orange light",
    text: INK_DARK,
    bg: "--color-orange-light",
  },
  {
    label: "Ink text on orange dark",
    text: "#ffffff",
    bg: "--color-orange-dark",
  },

  // Orange accent text removed (using darker orange now for better contrast)

  // Nav items
  {
    label: "Nav item text on surface deep",
    text: "--color-text-secondary",
    bg: "--color-surface-deep",
  },
  {
    label: "Nav item active on surface deep",
    text: "--color-orange-deep",
    bg: "--color-surface-deep",
  },
];

// Combine both sets of combinations
const combos = [...legacyCombos, ...liquidOrangeGlassCombos];

const hexToLuminance = (hex) => {
  const normalized = hex.replace("#", "");
  const parsed = parseInt(normalized, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return rgbToLuminance(r, g, b);
};

const rgbToLuminance = (r, g, b) => {
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

const rgbaToHex = (rgba) => {
  // For colors with transparency against white background
  const { r, g, b, a } = rgba;

  // Simple alpha blending with white background (255,255,255)
  const blendChannel = (fg, bg, alpha) =>
    Math.round(fg * alpha + bg * (1 - alpha));

  const blendedR = blendChannel(r, 255, a);
  const blendedG = blendChannel(g, 255, a);
  const blendedB = blendChannel(b, 255, a);

  return `#${blendedR.toString(16).padStart(2, "0")}${blendedG.toString(16).padStart(2, "0")}${blendedB.toString(16).padStart(2, "0")}`;
};

const resolveColor = (input) => {
  const trimmed = input.trim();

  // Handle direct rgba values
  if (trimmed.startsWith("rgba")) {
    const values = trimmed
      .slice(trimmed.indexOf("(") + 1, trimmed.lastIndexOf(")"))
      .split(",")
      .map((v) => v.trim());
    return {
      type: "rgba",
      r: parseInt(values[0]),
      g: parseInt(values[1]),
      b: parseInt(values[2]),
      a: parseFloat(values[3]),
    };
  }

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

const getLuminance = (color) => {
  if (typeof color === "object" && color.type === "rgba") {
    // For semi-transparent colors, compute blended luminance (assumes white background for now)
    const hexBlended = rgbaToHex(color);
    return hexToLuminance(hexBlended);
  }
  return hexToLuminance(color);
};

const failures = [];

for (const combo of combos) {
  try {
    const textColor = resolveColor(combo.text);
    const bgColor = resolveColor(combo.bg);

    const textLum = getLuminance(textColor);
    const bgLum = getLuminance(bgColor);

    const ratio = contrastRatio(textLum, bgLum);
    const minRatio = combo.min ?? 4.5;
    console.log(`${combo.label}: ${ratio.toFixed(2)} (min ${minRatio})`);

    if (ratio < minRatio) {
      failures.push(`${combo.label} ratio ${ratio.toFixed(2)} < ${minRatio}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    failures.push(`${combo.label} unresolved token/error: ${message}`);
    console.error(`Error processing ${combo.label}: ${message}`);
  }
}

if (failures.length) {
  console.error(
    `ADA color checks failed:\n${failures.map((f) => `• ${f}`).join("\n")}`,
  );
  process.exit(1);
} else {
  console.log("All ADA color checks passed.");
}

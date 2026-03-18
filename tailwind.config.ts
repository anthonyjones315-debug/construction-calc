import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  const int = Number.parseInt(value, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(from: string, to: string, ratio: number) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);

  return rgbToHex(
    start.r + (end.r - start.r) * ratio,
    start.g + (end.g - start.g) * ratio,
    start.b + (end.b - start.b) * ratio,
  );
}

function buildComplementaryPalette(baseHex: string) {
  const { r, g, b } = hexToRgb(baseHex);
  const complementHex = rgbToHex(255 - r, 255 - g, 255 - b);

  return {
    10: mixHex("#ffffff", complementHex, 0.1),
    20: mixHex("#ffffff", complementHex, 0.2),
    30: mixHex("#ffffff", complementHex, 0.35),
    40: mixHex("#ffffff", complementHex, 0.5),
    50: complementHex,
    60: mixHex(complementHex, "#0f172a", 0.15),
    70: mixHex(complementHex, "#0f172a", 0.3),
    80: mixHex(complementHex, "#0f172a", 0.45),
    90: mixHex(complementHex, "#020617", 0.6),
  };
}

const primary = "#FF7A00";
const secondary = buildComplementaryPalette(primary);

const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: primary,
          foreground: "#ffffff",
        },
        secondary,
        steelworks: {
          900: "#05070a",
          700: "#101315",
        },
        rust: {
          DEFAULT: "#f7941d",
          dark: "#d06a18",
          accent: "#f9a15a",
        },
        orange: {
          base: primary,
          light: mixHex(primary, "#ffffff", 0.12),
          dark: mixHex(primary, "#0f172a", 0.18),
          glow: "rgb(255 122 0 / 0.3)",
          rim: "rgb(255 160 102 / 0.75)",
        },
        surface: {
          deep: "rgb(2 6 23 / 0.95)",
          base: "rgb(15 23 42 / 0.85)",
          elevated: "rgb(30 41 59 / 0.75)",
          frost: "rgb(255 255 255 / 0.08)",
        },
      },
      screens: {
        "iphone-15": "393px",
        "iphone-15-plus": "430px",
        "iphone-15-tall": { raw: "(min-height: 844px)" },
        "iphone-15-landscape": { raw: "(min-width: 852px) and (max-height: 430px)" },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".backdrop-glass": {
          "@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))":
            {
              backdropFilter: "blur(24px) saturate(180%)",
              "-webkit-backdrop-filter": "blur(24px) saturate(180%)",
            },
        },
        ".backdrop-glass-light": {
          "@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))":
            {
              backdropFilter: "blur(12px) saturate(160%)",
              "-webkit-backdrop-filter": "blur(12px) saturate(160%)",
            },
        },
        ".backdrop-glass-heavy": {
          "@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))":
            {
              backdropFilter: "blur(36px) saturate(200%)",
              "-webkit-backdrop-filter": "blur(36px) saturate(200%)",
            },
        },
        ".glass-gpu": {
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backdropFilter: "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
        },
        ".no-scroll-shell": {
          height: "844px",
          overflow: "hidden",
          position: "fixed",
          width: "100%",
        },
      });
    }),
  ],
} satisfies Config;

export default config;

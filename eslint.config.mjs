import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  { ignores: [".next/**", "dist/**", "dist-calcs/**", "node_modules/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-check": false,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,cjs,mjs}"],
    ignores: [
      "eslint.config.mjs",
      "postcss.config.mjs",
      "scripts/benchmark-frontend-metrics.mjs",
      "scripts/check-calculations.mjs",
      "scripts/check-color-contrast.mjs",
      "scripts/enforce-types-only.mjs",
      "scripts/rewrite-calcs-paths.mjs",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "Plain JavaScript is blocked in this repository. Use TypeScript or add an explicit tooling exception.",
        },
      ],
    },
  },
]);

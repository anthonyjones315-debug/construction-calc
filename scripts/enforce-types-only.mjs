import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const blockedExtensions = new Set([".js", ".jsx", ".cjs", ".mjs"]);
const ignoredDirectories = new Set([
  ".git",
  ".github",
  ".next",
  "dist",
  "dist-calcs",
  "node_modules",
  "public",
]);
const approvedFiles = new Set([
  "eslint.config.mjs",
  "postcss.config.mjs",
  "scripts/benchmark-frontend-metrics.mjs",
  "scripts/check-calculations.mjs",
  "scripts/check-color-contrast.mjs",
  "scripts/enforce-types-only.mjs",
  "scripts/rewrite-calcs-paths.mjs",
]);

async function collectViolations(currentDir, violations) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path
      .relative(rootDir, absolutePath)
      .split(path.sep)
      .join("/");

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      await collectViolations(absolutePath, violations);
      continue;
    }

    const extension = path.extname(entry.name);
    if (!blockedExtensions.has(extension)) {
      continue;
    }

    if (approvedFiles.has(relativePath)) {
      continue;
    }

    violations.push(relativePath);
  }
}

const violations = [];
await collectViolations(rootDir, violations);

if (violations.length > 0) {
  console.error("Untyped JavaScript files are blocked in this repository.");
  console.error(
    "Migrate these files to TypeScript or add them to the explicit tooling exception list:",
  );
  for (const violation of violations.sort()) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Typed-code repository policy check passed.");

#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

type IssueMap = Record<string, string[]>;

const ROOT = process.cwd();
const SCAN_DIRECTORIES = ["src/components", "src/app"];
const ALLOWED_HEX = new Set([
  "#05070a",
  "#0b101c",
  "#101315",
  "#11151d",
  "#111726",
  "#1f2533",
  "#1e242f",
  "#f6f4ef",
  "#fdfbf7",
  "#f4f5f7",
  "#ffffff",
  "#dcd8d1",
  "#dce3ea",
  "#4f5666",
  "#7b8292",
  "#9aa4b1",
  "#c5cad2",
  "#f7941d",
  "#d06a18",
  "#c15a2c",
  "#f9a15a",
]);
const ALLOWED_TAILWIND_COLORS = new Set(["steelworks-900", "steelworks-700", "rust-accent"]);
const COLOR_CLASS_PREFIXES = [
  "text",
  "bg",
  "border",
  "ring",
  "from",
  "to",
  "outline",
  "fill",
  "stroke",
  "divide",
  "accent",
  "placeholder",
];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".html"]);

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];

  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(resolved)));
    } else if (extensionAllowed(entry.name)) {
      files.push(resolved);
    }
  }

  return files;
}

function extensionAllowed(filename: string): boolean {
  return EXTENSIONS.has(path.extname(filename));
}

function normalizeHex(raw: string): string {
  const hex = raw.toLowerCase();
  if (hex.length === 4) {
    const expanded = hex
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("");
    return `#${expanded}`;
  }
  return hex;
}

function isAllowedTailwindClass(value: string): boolean {
  const cleaned = value.replace(/]/g, "");
  const colorPart = cleaned.split("/")[0];
  return ALLOWED_TAILWIND_COLORS.has(colorPart);
}

function recordIssue(map: IssueMap, file: string, detail: string) {
  if (!map[file]) map[file] = [];
  if (!map[file].includes(detail)) map[file].push(detail);
}

async function runThemeAudit() {
  const files = (
    await Promise.all(
      SCAN_DIRECTORIES.map(async (dir) => {
        const resolved = path.join(ROOT, dir);
        return collectFiles(resolved);
      }),
    )
  ).flat();

  const hexIssues: IssueMap = {};
  const tailwindIssues: IssueMap = {};
  const fontIssues: IssueMap = {};

  const tailwindRegex = new RegExp(
    `(?:^|[\\s"'\\\`])((?:(?:[\\w-]+:)*)(?:${COLOR_CLASS_PREFIXES.join("|")})-[^\\s"'\\\`<>]+)`,
    "gi",
  );
  const fontFamilyCssRegex = /font-family\s*:\s*([^;]+);/gi;
  const fontFamilyCamelRegex = /fontFamily\s*:\s*([\"']?)([^\"';\n]+)\1/gi;
  const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const relativePath = path.relative(ROOT, file);

    let match: RegExpExecArray | null;

    while ((match = hexRegex.exec(content))) {
      const normalized = normalizeHex(match[0]);
      if (!ALLOWED_HEX.has(normalized)) {
        recordIssue(hexIssues, relativePath, `Hard-coded color ${match[0]}`);
      }
    }

    while ((match = tailwindRegex.exec(content))) {
      const className = match[1];
      if (!className) continue;
      const lastSegment = className.split(":").pop()!;
      if (!isAllowedTailwindClass(lastSegment)) {
        recordIssue(tailwindIssues, relativePath, `Tailwind class ${className}`);
      }
    }

    while ((match = fontFamilyCssRegex.exec(content))) {
      const value = match[1].toLowerCase();
      if (!value.includes("oswald") && !value.includes("inter")) {
        recordIssue(fontIssues, relativePath, `CSS font-family ${match[1].trim()}`);
      }
    }

    while ((match = fontFamilyCamelRegex.exec(content))) {
      const value = match[2].toLowerCase();
      if (!value.includes("oswald") && !value.includes("inter")) {
        recordIssue(fontIssues, relativePath, `JS fontFamily ${match[2].trim()}`);
      }
    }
  }

  const hasIssues =
    Object.keys(hexIssues).length ||
    Object.keys(tailwindIssues).length ||
    Object.keys(fontIssues).length;

  console.log("Non-Compliance Report");
  if (!hasIssues) {
    console.log("✅ No non-compliant colors or fonts detected in /components or /app.");
    return;
  }

  const printSection = (title: string, issues: IssueMap) => {
    if (!Object.keys(issues).length) return;
    console.log(`\n${title}:`);
    for (const file of Object.keys(issues).sort()) {
      console.log(`  ${file}:`);
      for (const detail of issues[file]) {
        console.log(`    • ${detail}`);
      }
    }
  };

  printSection("Hard-coded color violations", hexIssues);
  printSection("Tailwind class violations", tailwindIssues);
  printSection("Font-family violations", fontIssues);

  process.exit(1);
}

runThemeAudit().catch((error) => {
  console.error("Theme audit failed:", error);
  process.exit(1);
});

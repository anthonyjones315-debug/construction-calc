// discover-features.ts
// Playwright script to crawl the app and record all internal routes.
import { chromium } from "playwright";
import type { Page } from "playwright";
import fs from "fs";
import path from "path";

// Set to the base URL defined in playwright.config.ts
const baseURL = process.env.BASE_URL || "http://localhost:3000";
// Limit to prevent infinite crawling
const MAX_PAGES = 200;

// Set to store visited URLs
const visited = new Set<string>();
const routes: { url: string; title: string }[] = [];

async function crawl(page: Page, url: string) {
  if (visited.has(url) || visited.size >= MAX_PAGES) return;
  visited.add(url);
  try {
    await page.goto(url, { timeout: 120000, waitUntil: "domcontentloaded" });
  } catch (e) {
    console.warn(`Failed to load ${url}: ${e}`);
    return;
  }
  const title = await page.title();
  routes.push({ url, title });
  // Find all internal links
  const links = await page.$$eval("a[href]", (as: HTMLAnchorElement[]) =>
    as.map((a) => a.href)
  );
  for (const link of links) {
    if (link.startsWith(baseURL) && !visited.has(link)) {
      await crawl(page, link);
    }
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await crawl(page, baseURL);
  await browser.close();

  // Write JSON map
  const outDir = path.resolve("tmp");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const jsonPath = path.join(outDir, "feature-map.json");
  fs.writeFileSync(jsonPath, JSON.stringify(routes, null, 2));

  // Generate markdown summary
  const mdLines = ["# Feature Discovery", "", "| URL | Title |", "| --- | ----- |"];
  for (const r of routes) {
    mdLines.push(`| ${r.url} | ${r.title} |`);
  }
  const mdPath = path.resolve("docs", "feature-discovery.md");
  fs.writeFileSync(mdPath, mdLines.join("\n"));
  console.log(`Discovered ${routes.length} routes. JSON saved to ${jsonPath}`);
})();

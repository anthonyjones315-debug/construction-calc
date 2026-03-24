import fs from "node:fs/promises";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { gotoReady } from "../e2e/lib/app";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function openGuideStep(page: Page, route: string): Promise<void> {
  await gotoReady(page, route);
}

export async function captureGuideScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<string> {
  const fileName = `${slugify(testInfo.title)}-${slugify(name)}.png`;
  const outputDir = path.resolve("artifacts/guides/screenshots");
  const outputPath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });
  await page.screenshot({
    path: outputPath,
    fullPage: true,
  });

  await testInfo.attach(name, {
    path: outputPath,
    contentType: "image/png",
  });

  return outputPath;
}

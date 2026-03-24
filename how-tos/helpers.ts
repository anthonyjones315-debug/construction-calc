import fs from "node:fs/promises";
import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { expectCalculatorShell, gotoReady } from "../e2e/lib/app";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function openHowToRoute(
  page: Page,
  route: string,
): Promise<void> {
  await gotoReady(page, route);
  await expect(page.locator("body")).toBeVisible();

  const popupCloseButton = page
    .getByRole("dialog")
    .getByRole("button", { name: /close/i })
    .first();

  if (await popupCloseButton.isVisible().catch(() => false)) {
    await popupCloseButton.click({ force: true }).catch(() => {});
  }
}

export async function captureHowToScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<string> {
  const fileName = `${slugify(testInfo.title)}-${slugify(name)}.png`;
  const outputDir = path.resolve("output/playwright/how-tos/screenshots");
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

export async function fillVisibleNumberInputs(
  page: Page,
  values: string[],
): Promise<void> {
  const inputs = page.locator("input[type='number']").filter({ visible: true });
  await expect(inputs.first()).toBeVisible();
  const count = await inputs.count();

  for (let index = 0; index < Math.min(count, values.length); index += 1) {
    await inputs.nth(index).fill(values[index]);
  }
}

export async function expectHowToCalculatorShell(page: Page): Promise<void> {
  await expectCalculatorShell(page);
}

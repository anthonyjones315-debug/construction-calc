import { test, expect } from "@playwright/test";
import { captureGuideScreenshot, openGuideStep } from "./helpers";
import { expectCalculatorShell } from "../e2e/lib/app";

test.describe("Guide capture — public contractor walkthroughs", () => {
  test("calculator discovery and slab walkthrough", async ({ page }, testInfo) => {
    await openGuideStep(page, "/guide");
    await captureGuideScreenshot(page, testInfo, "guide-home");

    await openGuideStep(page, "/calculators");
    await expect(
      page.getByRole("heading", { name: /commercial-grade space math/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", {
        name: /search construction calculators/i,
      }),
    ).toBeVisible();
    await captureGuideScreenshot(page, testInfo, "calculator-directory");

    await openGuideStep(page, "/calculators/concrete/slab");
    await page.getByLabel(/Run Length|Length/i).first().fill("24");
    await page.getByLabel(/Slab Width|Width/i).first().fill("30");
    await page.getByLabel(/Slab Thickness|Thickness/i).first().fill("4");
    await expectCalculatorShell(page);
    await captureGuideScreenshot(page, testInfo, "slab-results");
  });
});

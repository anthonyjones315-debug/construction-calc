import { test, expect } from "@playwright/test";
import {
  captureHowToScreenshot,
  expectHowToCalculatorShell,
  openHowToRoute,
} from "./helpers";

test.describe("How-to estimate to invoice", () => {
  test("calculator to saved estimate workflow", async ({ page }, testInfo) => {
    await test.step("Start with a live calculator result", async () => {
      await openHowToRoute(page, "/calculators/concrete/slab");
      await page.getByLabel(/Run Length|Length/i).first().fill("20");
      await page.getByLabel(/Slab Width|Width/i).first().fill("24");
      await page.getByLabel(/Slab Thickness|Thickness/i).first().fill("4");
      await expectHowToCalculatorShell(page);
      await captureHowToScreenshot(page, testInfo, "calculator-result");
    });

    await test.step("Save the estimate into the cart workflow", async () => {
      const saveEstimateButton = page.getByRole("button", {
        name: /save estimate/i,
      });
      await expect(saveEstimateButton).toBeVisible();
      await saveEstimateButton.click();

      await openHowToRoute(page, "/cart");
      await captureHowToScreenshot(page, testInfo, "cart");
    });

    await test.step("Open the finalize and PDF workflow", async () => {
      await openHowToRoute(page, "/calculators/concrete/slab");
      const finalizeButton = page.getByRole("button", {
        name: /finalize/i,
      }).first();

      await expect(finalizeButton).toBeVisible();
      await finalizeButton.click();
      await expect(page.getByText(/Finalize Estimate/i)).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "finalize-modal");
    });

    await test.step("Show the saved estimate area", async () => {
      await openHowToRoute(page, "/saved");
      await captureHowToScreenshot(page, testInfo, "saved-estimates");
    });
  });
});

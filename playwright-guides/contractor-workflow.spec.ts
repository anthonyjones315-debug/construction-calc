import { test, expect } from "@playwright/test";
import { captureGuideScreenshot, openGuideStep } from "./helpers";

test.describe("Guide capture — authenticated contractor workflows", () => {
  test("save estimate and open command center workflow", async ({
    page,
  }, testInfo) => {
    await openGuideStep(page, "/calculators/concrete/slab");
    await page.getByLabel(/Run Length|Length/i).first().fill("20");
    await page.getByLabel(/Slab Width|Width/i).first().fill("24");
    await page.getByLabel(/Slab Thickness|Thickness/i).first().fill("4");
    await expect(page.locator(".result-counter").first()).toBeVisible();
    await captureGuideScreenshot(page, testInfo, "calculator-ready-to-save");

    const saveEstimateButton = page.getByRole("button", {
      name: /save estimate/i,
    });
    if (await saveEstimateButton.isVisible().catch(() => false)) {
      await saveEstimateButton.click();
      await captureGuideScreenshot(page, testInfo, "save-estimate-modal-or-state");
    }

    await openGuideStep(page, "/command-center");
    await expect(
      page.getByRole("heading", { name: /command center|dashboard/i }),
    ).toBeVisible();
    await captureGuideScreenshot(page, testInfo, "command-center-dashboard");
  });
});

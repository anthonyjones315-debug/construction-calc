import { test, expect } from "@playwright/test";
import {
  captureHowToScreenshot,
  expectHowToCalculatorShell,
  fillVisibleNumberInputs,
  openHowToRoute,
} from "./helpers";

test.describe("How-to financial audit", () => {
  test("financial terms and county tax walkthrough", async ({
    page,
  }, testInfo) => {
    await test.step("Open saved estimates for audit context", async () => {
      await openHowToRoute(page, "/saved");
      await captureHowToScreenshot(page, testInfo, "saved-estimates");
    });

    await test.step("Open the financial terms reference", async () => {
      await openHowToRoute(page, "/financial-terms");
      await expect(
        page.getByRole("heading", { name: /financial terms/i }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "financial-terms");
    });

    await test.step("Record the tax save workflow", async () => {
      await openHowToRoute(page, "/calculators/business/tax-save");
      await fillVisibleNumberInputs(page, ["125000", "8.75", "15000"]);
      await expectHowToCalculatorShell(page);
      await captureHowToScreenshot(page, testInfo, "tax-save-results");
    });

    await test.step("Show the command center financial context", async () => {
      await openHowToRoute(page, "/command-center");
      await expect(
        page.getByRole("heading", {
          name: /command center|dashboard|create your business/i,
        }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "command-center");
    });
  });
});

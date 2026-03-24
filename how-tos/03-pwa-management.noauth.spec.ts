import { test, expect, devices } from "@playwright/test";
import {
  captureHowToScreenshot,
  expectHowToCalculatorShell,
  openHowToRoute,
} from "./helpers";

test.use({ ...devices["iPhone 14"] });

test.describe("How-to PWA field check", () => {
  test("mobile field-use walkthrough", async ({ page }, testInfo) => {
    await test.step("Open the mobile home screen", async () => {
      await openHowToRoute(page, "/");
      await captureHowToScreenshot(page, testInfo, "mobile-home");
    });

    await test.step("Check a live calculator route", async () => {
      await openHowToRoute(page, "/calculators/concrete/slab");
      await expectHowToCalculatorShell(page);
      await captureHowToScreenshot(page, testInfo, "mobile-calculator");
    });

    await test.step("Open saved estimates and user guide", async () => {
      await openHowToRoute(page, "/saved");
      await captureHowToScreenshot(page, testInfo, "mobile-saved");

      await openHowToRoute(page, "/guide");
      await expect(
        page.getByRole("heading", { name: /user guide/i }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "mobile-guide");
    });
  });
});

import { test, expect } from "@playwright/test";
import {
  captureHowToScreenshot,
  expectHowToCalculatorShell,
  openHowToRoute,
} from "./helpers";

test.describe("How-to quick start", () => {
  test("guide to calculator walkthrough", async ({ page }, testInfo) => {
    await test.step("Open the user guide", async () => {
      await openHowToRoute(page, "/guide");
      await expect(
        page.getByRole("heading", { name: /user guide/i }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "guide-home");
    });

    await test.step("Show the trade directory", async () => {
      await openHowToRoute(page, "/calculators");
      await expect(
        page.getByRole("heading", {
          name: /commercial-grade space math/i,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("searchbox", {
          name: /search construction calculators/i,
        }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "trade-directory");
    });

    await test.step("Fill a concrete slab calculator", async () => {
      await openHowToRoute(page, "/calculators/concrete/slab");
      await page.getByLabel(/Run Length|Length/i).first().fill("24");
      await page.getByLabel(/Slab Width|Width/i).first().fill("30");
      await page.getByLabel(/Slab Thickness|Thickness/i).first().fill("4");
      await expectHowToCalculatorShell(page);
      await captureHowToScreenshot(page, testInfo, "slab-results");
    });

    await test.step("Show support content routes", async () => {
      await openHowToRoute(page, "/glossary");
      await captureHowToScreenshot(page, testInfo, "glossary");

      await openHowToRoute(page, "/field-notes");
      await expect(
        page.getByRole("heading", { name: /field notes/i }),
      ).toBeVisible();
      await captureHowToScreenshot(page, testInfo, "field-notes");
    });
  });
});

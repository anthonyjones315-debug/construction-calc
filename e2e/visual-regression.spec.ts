import { test, expect } from "@playwright/test";
import { calculatorResultsSection } from "./lib/app";

test.describe("Visual Regression — Key Screens", () => {

  test("calculator directory matches baseline", async ({ page }) => {
    await page.goto("/calculators", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /commercial-grade space math/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", {
        name: /search construction calculators/i,
      }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("calculators-directory.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("slab calculator with result matches baseline", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/Run Length/i).fill("20");
    await page.getByLabel(/Slab Width/i).fill("24");
    await page.getByLabel(/Slab Thickness/i).fill("4");
    // Auto-calculates — wait for result
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot("slab-calc-with-result.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("cart page with items matches baseline", async ({ page }) => {
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveScreenshot("cart-with-items.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile: calculator page on Pixel 7", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/calculators/concrete/slab", {
      waitUntil: "domcontentloaded",
    });
    await expect(calculatorResultsSection(page)).toBeVisible();
    await expect(page).toHaveScreenshot("mobile-slab-calc.png", {
      maxDiffPixelRatio: 0.03,
    });
  });

});

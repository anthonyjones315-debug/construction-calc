import { test, expect } from "@playwright/test";

test.describe("Visual Regression — Key Screens", () => {

  test("calculator directory matches baseline", async ({ page }) => {
    await page.goto("/calculators");
    await page.waitForLoadState("networkidle");
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
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("cart-with-items.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile: calculator page on Pixel 7", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/calculators/concrete/slab");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("mobile-slab-calc.png", {
      maxDiffPixelRatio: 0.03,
    });
  });

});

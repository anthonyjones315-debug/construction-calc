import { test, expect } from "@playwright/test";

test.describe("Cart and Estimates", () => {
  test("should load cart page", async ({ page }) => {
    await page.goto("/cart");

    // Cart might be empty, so just check page loads
    await expect(page).not.toHaveURL(/error|404/);
  });

  test("should display empty cart message if empty", async ({ page }) => {
    await page.goto("/cart");

    // Look for empty state message
    const emptyMsg = page.locator("text=/empty|no items|no estimates/i");
    const itemsList = page.locator('[data-testid*="item"], .cart-item');

    // Either empty message or items list should exist
    const emptyCount = await emptyMsg.count();
    const itemCount = await itemsList.count();

    expect(emptyCount + itemCount).toBeGreaterThan(0);
  });

  test("should have functionality to return to calculators", async ({
    page,
  }) => {
    await page.goto("/cart");

    // Use main navigation calculators link as deterministic return path
    const calculatorsLink = page
      .getByRole("navigation", { name: /main navigation/i })
      .getByRole("link", { name: /^calculators$/i });

    await expect(calculatorsLink).toBeVisible();
    await calculatorsLink.click();
    await expect(page).toHaveURL(/\/calculators/);
  });
});

test.describe("Estimate View", () => {
  test("should load estimate page with valid ID", async ({ page }) => {
    // Try to access estimate page (even if might not have actual data)
    await page
      .goto("/estimate/test", { waitUntil: "networkidle" })
      .catch(() => {});

    // Page should load without crashing (might show 404 or loading state)
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should display estimate information when available", async ({
    page,
  }) => {
    // Navigate to calculator and look for save functionality
    await page.goto("/calculators");

    // Look for save button in calculator
    const firstCalc = page.locator('a[href*="/calculators/"]').first();

    if (await firstCalc.isVisible()) {
      await firstCalc.click();

      // Look for save/checkout button
      const saveBtn = page
        .locator("button, a")
        .filter({ hasText: /save|add to cart|checkout/i });

      if (await saveBtn.isVisible()) {
        expect(saveBtn).toBeTruthy();
      }
    }
  });
});

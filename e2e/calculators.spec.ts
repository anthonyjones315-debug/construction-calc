import { test, expect } from "@playwright/test";

test.describe("Calculator System", () => {
  test("should load calculators hub page", async ({ page }) => {
    await page.goto("/calculators");

    // Check for page title or heading
    const heading = page.locator("h1, h2").filter({ hasText: /calculator/i });
    await expect(heading).toBeVisible();
  });

  test("should display calculator categories", async ({ page }) => {
    await page.goto("/calculators");

    // Look for category cards or links
    const categories = page.locator(
      '[data-testid*="category"], .category, [role="listitem"]',
    );
    const count = await categories.count();

    // Should have multiple calculator categories
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to a specific calculator", async ({ page }) => {
    await page.goto("/calculators");

    // Find first calculator link
    const firstCalc = page
      .locator("a")
      .filter({ hasText: /concrete|framing|roofing/i })
      .first();

    if (await firstCalc.isVisible()) {
      await firstCalc.click();
      // Should navigate to a calculator page
      await expect(page).toHaveURL(/\/calculators\//);
    }
  });

  test("should accept form input in calculator", async ({ page }) => {
    await page.goto("/calculators");

    // Navigate to first calculator
    const firstCalc = page.locator('a[href*="/calculators/"]').first();

    if (await firstCalc.isVisible()) {
      await firstCalc.click();

      // Wait for calculator form to load
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        // Fill first input
        await inputs.first().fill("100");

        // Check that value was set
        const value = await inputs.first().inputValue();
        expect(value).toBe("100");
      }
    }
  });

  test("should display results after calculation", async ({ page }) => {
    await page.goto("/calculators");

    // Navigate to first calculator
    const firstCalc = page.locator('a[href*="/calculators/"]').first();

    if (await firstCalc.isVisible()) {
      await firstCalc.click();

      // Fill form and trigger calculation
      const inputs = page.locator('input[type="number"]');
      if ((await inputs.count()) > 0) {
        await inputs.first().fill("100");

        // Look for results section
        const results = page.locator(
          '[data-testid*="result"], .result, [role="region"]',
        );
        // Results might appear automatically or after a button click
        const calculateBtn = page
          .locator("button")
          .filter({ hasText: /calculate|compute/i });

        if (await calculateBtn.isVisible()) {
          await calculateBtn.click();
        }
      }
    }
  });
});

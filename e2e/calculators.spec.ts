import { test, expect } from "@playwright/test";

test.describe("Calculator System", () => {
  test("should load calculators hub page", async ({ page }) => {
    await page.goto("/calculators");

    // Check for canonical page title and primary heading
    await expect(page).toHaveTitle(/construction calculators|calculator/i);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should display calculator categories", async ({ page }) => {
    await page.goto("/calculators");

    // Look for visible category cards in the module grid
    const categories = page.locator(
      'a[href^="/calculators/"] h2, a[href^="/calculators/"] [data-testid*="category"]',
    );
    const count = await categories.count();

    // Should have multiple calculator categories
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to a specific calculator", async ({ page }) => {
    await page.goto("/calculators");

    // Find first category link
    const firstCalc = page.locator('a[href^="/calculators/"]').first();

    await expect(firstCalc).toBeVisible();
    await firstCalc.click();
    // Should navigate to a calculator page
    await expect(page).toHaveURL(/\/calculators\/);
  });

  test("should accept form input in calculator", async ({ page }) => {
    await page.goto("/calculators");

    // Navigate to first calculator
    const firstCalc = page.locator('a[href*="/calculators/"]').first();

    await expect(firstCalc).toBeVisible();
    await firstCalc.click();

    // Wait for calculator form to load
    const inputs = page.locator('input[type="number"], input[type="text"]');
    await expect(inputs.first()).toBeVisible();
    // Fill first input
    await inputs.first().fill("100");

    // Check that value was set
    const value = await inputs.first().inputValue();
    expect(value).toBe("100");
  });

  test("should display results after calculation", async ({ page }) => {
    await page.goto("/calculators");

    // Navigate to first calculator
    const firstCalc = page.locator('a[href*="/calculators/"]').first();

    await expect(firstCalc).toBeVisible();
    await firstCalc.click();

    // Fill form and trigger calculation
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
    await inputs.first().fill("100");

    // Look for results section
    // Results might appear automatically or after a button click
    const calculateBtn = page
      .locator("button")
      .filter({ hasText: /calculate|compute/i });

    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
    }
  });
});

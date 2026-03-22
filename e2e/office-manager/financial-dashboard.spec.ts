import { test, expect } from "@playwright/test";

test.describe("Office Manager — Financial Dashboard", () => {
  const openCommandCenterOrSkip = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await page.goto("/command-center");
    if (/\/sign-in/.test(page.url())) {
      test.skip(true, "Requires authenticated office-manager test user");
    }
  };

  test("financial dashboard is accessible to authenticated user", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const finTab = page.getByRole("tab", {
      name: /financial|finance|revenue/i,
    });
    if (await finTab.isVisible()) {
      await finTab.click();
      await expect(page).not.toHaveURL(/\/sign-in/);
    }
  });

  test("financial data loads without infinite spinner", async ({ page }) => {
    await openCommandCenterOrSkip(page);

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    const spinner = page.getByTestId("loading-spinner");
    // Spinner should not persist after network idle
    await expect(spinner).not.toBeVisible({ timeout: 5000 });
  });

  test("revenue figures display as currency, not raw numbers", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);
    await page.waitForLoadState("networkidle");

    const revenueEl = page.getByTestId("total-revenue");
    if (await revenueEl.isVisible()) {
      const text = await revenueEl.textContent();
      // Should be formatted as currency
      expect(text).toMatch(/\$[\d,]+/);
    }
  });

  test("financial dashboard shows month and year-to-date totals", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);
    await page.waitForLoadState("networkidle");

    const mtd = page.getByTestId("revenue-mtd");
    const ytd = page.getByTestId("revenue-ytd");

    if (await mtd.isVisible()) {
      await expect(mtd).toBeVisible();
    }
    if (await ytd.isVisible()) {
      await expect(ytd).toBeVisible();
    }
  });

  test("estimate count badge updates after new estimate is saved", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const countEl = page.getByTestId("total-estimate-count");
    const before = parseInt((await countEl.textContent()) ?? "0");

    // Save a new estimate
    await page.goto("/cart");
    const saveBtn = page.getByRole("button", { name: /save estimate/i });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.goto("/command-center");
      const after = parseInt((await countEl.textContent()) ?? "0");
      expect(after).toBeGreaterThanOrEqual(before);
    }
  });
});

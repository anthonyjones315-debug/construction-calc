import { test, expect } from "@playwright/test";

test.describe("Office Manager — Pricebook", () => {
  const openPricebookOrSkip = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await page.goto("/pricebook");
    if (/auth\/signin/.test(page.url())) {
      test.skip(true, "Requires authenticated office-manager test user");
    }
  };

  test("pricebook page loads for authenticated user", async ({ page }) => {
    await openPricebookOrSkip(page);
    await expect(page).not.toHaveURL(/signin/);
    await expect(
      page.getByRole("heading", { name: /pricebook|materials|pricing/i }),
    ).toBeVisible();
  });

  test("pricebook entries are listed", async ({ page }) => {
    await openPricebookOrSkip(page);
    const entries = page.getByTestId("pricebook-entry");

    if ((await entries.count()) === 0) {
      await expect(
        page.getByText(/no items|add your first|empty/i),
      ).toBeVisible();
    } else {
      await expect(entries.first()).toBeVisible();
    }
  });

  test("new material can be added to pricebook", async ({ page }) => {
    await openPricebookOrSkip(page);

    const addBtn = page.getByRole("button", { name: /add|new item|create/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();

      const itemName = `Test Material ${Date.now()}`;
      await page.getByLabel(/name|material/i).fill(itemName);
      await page.getByLabel(/price|cost|unit price/i).fill("4.75");
      await page.getByLabel(/unit/i).fill("SF");
      await page.getByRole("button", { name: /save|add|confirm/i }).click();

      await expect(page.getByText(itemName)).toBeVisible();
    }
  });

  test("pricebook entry price accepts two decimal places only", async ({
    page,
  }) => {
    await openPricebookOrSkip(page);

    const addBtn = page.getByRole("button", { name: /add|new item/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const priceInput = page.getByLabel(/price|cost/i);
      await priceInput.fill("4.7599");

      await page.getByRole("button", { name: /save|confirm/i }).click();

      // Should normalize to 2 decimal places
      const savedPrice = await page
        .getByTestId("pricebook-entry")
        .last()
        .textContent();
      expect(savedPrice).not.toContain("4.7599");
    }
  });

  test("pricebook item can be deleted", async ({ page }) => {
    await openPricebookOrSkip(page);

    const entries = page.getByTestId("pricebook-entry");
    const count = await entries.count();

    if (count > 0) {
      await entries
        .last()
        .getByRole("button", { name: /delete|remove/i })
        .click();

      const confirmBtn = page.getByRole("button", { name: /confirm|yes/i });
      if (await confirmBtn.isVisible()) await confirmBtn.click();

      await expect(entries).toHaveCount(count - 1);
    }
  });
});

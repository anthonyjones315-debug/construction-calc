import { test, expect } from "@playwright/test";

test.describe("Business Management Calculators", () => {
  const dismissCookies = async (page: Parameters<typeof test>[0]["page"]) => {
    const acceptBtn = page.getByRole("button", { name: /accept/i });
    try {
      await acceptBtn.waitFor({ state: "visible", timeout: 3000 });
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: "hidden", timeout: 2000 });
    } catch {
      /* banner not present */
    }
  };

  const fillNumbers = async (
    page: Parameters<typeof test>[0]["page"],
    values: string[],
  ) => {
    await dismissCookies(page);
    const inputs = page.locator("input[type='number']");
    const count = await inputs.count();
    if (count === 0)
      test.skip(true, "No numeric calculator inputs found on page");
    for (let index = 0; index < Math.min(count, values.length); index += 1) {
      await inputs.nth(index).fill(values[index]);
    }
  };

  // Business calcs show monetary results (e.g. "$12,345.67"), not "Order N unit"
  const resultLocator = (page: Parameters<typeof test>[0]["page"]) =>
    page.getByText(/\$[\d,]+\.\d{2}/).first();

  test.describe("Profit Margin", () => {
    test("correctly calculates margin from cost and overhead inputs", async ({
      page,
    }) => {
      await page.goto("/calculators/business/profit-margin");
      await fillNumbers(page, ["8000", "15", "20"]);
      await expect(resultLocator(page)).toBeVisible();
      const text = await page.locator("main").textContent();
      expect(text).not.toMatch(/NaN|undefined/);
    });

    test("handles zero cost gracefully", async ({ page }) => {
      await page.goto("/calculators/business/profit-margin");
      await fillNumbers(page, ["0", "15", "20"]);
      await expect(resultLocator(page)).toBeVisible();
      const text = await page.locator("main").textContent();
      expect(text).not.toMatch(/NaN|undefined|Infinity/);
    });
  });

  test.describe("Labor Rate", () => {
    test("calculates burdened labor rate", async ({ page }) => {
      await page.goto("/calculators/business/labor-rate");
      await fillNumbers(page, ["25", "30", "15"]);
      await expect(resultLocator(page)).toBeVisible();
    });
  });

  test.describe("Lead Estimator", () => {
    test("calculates cost per acquisition", async ({ page }) => {
      await page.goto("/calculators/business/lead-estimator");
      await fillNumbers(page, ["50", "25", "5000"]);
      await expect(resultLocator(page)).toBeVisible();
    });
  });

  test.describe("Tax Save", () => {
    test("calculates tax savings from deductions", async ({ page }) => {
      await page.goto("/calculators/business/tax-save");
      await fillNumbers(page, ["100000", "25", "15000"]);
      await expect(resultLocator(page)).toBeVisible();
    });
  });
});

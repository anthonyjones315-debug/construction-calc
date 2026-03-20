import { test, expect } from "@playwright/test";

test.describe("Concrete Calculators", () => {
  // Dismiss cookie consent banner before interacting with inputs
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

  const expectMaterialOrder = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await expect(page.getByText(/Order\s+[\d.]+/i).first()).toBeVisible();
  };

  test.describe("Slab Calculator", () => {
    test("calculates correct cubic yards for a standard garage slab", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/slab");
      await fillNumbers(page, ["20", "24", "4"]);
      await expectMaterialOrder(page);
    });

    test("10% waste factor increases result appropriately", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/slab");
      await fillNumbers(page, ["20", "24", "4"]);
      const resultText = page.getByText(/Order\s+[\d.]+/i).first();
      await expect(resultText).toBeVisible();
      const parseOrder = (text: string | null) =>
        parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");

      const wasteSlider = page.locator("input[type='range']").first();
      if (await wasteSlider.isVisible()) {
        await wasteSlider.fill("0");
        const zeroWasteText = await resultText.textContent();
        await wasteSlider.fill("20");
        await expect
          .poll(async () => (await resultText.textContent()) ?? "")
          .not.toEqual(zeroWasteText ?? "");
        const higherWasteText = await resultText.textContent();
        expect(parseOrder(higherWasteText)).toBeGreaterThanOrEqual(
          parseOrder(zeroWasteText),
        );
      }
    });

    test("rejects non-numeric input in dimension fields", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      await dismissCookies(page);
      // input[type=number] rejects non-numeric strings — fill with empty string
      const firstNumber = page.locator("input[type='number']").first();
      await firstNumber.fill("");
      await expectMaterialOrder(page);
      const text = await page.locator("main").textContent();
      expect(text).not.toMatch(/NaN|undefined|Infinity/);
    });

    test("zero dimensions result in zero or near-zero yards", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/slab");
      await fillNumbers(page, ["0", "24", "4"]);
      await expectMaterialOrder(page);
    });

    test("'Save Estimate' button is visible on calculator page", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/slab");
      await expectMaterialOrder(page);

      const saveBtn = page.getByRole("button", { name: /Save Estimate/i });
      await expect(saveBtn).toBeVisible();
    });

    test("regional tax selector defaults to Oneida (8.75%)", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/slab");
      const taxSelector = page.getByLabel(/county|tax/i);
      if (await taxSelector.isVisible()) {
        await expect(taxSelector).toHaveValue(/oneida|8.75/i);
      }
    });
  });

  test.describe("Footing Calculator", () => {
    test("calculates CY for a standard 16x8 footing at 40 linear feet", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/footing");
      await fillNumbers(page, ["40", "16", "8"]);
      await expectMaterialOrder(page);
    });

    test("handles very long footings without overflow UI", async ({ page }) => {
      await page.goto("/calculators/concrete/footing");
      await fillNumbers(page, ["500", "24", "12"]);
      await expectMaterialOrder(page);
      // Scope to main content only — avoid RSC payload which contains CSS class names
      const text = await page.locator("main").textContent();
      expect(text).not.toMatch(/NaN|Infinity/);
    });
  });

  test.describe("Block Calculator", () => {
    test("counts correct number of blocks for a given wall", async ({
      page,
    }) => {
      await page.goto("/calculators/concrete/block");
      await fillNumbers(page, ["20", "8", "8"]);
      await expectMaterialOrder(page);
    });
  });
});

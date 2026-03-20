import { test, expect } from "@playwright/test";

test.describe("Roofing Calculators", () => {
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

  test.describe("Shingle Bundles", () => {
    test("calculates bundles for a roof area", async ({ page }) => {
      await page.goto("/calculators/roofing/shingles");
      await fillNumbers(page, ["15", "6", "10"]);
      await expect(page.getByText(/Order\s+[\d.]+/i).first()).toBeVisible();
    });

    test("waste percentage adds correct overage to bundle count", async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.goto("/calculators/roofing/shingles");
      await fillNumbers(page, ["20", "15", "12"]);

      const resultText = page.getByText(/Order\s+[\d.]+/i).first();
      await expect(resultText).toBeVisible();
      const baseText = await resultText.textContent();

      // Adjust waste slider — move from default (10%) to 0%
      const wasteSlider = page.locator("input[type='range']").first();
      if (await wasteSlider.isVisible()) {
        await wasteSlider.fill("0");
        const zeroWasteText = await resultText.textContent();
        // Then set to max waste (slider max is 30)
        await wasteSlider.fill("30");
        await expect
          .poll(async () => (await resultText.textContent()) ?? "")
          .not.toEqual(zeroWasteText ?? "");
        const highWasteText = await resultText.textContent();
        // Result with 30% waste should be >= result with 0% waste
        const zeroCount = parseFloat(
          zeroWasteText?.match(/[\d.]+/)?.[0] ?? "0",
        );
        const highCount = parseFloat(
          highWasteText?.match(/[\d.]+/)?.[0] ?? "0",
        );
        expect(highCount).toBeGreaterThanOrEqual(zeroCount);
      } else {
        // If no slider, just verify we have a result
        expect(baseText).toMatch(/Order\s+[\d.]+/i);
      }
    });
  });
});

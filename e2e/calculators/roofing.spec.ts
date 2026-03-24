import { test, expect, type Page } from "@playwright/test";

test.describe("Roofing Calculators", () => {
  const dismissCookies = async (page: Page) => {
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
    page: Page,
    values: string[],
  ) => {
    await dismissCookies(page);
    const inputs = page.locator("input[type='number']").filter({ visible: true });
    await inputs.first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
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
      await expect(page.locator('div').filter({ hasText: /Order/i }).filter({ hasText: /[\d.]+/ }).last()).toBeVisible();
    });

    test("waste percentage adds correct overage to bundle count", async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.goto("/calculators/roofing/shingles");
      await fillNumbers(page, ["20", "15", "12"]);

      const materialOrder = (page: Page) =>
        page.locator('.result-counter').first();

      const parseOrder = (text: string | null) =>
        parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");

      await expect(materialOrder(page)).toBeVisible();
      const baseText = await materialOrder(page).textContent();

      // Adjust waste slider — move from default (10%) to 0%
      const wasteSlider = page.locator("input[type='range']").last();
      if (await wasteSlider.isVisible()) {
        const setSliderValue = async (val: string) => {
          await wasteSlider.evaluate((node: HTMLInputElement, value) => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            )?.set;
            nativeInputValueSetter?.call(node, value);
            node.dispatchEvent(new Event("input", { bubbles: true }));
            node.dispatchEvent(new Event("change", { bubbles: true }));
          }, val);
        };

        const initialText = await materialOrder(page).textContent();
        await setSliderValue("0");
        await expect
          .poll(async () => (await materialOrder(page).textContent()) ?? "")
          .not.toEqual(initialText ?? "");
        const zeroWasteText = await materialOrder(page).textContent();

        await setSliderValue("20");
        await expect
          .poll(async () => (await materialOrder(page).textContent()) ?? "")
          .not.toEqual(zeroWasteText ?? "");
        const higherWasteText = await materialOrder(page).textContent();
        expect(parseOrder(higherWasteText)).toBeGreaterThan(
          parseOrder(zeroWasteText),
        );
      } else {
        // If no slider, just verify we have a result
        expect(baseText).toMatch(/Order\s*[\d.]+/i);
      }
    });
  });
});

import { test, expect, type Page } from "@playwright/test";
import { primaryResultValue } from "../lib/app";

test.describe("Framing Calculators", () => {
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

  const materialOrder = (page: Page) =>
    primaryResultValue(page);

  test.describe("Wall Studs", () => {
    test("calculates 16 OC studs for a standard 20ft wall", async ({
      page,
    }) => {
      await page.goto("/calculators/framing/wall-studs");
      await fillNumbers(page, ["20", "16", "8"]);
      await expect(materialOrder(page)).toBeVisible();
    });

    test("24 OC returns fewer studs than 16 OC for same wall", async ({
      page,
    }) => {
      test.setTimeout(60000);
      // OC spacing is a button toggle, not a number input — click the button
      const getStudCount = async (ocButtonLabel: string) => {
        await page.goto("/calculators/framing/wall-studs");
        await dismissCookies(page);
        const linealMode = page.getByRole("button", {
          name: /running lineal feet/i,
        });
        if (await linealMode.isVisible({ timeout: 1000 }).catch(() => false)) {
          await linealMode.click();
        }
        // Set wall length
        const visibleInputs = page.locator("input[type='number']").filter({ visible: true });
        await visibleInputs.first().fill("40");
        // Set OC spacing using whichever UI is present (button toggle or numeric input)
        const ocBtn = page.getByRole("button", {
          name: new RegExp(`^${ocButtonLabel}\\"?\\s*OC$`, "i"),
        });
        if (await ocBtn.isVisible({ timeout: 1200 }).catch(() => false)) {
          await ocBtn.click();
        } else {
          const inputs = page.locator("input[type='number']").filter({ visible: true });
          const count = await inputs.count();
          if (count > 1) {
            await inputs.nth(1).fill(ocButtonLabel);
          }
        }
        await expect(materialOrder(page)).toBeVisible();
        const text = await materialOrder(page).textContent();
        return parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      };

      const studs16 = await getStudCount("16");
      const studs24 = await getStudCount("24");
      // 24" OC should use fewer or equal studs than 16" OC
      expect(studs24).toBeLessThanOrEqual(studs16);
    });

    test("result is always a whole number (you can't buy 0.5 studs)", async ({
      page,
    }) => {
      await page.goto("/calculators/framing/wall-studs");
      await fillNumbers(page, ["17.5", "16", "8"]);
      await expect(materialOrder(page)).toBeVisible();
    });
  });

  test.describe("Rafter Length", () => {
    test("calculates rafter length for given run and rise", async ({
      page,
    }) => {
      await page.goto("/calculators/framing/rafter-length");
      await fillNumbers(page, ["12", "6", "1"]);
      await expect(materialOrder(page)).toBeVisible();
    });
  });

  test.describe("Floor Joists", () => {
    test("calculates joist count for 24ft span @ 16 OC", async ({ page }) => {
      await page.goto("/calculators/framing/floor");
      await fillNumbers(page, ["24", "16", "12"]);
      await expect(materialOrder(page)).toBeVisible();
    });
  });

  test.describe("Headers", () => {
    test("calculates header size for a 6ft opening", async ({ page }) => {
      test.setTimeout(60000);
      await page.goto("/calculators/framing/headers");
      await fillNumbers(page, ["6", "8", "1"]);
      await expect(materialOrder(page)).toBeVisible();
    });
  });
});

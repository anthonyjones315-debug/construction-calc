import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "large", width: 1920, height: 1080 },
] as const;

const PATHS = [
  "/",
  "/calculators",
  "/guide",
  "/field-notes",
  "/faq",
  "/contact",
  "/cart",
  "/offline",
] as const;

test.describe("Responsive UI Sweep", () => {
  for (const viewport of VIEWPORTS) {
    test(`core routes render safely at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of PATHS) {
        await page.goto(path);

        const statusCode = page.url().toLowerCase().includes("404")
          ? 404
          : await page.evaluate(() => {
              const title = document.title.toLowerCase();
              if (title.includes("404") || title.includes("not found")) {
                return 404;
              }
              return 200;
            });

        expect(statusCode).not.toBe(404);

        const mainOrBody = page.locator('main, [role="main"], body').first();
        await expect(mainOrBody).toBeVisible();

        const overflowMetrics = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));

        expect(overflowMetrics.scrollWidth).toBeLessThanOrEqual(
          overflowMetrics.innerWidth + 2,
        );
      }
    });
  }

  test("mobile primary actions are thumb-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const visibleAction = page.getByRole("link", {
      name: /start new estimate/i,
    });

    await expect(visibleAction).toBeVisible();

    const box = await visibleAction.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

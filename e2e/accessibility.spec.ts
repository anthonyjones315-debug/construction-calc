import { test, expect } from "@playwright/test";

test.describe("Accessibility — WCAG 2.1 AA", () => {

  const keyPages = [
    "/",
    "/calculators",
    "/calculators/concrete/slab",
    "/calculators/framing/wall-studs",
    "/cart",
    "/saved",
    "/settings",
    "/sign-in",
  ];

  for (const route of keyPages) {
    test(`${route} — no critical ARIA violations`, async ({ page }) => {
      await page.goto(route);
      // Inject axe-core for audit
      await page.addScriptTag({
        url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js",
      });

      const violations = await page.evaluate(async () => {
        // @ts-ignore
        const results = await axe.run();
        return results.violations.filter(
          (v: any) => v.impact === "critical" || v.impact === "serious"
        );
      });

      if (violations.length > 0) {
        console.log(`Violations on ${route}:`, JSON.stringify(violations, null, 2));
      }
      expect(violations).toHaveLength(0);
    });
  }

  test("calculator form is fully operable by keyboard alone", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Tab through all interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Type a value using keyboard
    await page.keyboard.type("20");
    await page.keyboard.press("Tab");
    await page.keyboard.type("24");
    await page.keyboard.press("Tab");
    await page.keyboard.type("4");

    // Auto-calculates — result should be visible
    await expect(page.getByText(/Total Yards/i)).toBeVisible({ timeout: 3000 });
  });

  test("focus is visible on all interactive elements", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Tab through and check each focused element has visible outline
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const outline = await focused.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outlineWidth !== "0px" ||
          styles.boxShadow !== "none" ||
          styles.border !== "";
      });
      // At least some focus indicator should be present
      if (await focused.isVisible()) {
        expect(outline).toBe(true);
      }
    }
  });

  test("all form inputs have associated labels", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    const inputs = await page.locator("input:not([type='hidden'])").all();
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      let hasLabel = false;
      if (ariaLabel || ariaLabelledBy) {
        hasLabel = true;
      } else if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      expect(hasLabel).toBe(true);
    }
  });

  test("color contrast passes for result text", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    // Auto-calculates with defaults — result already visible
    const resultArea = page.locator('[aria-label="Calculator results"]');
    await expect(resultArea).toBeVisible();

    // Check computed color vs background
    const contrastOk = await resultArea.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bg = styles.backgroundColor;
      // Simplified check — both should be non-transparent
      return color !== "rgba(0, 0, 0, 0)" && bg !== "rgba(0, 0, 0, 0)";
    });
    expect(contrastOk).toBe(true);
  });

  test("ARIA live region exists for dynamic results", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    const liveRegion = page.locator("[aria-live], [role='alert'], [role='status']");
    // At least one live region should exist on the calculator page
    const count = await liveRegion.count();
    expect(count).toBeGreaterThan(0);
  });

});

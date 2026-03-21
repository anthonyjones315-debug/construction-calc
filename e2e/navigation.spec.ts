import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads and renders calculator directory CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /calculators/i }).first(),
    ).toBeVisible();
  });

  test("calculators directory shows all trade categories", async ({ page }) => {
    await page.goto("/calculators");
    // Verify at least the core categories are present
    const categories = ["Concrete", "Framing", "Roofing", "Business"];
    for (const cat of categories) {
      await expect(page.getByText(new RegExp(cat, "i")).first()).toBeVisible();
    }
  });

  test("deep link to specific calculator works directly", async ({ page }) => {
    await page.goto("/calculators/concrete/slab", {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await expect(page.getByRole("heading", { name: /slab/i })).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByLabel(/length/i)).toBeVisible({ timeout: 90_000 });
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/calculators/fake-category/nonexistent-calc");
    await expect(
      page.getByRole("heading", { name: /page not found/i }),
    ).toBeVisible();
    // Should NOT show a full crash
    await expect(
      page.getByText(/unhandled exception|application error/i),
    ).not.toBeVisible();
  });

  test("back button after calculator returns to calculators directory", async ({
    page,
  }) => {
    await page.goto("/calculators");
    await page.goto("/calculators/concrete/slab");
    await page.goBack();
    await expect(page).toHaveURL(/\/calculators$/);
  });

  test("saved page stays on URL and prompts guests to sign in", async ({
    browser,
  }) => {
    const context = await browser.newContext(); // No auth state
    const page = await context.newPage();
    await page.goto("/saved", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await expect(page).toHaveURL(/\/saved$/);
    await expect(
      page.getByRole("heading", { name: /sign in to view saved estimates/i }),
    ).toBeVisible({ timeout: 60_000 });
    await context.close();
  });

  test("field notes loads and renders content", async ({ page }) => {
    await page.goto("/field-notes", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: /field notes/i }),
    ).toBeVisible();
  });
});

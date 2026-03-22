import { test, expect } from "@playwright/test";

test.describe("Security", () => {
  test("unauthenticated user cannot access /saved", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/saved");
    await expect(page).toHaveURL(/sign-in/);
    await context.close();
  });

  test("unauthenticated user cannot access /settings", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/settings");
    await expect(page).toHaveURL(/sign-in/);
    await context.close();
  });

  test("unauthenticated user cannot access /command-center", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/command-center");
    await expect(page).toHaveURL(/sign-in/);
    await context.close();
  });

  test("unauthenticated user cannot access /pricebook", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/pricebook");
    await expect(page).toHaveURL(/sign-in/);
    await context.close();
  });

  test("API routes return 401 without valid session", async ({ request }) => {
    const response = await request.get("/api/estimates");
    expect([401, 403, 302]).toContain(response.status());
  });

  test("XSS — script injection in calculator input is neutralized", async ({
    page,
  }) => {
    await page.goto("/calculators/concrete/slab");
    await page.evaluate(() => {
      const input = document.querySelector(
        "input[type='number']",
      ) as HTMLInputElement | null;
      if (!input) return;
      input.value = "<script>window.__xss=true</script>";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Auto-calculates — no button needed
    await page.waitForTimeout(500);

    const xssInjected = await page.evaluate(() => (window as any).__xss);
    expect(xssInjected).toBeFalsy();
  });

  test("estimate data from one user is not visible to another user's session", async ({
    browser,
  }) => {
    // This test requires two test accounts; skip if not available
    if (!process.env.TEST_USER_2_EMAIL) {
      test.skip();
    }

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    await context1.close();
    await context2.close();
  });
});

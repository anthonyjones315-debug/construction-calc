import { test, expect } from "@playwright/test";

test.describe("Clerk authentication pages", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("legacy /register redirects to sign-up", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

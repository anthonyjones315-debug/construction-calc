import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/auth/signin");

  await page.getByLabel("Email").fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard or calculators
  await page.waitForURL(/\/(calculators|dashboard|saved)?$/);
  await expect(page).not.toHaveURL(/auth\/signin/);

  await page.context().storageState({ path: authFile });
});
